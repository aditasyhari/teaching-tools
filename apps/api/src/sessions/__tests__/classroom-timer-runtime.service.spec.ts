import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClassroomTimerRuntimeService } from '../classroom-timer-runtime.service';

describe('ClassroomTimerRuntimeService', () => {
  let service: ClassroomTimerRuntimeService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new ClassroomTimerRuntimeService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('setTimer', () => {
    it('initializes timer with clamped duration and IDLE status', () => {
      const state = service.setTimer('sess-1', 60, 'Latihan Soal', 'SHARED_TIMER');

      expect(state.sessionId).toBe('sess-1');
      expect(state.duration).toBe(60);
      expect(state.remainingSeconds).toBe(60);
      expect(state.label).toBe('Latihan Soal');
      expect(state.visibility).toBe('SHARED_TIMER');
      expect(state.status).toBe('IDLE');
    });

    it('clamps duration between 5 and 3600 seconds', () => {
      const tooLow = service.setTimer('sess-1', 2);
      expect(tooLow.duration).toBe(5);

      const tooHigh = service.setTimer('sess-2', 5000);
      expect(tooHigh.duration).toBe(3600);
    });
  });

  describe('startTimer', () => {
    it('transitions to RUNNING and sets endsAt', () => {
      const startTime = 100000;
      vi.setSystemTime(startTime);

      const state = service.startTimer('sess-1', { duration: 120, label: 'Diskusi' });

      expect(state.status).toBe('RUNNING');
      expect(state.duration).toBe(120);
      expect(state.remainingSeconds).toBe(120);
      expect(state.startedAt).toBe(startTime);
      expect(state.endsAt).toBe(startTime + 120 * 1000);
    });

    it('auto-completes and fires listener when time expires', () => {
      const onCompleted = vi.fn();
      service.onCompleted(onCompleted);

      service.startTimer('sess-1', { duration: 10 });

      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000);

      expect(onCompleted).toHaveBeenCalledTimes(1);
      const [sessId, completedState] = onCompleted.mock.calls[0];
      expect(sessId).toBe('sess-1');
      expect(completedState.status).toBe('COMPLETED');
      expect(completedState.remainingSeconds).toBe(0);
    });
  });

  describe('pauseTimer and resumeTimer', () => {
    it('pauses a running timer and preserves remaining seconds', () => {
      vi.setSystemTime(100000);
      service.startTimer('sess-1', { duration: 60 });

      // Advance 20 seconds
      vi.advanceTimersByTime(20000);

      const paused = service.pauseTimer('sess-1');
      expect(paused.status).toBe('PAUSED');
      expect(paused.remainingSeconds).toBe(40);
      expect(paused.endsAt).toBeUndefined();

      // Advance another 15 seconds while paused
      vi.advanceTimersByTime(15000);

      // Remaining seconds must NOT decrease while paused
      const snapshot = service.getTeacherSnapshot('sess-1');
      expect(snapshot.timer?.remainingSeconds).toBe(40);
      expect(snapshot.timer?.status).toBe('PAUSED');

      // Resume timer
      const resumed = service.resumeTimer('sess-1');
      expect(resumed.status).toBe('RUNNING');
      expect(resumed.remainingSeconds).toBe(40);

      // Advance remaining 40 seconds
      vi.advanceTimersByTime(40000);

      const finalState = service.getTeacherSnapshot('sess-1');
      expect(finalState.timer?.status).toBe('COMPLETED');
      expect(finalState.timer?.remainingSeconds).toBe(0);
    });

    it('does not pause if not currently RUNNING', () => {
      service.setTimer('sess-1', 60);
      const state = service.pauseTimer('sess-1');
      expect(state.status).toBe('IDLE');
    });

    it('does not resume if not currently PAUSED', () => {
      service.setTimer('sess-1', 60);
      const state = service.resumeTimer('sess-1');
      expect(state.status).toBe('IDLE');
    });
  });

  describe('resetTimer', () => {
    it('stops timer and returns to IDLE with original duration', () => {
      service.startTimer('sess-1', { duration: 180 });
      vi.advanceTimersByTime(50000);

      const reset = service.resetTimer('sess-1');
      expect(reset.status).toBe('IDLE');
      expect(reset.duration).toBe(180);
      expect(reset.remainingSeconds).toBe(180);
      expect(reset.endsAt).toBeUndefined();
    });

    it('allows changing duration on reset', () => {
      service.startTimer('sess-1', { duration: 60 });
      const reset = service.resetTimer('sess-1', 300);

      expect(reset.duration).toBe(300);
      expect(reset.remainingSeconds).toBe(300);
      expect(reset.status).toBe('IDLE');
    });
  });

  describe('Private Timer Visibility', () => {
    it('hides timer from participant snapshot when PRIVATE_TIMER', () => {
      service.setTimer('sess-1', 120, 'Catatan Pribadi', 'PRIVATE_TIMER');

      const teacherSnapshot = service.getTeacherSnapshot('sess-1');
      expect(teacherSnapshot.timer).not.toBeNull();
      expect(teacherSnapshot.timer?.label).toBe('Catatan Pribadi');
      expect(teacherSnapshot.timer?.visibility).toBe('PRIVATE_TIMER');

      const participantSnapshot = service.getParticipantSnapshot('sess-1');
      expect(participantSnapshot.timer).toBeNull();
    });

    it('provides timer to participant snapshot when SHARED_TIMER', () => {
      service.setTimer('sess-1', 120, 'Tugas Kelompok', 'SHARED_TIMER');

      const participantSnapshot = service.getParticipantSnapshot('sess-1');
      expect(participantSnapshot.timer).not.toBeNull();
      expect(participantSnapshot.timer?.label).toBe('Tugas Kelompok');
      expect(participantSnapshot.timer?.visibility).toBe('SHARED_TIMER');
    });
  });

  describe('Session Isolation and Cleanup', () => {
    it('maintains distinct timers for different sessions', () => {
      service.startTimer('sess-A', { duration: 60 });
      service.startTimer('sess-B', { duration: 300 });

      const snapA = service.getTeacherSnapshot('sess-A');
      const snapB = service.getTeacherSnapshot('sess-B');

      expect(snapA.timer?.duration).toBe(60);
      expect(snapB.timer?.duration).toBe(300);
    });

    it('cleans up session timer on clearSession', () => {
      service.startTimer('sess-1', { duration: 60 });
      service.clearSession('sess-1');

      const snap = service.getTeacherSnapshot('sess-1');
      expect(snap.timer).toBeNull();
    });
  });
});

