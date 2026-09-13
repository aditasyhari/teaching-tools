import { Injectable, Logger } from '@nestjs/common';
import type {
  RaisedHandItem,
  TeacherRaiseHandSnapshot,
  ParticipantRaiseHandSnapshot,
} from '@walikelas/types';

interface ActiveRaiseHandState {
  sessionId: string;
  hands: Map<string, RaisedHandItem>;
  currentSpeakerHandId: string | null;
  participantHandMap: Map<string, string>; // participantId -> handId
  rateLimits: Map<string, number>; // participantId -> timestamp
}

@Injectable()
export class RaiseHandRuntimeService {
  private readonly logger = new Logger(RaiseHandRuntimeService.name);

  // sessionId -> ActiveRaiseHandState
  private readonly sessions = new Map<string, ActiveRaiseHandState>();

  private getOrCreateSession(sessionId: string): ActiveRaiseHandState {
    let state = this.sessions.get(sessionId);
    if (!state) {
      state = {
        sessionId,
        hands: new Map<string, RaisedHandItem>(),
        currentSpeakerHandId: null,
        participantHandMap: new Map<string, string>(),
        rateLimits: new Map<string, number>(),
      };
      this.sessions.set(sessionId, state);
    }
    return state;
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Participant raises hand.
   * Server-authoritative:
   * - 3-second action cooldown
   * - Duplicate active raise prevention
   * - Sets status to RAISED with raisedAt timestamp
   */
  raiseHand(
    sessionId: string,
    participantId: string,
    displayName: string,
  ): {
    accepted: boolean;
    hand?: RaisedHandItem;
    error?: string;
  } {
    const sessionState = this.getOrCreateSession(sessionId);
    const now = Date.now();

    // 3-second cooldown per participant
    const lastActionAt = sessionState.rateLimits.get(participantId);
    if (lastActionAt && now - lastActionAt < 3000) {
      const waitSeconds = Math.ceil((3000 - (now - lastActionAt)) / 1000);
      return {
        accepted: false,
        error: `Mohon tunggu ${waitSeconds} detik sebelum melakukan aksi lagi`,
      };
    }

    // Check if participant already has an active raised hand
    const existingHandId = sessionState.participantHandMap.get(participantId);
    if (existingHandId) {
      const existing = sessionState.hands.get(existingHandId);
      if (
        existing &&
        (existing.status === 'RAISED' ||
          existing.status === 'ACKNOWLEDGED' ||
          existing.status === 'SPEAKING')
      ) {
        return {
          accepted: false,
          error: 'Anda sudah mengangkat tangan',
        };
      }
    }

    // Capacity limit (max 100 active hands)
    const activeCount = Array.from(sessionState.hands.values()).filter(
      (h) => h.status !== 'LOWERED',
    ).length;
    if (activeCount >= 100) {
      return {
        accepted: false,
        error: 'Antrean angkat tangan kelas telah mencapai batas maksimal',
      };
    }

    const id = `hand_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const hand: RaisedHandItem = {
      id,
      sessionId,
      participantId,
      displayName: displayName?.trim() || 'Peserta',
      status: 'RAISED',
      raisedAt: now,
    };

    sessionState.hands.set(id, hand);
    sessionState.participantHandMap.set(participantId, id);
    sessionState.rateLimits.set(participantId, now);

    this.logger.log(`Hand raised in session ${sessionId} by ${hand.displayName} (ID: ${id})`);

    return {
      accepted: true,
      hand,
    };
  }

  /**
   * Participant self-lowers hand.
   * Allowed only when status is RAISED or ACKNOWLEDGED.
   * Participants cannot self-lower while SPEAKING (teacher controls speaker turns).
   */
  lowerHand(
    sessionId: string,
    participantId: string,
  ): {
    accepted: boolean;
    hand?: RaisedHandItem;
    error?: string;
  } {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) {
      return { accepted: false, error: 'Anda tidak sedang mengangkat tangan' };
    }

    const handId = sessionState.participantHandMap.get(participantId);
    if (!handId) {
      return { accepted: false, error: 'Anda tidak sedang mengangkat tangan' };
    }

    const hand = sessionState.hands.get(handId);
    if (!hand || hand.status === 'LOWERED') {
      return { accepted: false, error: 'Anda tidak sedang mengangkat tangan' };
    }

    if (hand.status === 'SPEAKING') {
      return {
        accepted: false,
        error: 'Giliran berbicara hanya dapat diselesaikan oleh guru',
      };
    }

    const now = Date.now();
    hand.status = 'LOWERED';
    hand.loweredAt = now;
    sessionState.participantHandMap.delete(participantId);
    sessionState.rateLimits.set(participantId, now);

    this.logger.log(
      `Hand self-lowered in session ${sessionId} by ${hand.displayName} (ID: ${hand.id})`,
    );

    return {
      accepted: true,
      hand,
    };
  }

  /**
   * Teacher acknowledges hand in queue.
   * Transitions RAISED -> ACKNOWLEDGED.
   */
  acknowledgeHand(sessionId: string, handId: string): RaisedHandItem | null {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) return null;

    const hand = sessionState.hands.get(handId);
    if (!hand || hand.status !== 'RAISED') {
      return null;
    }

    const now = Date.now();
    hand.status = 'ACKNOWLEDGED';
    hand.acknowledgedAt = now;

    this.logger.log(
      `Hand acknowledged in session ${sessionId} for ${hand.displayName} (ID: ${hand.id})`,
    );
    return hand;
  }

  /**
   * Teacher grants speaking turn.
   * Strict Invariant: At most ONE participant in SPEAKING state per session.
   */
  startSpeaking(
    sessionId: string,
    handId: string,
  ): {
    accepted: boolean;
    hand?: RaisedHandItem;
    error?: string;
  } {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) {
      return { accepted: false, error: 'Sesi tidak ditemukan' };
    }

    const hand = sessionState.hands.get(handId);
    if (!hand || hand.status === 'LOWERED') {
      return {
        accepted: false,
        error: 'Antrean angkat tangan tidak ditemukan atau sudah diturunkan',
      };
    }

    // Check if there is already a speaking participant
    if (sessionState.currentSpeakerHandId && sessionState.currentSpeakerHandId !== handId) {
      const activeSpeaker = sessionState.hands.get(sessionState.currentSpeakerHandId);
      if (activeSpeaker && activeSpeaker.status === 'SPEAKING') {
        return {
          accepted: false,
          error: 'Masih ada peserta yang sedang berbicara. Harap selesaikan giliran sebelumnya.',
        };
      }
    }

    const now = Date.now();
    hand.status = 'SPEAKING';
    hand.speakingAt = now;
    sessionState.currentSpeakerHandId = hand.id;

    this.logger.log(
      `Speaking turn started in session ${sessionId} for ${hand.displayName} (ID: ${hand.id})`,
    );

    return {
      accepted: true,
      hand,
    };
  }

  /**
   * Teacher lowers a specific participant's hand or finishes their speaking turn.
   */
  lowerParticipantHand(sessionId: string, handId: string): RaisedHandItem | null {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) return null;

    const hand = sessionState.hands.get(handId);
    if (!hand || hand.status === 'LOWERED') {
      return null;
    }

    const now = Date.now();
    hand.status = 'LOWERED';
    hand.loweredAt = now;

    if (sessionState.currentSpeakerHandId === hand.id) {
      sessionState.currentSpeakerHandId = null;
    }
    sessionState.participantHandMap.delete(hand.participantId);

    this.logger.log(
      `Hand lowered by teacher in session ${sessionId} for ${hand.displayName} (ID: ${hand.id})`,
    );
    return hand;
  }

  /**
   * Teacher lowers all hands in the session.
   */
  lowerAllHands(sessionId: string): number {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) return 0;

    const now = Date.now();
    let count = 0;

    for (const hand of sessionState.hands.values()) {
      if (hand.status !== 'LOWERED') {
        hand.status = 'LOWERED';
        hand.loweredAt = now;
        count++;
      }
    }

    sessionState.currentSpeakerHandId = null;
    sessionState.participantHandMap.clear();

    this.logger.log(`All hands lowered by teacher in session ${sessionId} (${count} hands)`);
    return count;
  }

  /**
   * Build authoritative teacher snapshot:
   * - queue: All active hands with status RAISED or ACKNOWLEDGED, sorted strictly by raisedAt ASC
   * - currentSpeaker: The hand currently in SPEAKING status (if any)
   * - raisedCount: Total count in queue
   */
  getTeacherSnapshot(sessionId: string): TeacherRaiseHandSnapshot {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) {
      return {
        queue: [],
        currentSpeaker: null,
        raisedCount: 0,
      };
    }

    const queue: RaisedHandItem[] = [];
    let currentSpeaker: RaisedHandItem | null = null;

    for (const hand of sessionState.hands.values()) {
      if (hand.status === 'SPEAKING') {
        currentSpeaker = hand;
      } else if (hand.status === 'RAISED' || hand.status === 'ACKNOWLEDGED') {
        queue.push(hand);
      }
    }

    // Sort queue strictly by raisedAt ASC
    queue.sort((a, b) => a.raisedAt - b.raisedAt);

    return {
      queue,
      currentSpeaker,
      raisedCount: queue.length,
    };
  }

  /**
   * Build authoritative participant snapshot:
   * - myHand: The participant's active hand (RAISED, ACKNOWLEDGED, or SPEAKING), or null
   * - currentSpeaker: Display name of current speaker, or null
   * - queuePosition: 1-based index in queue if RAISED/ACKNOWLEDGED, otherwise null
   * - totalRaisedCount: Total participants in queue
   */
  getParticipantSnapshot(sessionId: string, participantId: string): ParticipantRaiseHandSnapshot {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) {
      return {
        myHand: null,
        currentSpeaker: null,
        queuePosition: null,
        totalRaisedCount: 0,
      };
    }

    const queue: RaisedHandItem[] = [];
    let currentSpeaker: { displayName: string } | null = null;
    let myHand: RaisedHandItem | null = null;

    for (const hand of sessionState.hands.values()) {
      if (hand.status === 'SPEAKING') {
        currentSpeaker = { displayName: hand.displayName };
        if (hand.participantId === participantId) {
          myHand = hand;
        }
      } else if (hand.status === 'RAISED' || hand.status === 'ACKNOWLEDGED') {
        queue.push(hand);
        if (hand.participantId === participantId) {
          myHand = hand;
        }
      }
    }

    queue.sort((a, b) => a.raisedAt - b.raisedAt);

    let queuePosition: number | null = null;
    if (myHand && (myHand.status === 'RAISED' || myHand.status === 'ACKNOWLEDGED')) {
      const idx = queue.findIndex((h) => h.id === myHand!.id);
      if (idx !== -1) {
        queuePosition = idx + 1;
      }
    }

    return {
      myHand,
      currentSpeaker,
      queuePosition,
      totalRaisedCount: queue.length,
    };
  }

  /**
   * Clear session state when session ends.
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.log(`Cleared Raise Hand state for session ${sessionId}`);
  }
}
