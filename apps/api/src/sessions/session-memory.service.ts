import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { SessionParticipant } from '@walikelas/types';
import { randomUUID } from 'crypto';

interface SocketEntry {
  socketId: string;
  sessionId: string;
  participantId: string;
  role: 'TEACHER' | 'PARTICIPANT';
}

/**
 * Single-instance in-memory session presence service.
 * Manages transient realtime presence without writing high-frequency ticks to PostgreSQL.
 *
 * NOTE: For V1, this operates in a single NestJS process instance.
 * For future multi-instance horizontal scaling, this service's interface is designed
 * to be backed by Redis Pub/Sub and Redis Hashes.
 */
@Injectable()
export class SessionMemoryService implements OnModuleDestroy {
  private readonly logger = new Logger(SessionMemoryService.name);

  // sessionId -> (participantId -> SessionParticipant)
  private readonly sessions = new Map<string, Map<string, SessionParticipant>>();

  // socketId -> SocketEntry
  private readonly sockets = new Map<string, SocketEntry>();

  // sessionId -> Set<socketId> (teacher sockets)
  private readonly teacherSockets = new Map<string, Set<string>>();

  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically clean up participants who have been offline for > 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleParticipants(10 * 60 * 1000);
    }, 60 * 1000);
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.sessions.clear();
    this.sockets.clear();
    this.teacherSockets.clear();
  }

  /**
   * Add a new participant or reconnect an existing participant.
   */
  addParticipant(
    sessionId: string,
    displayName: string,
    existingParticipantId?: string,
    socketId?: string,
    reconnectToken?: string,
  ): SessionParticipant {
    let sessionMap = this.sessions.get(sessionId);
    if (!sessionMap) {
      sessionMap = new Map<string, SessionParticipant>();
      this.sessions.set(sessionId, sessionMap);
    }

    const now = new Date().toISOString();

    // Reconnect existing participant if ID matches AND reconnectToken matches
    if (existingParticipantId && sessionMap.has(existingParticipantId)) {
      const existing = sessionMap.get(existingParticipantId)!;
      // SEC-002: Reconnect token validation to prevent identity hijacking
      if (!existing.reconnectToken || existing.reconnectToken === reconnectToken) {
        existing.isOnline = true;
        existing.lastSeenAt = now;
        if (!existing.reconnectToken) {
          existing.reconnectToken = `rt_${randomUUID().replace(/-/g, '')}`;
        }
        if (socketId) {
          this.sockets.set(socketId, {
            socketId,
            sessionId,
            participantId: existing.id,
            role: 'PARTICIPANT',
          });
        }
        this.logger.log(
          `Participant reconnected: [${existing.displayName}] (ID: ${existing.id}) in session ${sessionId}`,
        );
        return existing;
      }

      this.logger.warn(
        `Participant identity hijacking rejected for ID ${existingParticipantId} in session ${sessionId}. Creating new participant.`,
      );
    }

    // New participant
    const id = `p_${randomUUID()}`;
    const token = `rt_${randomUUID().replace(/-/g, '')}`;
    const participant: SessionParticipant = {
      id,
      sessionId,
      displayName: displayName.trim(),
      joinedAt: now,
      lastSeenAt: now,
      isOnline: true,
      reconnectToken: token,
    };

    sessionMap.set(id, participant);

    if (socketId) {
      this.sockets.set(socketId, {
        socketId,
        sessionId,
        participantId: id,
        role: 'PARTICIPANT',
      });
    }

    this.logger.log(
      `Participant joined: [${participant.displayName}] (ID: ${id}) in session ${sessionId}`,
    );

    return participant;
  }

  /**
   * Register a teacher's socket connection for a session.
   */
  registerTeacher(sessionId: string, socketId: string): void {
    let teachers = this.teacherSockets.get(sessionId);
    if (!teachers) {
      teachers = new Set<string>();
      this.teacherSockets.set(sessionId, teachers);
    }
    teachers.add(socketId);

    this.sockets.set(socketId, {
      socketId,
      sessionId,
      participantId: 'teacher',
      role: 'TEACHER',
    });

    this.logger.log(`Teacher connected: session ${sessionId} (socket: ${socketId})`);
  }

  /**
   * Get all teacher socket IDs in a session.
   */
  getTeacherSockets(sessionId: string): string[] {
    const teachers = this.teacherSockets.get(sessionId);
    return teachers ? Array.from(teachers) : [];
  }

  /**
   * Get all participants in a session.
   */
  getParticipants(sessionId: string): SessionParticipant[] {
    const map = this.sessions.get(sessionId);
    return map ? Array.from(map.values()) : [];
  }

  /**
   * Get active/online participants in a session.
   */
  getOnlineParticipantCount(sessionId: string): number {
    const map = this.sessions.get(sessionId);
    if (!map) return 0;
    let count = 0;
    for (const p of map.values()) {
      if (p.isOnline) count++;
    }
    return count;
  }

  /**
   * Get a specific participant by ID.
   */
  getParticipant(sessionId: string, participantId: string): SessionParticipant | undefined {
    return this.sessions.get(sessionId)?.get(participantId);
  }

  /**
   * Record a heartbeat from a participant.
   */
  touchParticipant(sessionId: string, participantId: string): boolean {
    const participant = this.getParticipant(sessionId, participantId);
    if (!participant) return false;
    participant.lastSeenAt = new Date().toISOString();
    participant.isOnline = true;
    return true;
  }

  /**
   * Look up socket entry by socketId.
   */
  getSocketEntry(socketId: string): SocketEntry | undefined {
    return this.sockets.get(socketId);
  }

  /**
   * Handle socket disconnection.
   */
  handleDisconnect(socketId: string): {
    sessionId: string;
    participant?: SessionParticipant;
    role: 'TEACHER' | 'PARTICIPANT';
  } | null {
    const entry = this.sockets.get(socketId);
    if (!entry) return null;

    this.sockets.delete(socketId);

    if (entry.role === 'TEACHER') {
      const teachers = this.teacherSockets.get(entry.sessionId);
      if (teachers) {
        teachers.delete(socketId);
        if (teachers.size === 0) {
          this.teacherSockets.delete(entry.sessionId);
        }
      }
      this.logger.log(`Teacher disconnected from session ${entry.sessionId}`);
      return { sessionId: entry.sessionId, role: 'TEACHER' };
    }

    // Participant disconnect: check if participant has other active sockets (e.g. multi-tab)
    const hasOtherSockets = Array.from(this.sockets.values()).some(
      (s) => s.sessionId === entry.sessionId && s.participantId === entry.participantId,
    );

    const participant = this.getParticipant(entry.sessionId, entry.participantId);
    if (participant && !hasOtherSockets) {
      participant.isOnline = false;
      this.logger.log(
        `Participant marked offline: [${participant.displayName}] (ID: ${participant.id}) in session ${entry.sessionId}`,
      );
    }

    return {
      sessionId: entry.sessionId,
      participant,
      role: 'PARTICIPANT',
    };
  }

  /**
   * Clear all transient state for an ended session.
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.teacherSockets.delete(sessionId);

    // Clean up socket entries pointing to this session
    for (const [socketId, entry] of this.sockets.entries()) {
      if (entry.sessionId === sessionId) {
        this.sockets.delete(socketId);
      }
    }

    this.logger.log(`In-memory session state cleared for session ${sessionId}`);
  }

  /**
   * Periodic cleanup of stale offline participants.
   */
  cleanupStaleParticipants(maxOfflineMs: number): void {
    const cutoff = Date.now() - maxOfflineMs;

    for (const [sessionId, map] of this.sessions.entries()) {
      for (const [pId, p] of map.entries()) {
        if (!p.isOnline && new Date(p.lastSeenAt).getTime() < cutoff) {
          map.delete(pId);
          this.logger.debug(`Purged stale participant ${pId} from session ${sessionId}`);
        }
      }
      if (map.size === 0 && !this.teacherSockets.has(sessionId)) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
