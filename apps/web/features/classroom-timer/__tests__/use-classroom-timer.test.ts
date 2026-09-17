import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClassroomTimer, formatTime } from '../use-classroom-timer';
import type { TeacherClassroomTimerSnapshot, ClassroomTimerState } from '@walikelas/types';

describe('useClassroomTimer Hook', () => {
  let mockSocket: any;
  let eventHandlers: Record<string, Function> = {};

  beforeEach(() => {
    vi.useFakeTimers();
    eventHandlers = {};
    mockSocket = {
      connected: true,
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
      off: vi.fn((event: string) => {
        delete eventHandlers[event];
      }),
      emit: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('formatTime utility', () => {
    it('formats seconds into MM:SS format correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(65)).toBe('01:05');
      expect(formatTime(600)).toBe('10:00');
      expect(formatTime(3600)).toBe('60:00');
    });

    it('clamps negative numbers to 00:00', () => {
      expect(formatTime(-10)).toBe('00:00');
    });
  });

  describe('Teacher Mode', () => {
    it('initializes with snapshot from timer:state', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      const snapshot: TeacherClassroomTimerSnapshot = {
        timer: {
          sessionId: 'sess-123',
          status: 'IDLE',
          duration: 300,
          remainingSeconds: 300,
          label: 'Diskusi Kelompok',
          visibility: 'SHARED_TIMER',
          serverTime: 1000,
        },
        serverTime: 1000,
      };

      act(() => {
        eventHandlers['timer:state']?.(snapshot);
      });

      expect(result.current.timer?.sessionId).toBe('sess-123');
      expect(result.current.duration).toBe(300);
      expect(result.current.remaining).toBe(300);
      expect(result.current.status).toBe('IDLE');
      expect(result.current.isIdle).toBe(true);
    });

    it('emits timer:set when calling setTimer', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.setTimer(180, 'Presentasi', 'SHARED_TIMER');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('timer:set', {
        sessionId: 'sess-123',
        duration: 180,
        label: 'Presentasi',
        visibility: 'SHARED_TIMER',
      });
      // Optimistic assertions
      expect(result.current.duration).toBe(180);
      expect(result.current.remaining).toBe(180);
      expect(result.current.isIdle).toBe(true);
    });

    it('emits timer:start and optimistically starts countdown immediately', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.startTimer({ duration: 60 });
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('timer:start', {
        sessionId: 'sess-123',
        duration: 60,
      });

      // Optimistically running without waiting for server event
      expect(result.current.isRunning).toBe(true);
      expect(result.current.remaining).toBe(60);
    });

    it('optimistically pauses and resets without waiting for server response', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      // Start first
      act(() => {
        result.current.startTimer({ duration: 120 });
      });
      expect(result.current.isRunning).toBe(true);

      // Pause optimistically
      act(() => {
        result.current.pauseTimer();
      });
      expect(result.current.isPaused).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith('timer:pause', { sessionId: 'sess-123' });

      // Reset optimistically
      act(() => {
        result.current.resetTimer(300);
      });
      expect(result.current.isIdle).toBe(true);
      expect(result.current.remaining).toBe(300);
      expect(mockSocket.emit).toHaveBeenCalledWith('timer:reset', {
        sessionId: 'sess-123',
        newDuration: 300,
      });
    });

    it('handles timer:started and begins local countdown', () => {
      const startTime = 100000;
      vi.setSystemTime(startTime);

      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
          enableSound: false,
        }),
      );

      const startedState: ClassroomTimerState = {
        sessionId: 'sess-123',
        status: 'RUNNING',
        duration: 60,
        remainingSeconds: 60,
        startedAt: startTime,
        endsAt: startTime + 60 * 1000,
        visibility: 'SHARED_TIMER',
        serverTime: startTime,
      };

      act(() => {
        eventHandlers['timer:started']?.(startedState);
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.remaining).toBe(60);

      // Advance 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.remaining).toBe(50);
    });

    it('handles timer:paused and halts countdown', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.pauseTimer();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('timer:pause', {
        sessionId: 'sess-123',
      });

      act(() => {
        eventHandlers['timer:paused']?.({
          sessionId: 'sess-123',
          status: 'PAUSED',
          duration: 60,
          remainingSeconds: 45,
          visibility: 'SHARED_TIMER',
          serverTime: 2000,
        });
      });

      expect(result.current.isPaused).toBe(true);
      expect(result.current.remaining).toBe(45);
    });

    it('handles timer:resume and timer:reset', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.resumeTimer();
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('timer:resume', { sessionId: 'sess-123' });

      act(() => {
        result.current.resetTimer(300);
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('timer:reset', {
        sessionId: 'sess-123',
        newDuration: 300,
      });

      act(() => {
        eventHandlers['timer:reset']?.({
          sessionId: 'sess-123',
          status: 'IDLE',
          duration: 300,
          remainingSeconds: 300,
          visibility: 'SHARED_TIMER',
          serverTime: 3000,
        });
      });

      expect(result.current.isIdle).toBe(true);
      expect(result.current.remaining).toBe(300);
    });

    it('handles timer:completed and transitions to isCompleted', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
          enableSound: false,
        }),
      );

      act(() => {
        eventHandlers['timer:completed']?.({
          sessionId: 'sess-123',
          status: 'COMPLETED',
          duration: 60,
          remainingSeconds: 0,
          visibility: 'SHARED_TIMER',
          serverTime: 4000,
        });
      });

      expect(result.current.isCompleted).toBe(true);
      expect(result.current.remaining).toBe(0);
    });

    it('handles timer:error and clears error message', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['timer:error']?.({
          code: 'FORBIDDEN',
          message: 'Anda bukan pemilik sesi kelas ini',
        });
      });

      expect(result.current.error).toBe('Anda bukan pemilik sesi kelas ini');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Participant Mode', () => {
    it('does not emit control events when isTeacher is false', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        result.current.startTimer();
        result.current.pauseTimer();
        result.current.resumeTimer();
        result.current.resetTimer();
        result.current.setTimer(60);
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('receives null timer when PRIVATE_TIMER snapshot arrives', () => {
      const { result } = renderHook(() =>
        useClassroomTimer({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['timer:state']?.({
          timer: null,
          serverTime: 1000,
        });
      });

      expect(result.current.timer).toBeNull();
    });
  });
});

