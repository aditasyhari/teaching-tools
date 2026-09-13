import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RaiseHandRuntimeService } from '../raise-hand-runtime.service';

describe('RaiseHandRuntimeService', () => {
  let service: RaiseHandRuntimeService;
  const sessionId = 'session_raise_test';

  beforeEach(() => {
    service = new RaiseHandRuntimeService();
  });

  describe('raiseHand', () => {
    it('should raise hand successfully with status RAISED', () => {
      const result = service.raiseHand(sessionId, 'part_1', 'Budi Santoso');

      expect(result.accepted).toBe(true);
      expect(result.hand).toBeDefined();
      expect(result.hand?.displayName).toBe('Budi Santoso');
      expect(result.hand?.participantId).toBe('part_1');
      expect(result.hand?.status).toBe('RAISED');
      expect(result.hand?.raisedAt).toBeGreaterThan(0);
    });

    it('should reject duplicate raise if participant already has active raised hand', () => {
      const first = service.raiseHand(sessionId, 'part_1', 'Budi Santoso');
      expect(first.accepted).toBe(true);

      // Advance time past 3s cooldown to isolate duplicate check
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 5000);

      const second = service.raiseHand(sessionId, 'part_1', 'Budi Santoso');
      expect(second.accepted).toBe(false);
      expect(second.error).toContain('Anda sudah mengangkat tangan');

      vi.restoreAllMocks();
    });

    it('should enforce 3-second action cooldown', () => {
      const first = service.raiseHand(sessionId, 'part_1', 'Budi');
      expect(first.accepted).toBe(true);

      const second = service.raiseHand(sessionId, 'part_1', 'Budi');
      expect(second.accepted).toBe(false);
      expect(second.error).toContain('Mohon tunggu 3 detik');
    });
  });

  describe('lowerHand (participant self-lower)', () => {
    it('should allow participant to self-lower hand when RAISED', () => {
      service.raiseHand(sessionId, 'part_1', 'Budi');

      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 4000);
      const lower = service.lowerHand(sessionId, 'part_1');

      expect(lower.accepted).toBe(true);
      expect(lower.hand?.status).toBe('LOWERED');
      expect(lower.hand?.loweredAt).toBeGreaterThan(0);

      vi.restoreAllMocks();
    });

    it('should allow participant to self-lower hand when ACKNOWLEDGED', () => {
      const raised = service.raiseHand(sessionId, 'part_1', 'Budi');
      service.acknowledgeHand(sessionId, raised.hand!.id);

      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 4000);
      const lower = service.lowerHand(sessionId, 'part_1');

      expect(lower.accepted).toBe(true);
      expect(lower.hand?.status).toBe('LOWERED');

      vi.restoreAllMocks();
    });

    it('should reject self-lower when SPEAKING (only teacher can end speaking turn)', () => {
      const raised = service.raiseHand(sessionId, 'part_1', 'Budi');
      service.startSpeaking(sessionId, raised.hand!.id);

      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 4000);
      const lower = service.lowerHand(sessionId, 'part_1');

      expect(lower.accepted).toBe(false);
      expect(lower.error).toContain('Giliran berbicara hanya dapat diselesaikan oleh guru');

      vi.restoreAllMocks();
    });

    it('should reject lowerHand if participant is not raising hand', () => {
      const result = service.lowerHand(sessionId, 'unknown_part');
      expect(result.accepted).toBe(false);
      expect(result.error).toContain('Anda tidak sedang mengangkat tangan');
    });
  });

  describe('acknowledgeHand (teacher)', () => {
    it('should transition RAISED hand to ACKNOWLEDGED', () => {
      const res = service.raiseHand(sessionId, 'part_1', 'Siti');
      const handId = res.hand!.id;

      const acknowledged = service.acknowledgeHand(sessionId, handId);
      expect(acknowledged).not.toBeNull();
      expect(acknowledged?.status).toBe('ACKNOWLEDGED');
      expect(acknowledged?.acknowledgedAt).toBeGreaterThan(0);
    });

    it('should return null for invalid handId', () => {
      const acknowledged = service.acknowledgeHand(sessionId, 'invalid_id');
      expect(acknowledged).toBeNull();
    });
  });

  describe('startSpeaking (teacher)', () => {
    it('should transition hand to SPEAKING and set current speaker', () => {
      const res = service.raiseHand(sessionId, 'part_1', 'Ahmad');
      const handId = res.hand!.id;

      const result = service.startSpeaking(sessionId, handId);
      expect(result.accepted).toBe(true);
      expect(result.hand?.status).toBe('SPEAKING');
      expect(result.hand?.speakingAt).toBeGreaterThan(0);

      const snapshot = service.getTeacherSnapshot(sessionId);
      expect(snapshot.currentSpeaker?.id).toBe(handId);
    });

    it('should enforce strict 1-speaker invariant', () => {
      const h1 = service.raiseHand(sessionId, 'part_1', 'Ahmad');
      const h2 = service.raiseHand(sessionId, 'part_2', 'Budi');

      const s1 = service.startSpeaking(sessionId, h1.hand!.id);
      expect(s1.accepted).toBe(true);

      // Attempt to start second speaker while first is speaking
      const s2 = service.startSpeaking(sessionId, h2.hand!.id);
      expect(s2.accepted).toBe(false);
      expect(s2.error).toContain('Masih ada peserta yang sedang berbicara');
    });
  });

  describe('lowerParticipantHand and lowerAllHands (teacher)', () => {
    it('should lower specific participant hand and release speaking slot if speaking', () => {
      const res = service.raiseHand(sessionId, 'part_1', 'Ahmad');
      service.startSpeaking(sessionId, res.hand!.id);

      const lowered = service.lowerParticipantHand(sessionId, res.hand!.id);
      expect(lowered?.status).toBe('LOWERED');

      const snapshot = service.getTeacherSnapshot(sessionId);
      expect(snapshot.currentSpeaker).toBeNull();
    });

    it('should lower all hands and reset current speaker', () => {
      const h1 = service.raiseHand(sessionId, 'part_1', 'Ahmad');
      service.raiseHand(sessionId, 'part_2', 'Budi');
      service.startSpeaking(sessionId, h1.hand!.id);

      const count = service.lowerAllHands(sessionId);
      expect(count).toBe(2);

      const snapshot = service.getTeacherSnapshot(sessionId);
      expect(snapshot.queue).toHaveLength(0);
      expect(snapshot.currentSpeaker).toBeNull();
      expect(snapshot.raisedCount).toBe(0);
    });
  });

  describe('snapshots and queue ordering', () => {
    it('should sort queue strictly by raisedAt ASC', () => {
      let now = 1000;
      vi.spyOn(Date, 'now').mockImplementation(() => now);

      service.raiseHand(sessionId, 'part_1', 'First');

      now = 2000;
      service.raiseHand(sessionId, 'part_2', 'Second');

      now = 3000;
      service.raiseHand(sessionId, 'part_3', 'Third');

      const teacherSnap = service.getTeacherSnapshot(sessionId);
      expect(teacherSnap.queue).toHaveLength(3);
      expect(teacherSnap.queue[0].displayName).toBe('First');
      expect(teacherSnap.queue[1].displayName).toBe('Second');
      expect(teacherSnap.queue[2].displayName).toBe('Third');
      expect(teacherSnap.raisedCount).toBe(3);

      const part2Snap = service.getParticipantSnapshot(sessionId, 'part_2');
      expect(part2Snap.queuePosition).toBe(2);
      expect(part2Snap.totalRaisedCount).toBe(3);
      expect(part2Snap.myHand?.displayName).toBe('Second');

      vi.restoreAllMocks();
    });

    it('should provide current speaker info in participant snapshot', () => {
      const res = service.raiseHand(sessionId, 'part_1', 'Speaker Person');
      service.startSpeaking(sessionId, res.hand!.id);

      service.raiseHand(sessionId, 'part_2', 'Listener Person');
      const snap = service.getParticipantSnapshot(sessionId, 'part_2');

      expect(snap.currentSpeaker).toEqual({ displayName: 'Speaker Person' });
      expect(snap.queuePosition).toBe(1); // part_2 is first in the waiting queue
    });
  });

  describe('clearSession', () => {
    it('should clear all session state', () => {
      service.raiseHand(sessionId, 'part_1', 'Ahmad');
      expect(service.hasSession(sessionId)).toBe(true);

      service.clearSession(sessionId);
      expect(service.hasSession(sessionId)).toBe(false);
      expect(service.getTeacherSnapshot(sessionId).queue).toHaveLength(0);
    });
  });
});
