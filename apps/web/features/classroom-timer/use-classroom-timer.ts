'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  ClassroomTimerState,
  ClassroomTimerVisibility,
  TeacherClassroomTimerSnapshot,
  ParticipantClassroomTimerSnapshot,
  ClassroomTimerErrorEvent,
} from '@walikelas/types';
import { playTimerSound } from '../timer/use-timer';

export interface UseClassroomTimerOptions {
  socket: Socket | null;
  sessionId?: string;
  isTeacher?: boolean;
  enableSound?: boolean;
}

export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useClassroomTimer({
  socket,
  sessionId,
  isTeacher = false,
  enableSound = true,
}: UseClassroomTimerOptions) {
  const [timer, setTimerState] = useState<ClassroomTimerState | null>(null);
  const [displayRemaining, setDisplayRemaining] = useState<number>(300);
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Server time offset: serverTime - clientLocalNow
  const serverOffsetRef = useRef<number>(0);

  // Recalculate displayed remaining seconds from authoritative state
  const recalculateRemaining = useCallback(() => {
    if (!timer) return;

    if (timer.status === 'RUNNING' && timer.endsAt) {
      const reconciledNow = Date.now() + serverOffsetRef.current;
      const msLeft = Math.max(0, timer.endsAt - reconciledNow);
      const secs = Math.max(0, Math.ceil(msLeft / 1000));
      setDisplayRemaining(secs);
    } else {
      setDisplayRemaining(Math.max(0, timer.remainingSeconds));
    }
  }, [timer]);

  // Recalculate immediately whenever timer state changes
  useEffect(() => {
    recalculateRemaining();
  }, [timer, recalculateRemaining]);

  // Local ticker: smooth 250ms countdown interval without server traffic
  useEffect(() => {
    if (!timer || timer.status !== 'RUNNING' || !timer.endsAt) {
      return;
    }

    const interval = setInterval(() => {
      const reconciledNow = Date.now() + serverOffsetRef.current;
      const msLeft = Math.max(0, timer.endsAt! - reconciledNow);
      const secs = Math.max(0, Math.ceil(msLeft / 1000));

      setDisplayRemaining(secs);

      if (secs <= 0) {
        clearInterval(interval);
        setTimerState((prev) =>
          prev ? { ...prev, status: 'COMPLETED', remainingSeconds: 0 } : null,
        );
        if (enableSound) {
          playTimerSound();
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [timer, enableSound]);

  // Background tab & mobile sleep reconciliation
  useEffect(() => {
    const handleReconcile = () => {
      recalculateRemaining();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', handleReconcile);
      window.addEventListener('focus', handleReconcile);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', handleReconcile);
        window.removeEventListener('focus', handleReconcile);
      }
    };
  }, [recalculateRemaining]);

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    const onTimerState = (
      payload: TeacherClassroomTimerSnapshot | ParticipantClassroomTimerSnapshot,
    ) => {
      if (!payload) {
        setTimerState(null);
        return;
      }

      if (payload.serverTime) {
        serverOffsetRef.current = payload.serverTime - Date.now();
      }

      setTimerState(payload.timer || null);
      if (payload.timer) {
        setDisplayRemaining(payload.timer.remainingSeconds);
      }
    };

    const onTimerStarted = (state: ClassroomTimerState) => {
      if (!state) return;
      if (state.serverTime) {
        serverOffsetRef.current = state.serverTime - Date.now();
      }
      setTimerState(state);
      setDisplayRemaining(state.remainingSeconds);
    };

    const onTimerPaused = (state: ClassroomTimerState) => {
      if (!state) return;
      if (state.serverTime) {
        serverOffsetRef.current = state.serverTime - Date.now();
      }
      setTimerState(state);
      setDisplayRemaining(state.remainingSeconds);
    };

    const onTimerResumed = (state: ClassroomTimerState) => {
      if (!state) return;
      if (state.serverTime) {
        serverOffsetRef.current = state.serverTime - Date.now();
      }
      setTimerState(state);
      setDisplayRemaining(state.remainingSeconds);
    };

    const onTimerReset = (state: ClassroomTimerState) => {
      if (!state) return;
      if (state.serverTime) {
        serverOffsetRef.current = state.serverTime - Date.now();
      }
      setTimerState(state);
      setDisplayRemaining(state.duration);
    };

    const onTimerCompleted = (state: ClassroomTimerState) => {
      if (!state) return;
      setTimerState(state);
      setDisplayRemaining(0);
      if (enableSound) {
        playTimerSound();
      }
    };

    const onTimerError = (payload: ClassroomTimerErrorEvent) => {
      setError(payload.message || 'Terjadi kesalahan pada Timer Kelas');
    };

    socket.on('timer:state', onTimerState);
    socket.on('timer:started', onTimerStarted);
    socket.on('timer:paused', onTimerPaused);
    socket.on('timer:resumed', onTimerResumed);
    socket.on('timer:reset', onTimerReset);
    socket.on('timer:completed', onTimerCompleted);
    socket.on('timer:error', onTimerError);

    return () => {
      socket.off('timer:state', onTimerState);
      socket.off('timer:started', onTimerStarted);
      socket.off('timer:paused', onTimerPaused);
      socket.off('timer:resumed', onTimerResumed);
      socket.off('timer:reset', onTimerReset);
      socket.off('timer:completed', onTimerCompleted);
      socket.off('timer:error', onTimerError);
    };
  }, [socket, enableSound]);

  // Teacher actions (with optimistic instant UI feedback)
  const setTimer = useCallback(
    (duration: number, label?: string, visibility?: ClassroomTimerVisibility) => {
      if (!socket || !sessionIdRef.current || !isTeacher) return;
      setError(null);

      const clamped = Math.min(3600, Math.max(5, Math.floor(duration)));

      // Optimistic update
      setDisplayRemaining(clamped);
      setTimerState((prev) => ({
        sessionId: sessionIdRef.current || '',
        status: 'IDLE',
        duration: clamped,
        remainingSeconds: clamped,
        label: label !== undefined ? label.trim() || undefined : prev?.label,
        visibility: visibility || prev?.visibility || 'SHARED_TIMER',
        serverTime: Date.now() + serverOffsetRef.current,
      }));

      socket.emit('timer:set', {
        sessionId: sessionIdRef.current,
        duration: clamped,
        label,
        visibility,
      });
    },
    [socket, isTeacher],
  );

  const startTimer = useCallback(
    (options?: { duration?: number; label?: string; visibility?: ClassroomTimerVisibility }) => {
      if (!socket || !sessionIdRef.current || !isTeacher) return;
      setError(null);

      const targetDuration = options?.duration ?? timer?.duration ?? 300;
      const clamped = Math.min(3600, Math.max(5, Math.floor(targetDuration)));
      const remainingSecs =
        options?.duration !== undefined
          ? clamped
          : timer?.remainingSeconds && timer.remainingSeconds > 0
            ? timer.remainingSeconds
            : clamped;

      const now = Date.now();
      const endsAt = now + remainingSecs * 1000 - serverOffsetRef.current;

      // Optimistic update
      setDisplayRemaining(remainingSecs);
      setTimerState((prev) => ({
        sessionId: sessionIdRef.current || '',
        status: 'RUNNING',
        duration: options?.duration !== undefined ? clamped : (prev?.duration ?? clamped),
        remainingSeconds: remainingSecs,
        label: options?.label !== undefined ? options.label.trim() || undefined : prev?.label,
        visibility: options?.visibility ?? prev?.visibility ?? 'SHARED_TIMER',
        startedAt: now,
        endsAt,
        serverTime: now + serverOffsetRef.current,
      }));

      socket.emit('timer:start', {
        sessionId: sessionIdRef.current,
        ...options,
      });
    },
    [socket, isTeacher, timer],
  );

  const pauseTimer = useCallback(() => {
    if (!socket || !sessionIdRef.current || !isTeacher) return;
    setError(null);

    // Optimistic pause: stop countdown at current remaining seconds immediately
    setDisplayRemaining((currentSecs) => {
      setTimerState((prev) =>
        prev
          ? {
              ...prev,
              status: 'PAUSED',
              remainingSeconds: currentSecs,
              endsAt: undefined,
            }
          : null,
      );
      return currentSecs;
    });

    socket.emit('timer:pause', {
      sessionId: sessionIdRef.current,
    });
  }, [socket, isTeacher]);

  const resumeTimer = useCallback(() => {
    if (!socket || !sessionIdRef.current || !isTeacher) return;
    setError(null);

    // Optimistic resume: restart countdown from current remaining seconds immediately
    setDisplayRemaining((currentSecs) => {
      const now = Date.now();
      const endsAt = now + currentSecs * 1000 - serverOffsetRef.current;
      setTimerState((prev) =>
        prev
          ? {
              ...prev,
              status: 'RUNNING',
              remainingSeconds: currentSecs,
              endsAt,
            }
          : null,
      );
      return currentSecs;
    });

    socket.emit('timer:resume', {
      sessionId: sessionIdRef.current,
    });
  }, [socket, isTeacher]);

  const resetTimer = useCallback(
    (newDuration?: number) => {
      if (!socket || !sessionIdRef.current || !isTeacher) return;
      setError(null);

      const target = newDuration ?? timer?.duration ?? 300;
      const clamped = Math.min(3600, Math.max(5, Math.floor(target)));

      // Optimistic reset: immediately show full duration and return to IDLE
      setDisplayRemaining(clamped);
      setTimerState((prev) =>
        prev
          ? {
              ...prev,
              status: 'IDLE',
              duration: clamped,
              remainingSeconds: clamped,
              endsAt: undefined,
              startedAt: undefined,
              serverTime: Date.now() + serverOffsetRef.current,
            }
          : {
              sessionId: sessionIdRef.current || '',
              status: 'IDLE',
              duration: clamped,
              remainingSeconds: clamped,
              visibility: 'SHARED_TIMER',
              serverTime: Date.now() + serverOffsetRef.current,
            },
      );

      socket.emit('timer:reset', {
        sessionId: sessionIdRef.current,
        newDuration: newDuration !== undefined ? clamped : undefined,
      });
    },
    [socket, isTeacher, timer],
  );

  const clearError = useCallback(() => setError(null), []);

  const duration = timer?.duration ?? 300;
  const progress =
    duration > 0 ? Math.min(100, Math.max(0, ((duration - displayRemaining) / duration) * 100)) : 0;
  const status = timer?.status ?? 'IDLE';

  return {
    timer,
    status,
    duration,
    remaining: displayRemaining,
    progress,
    isRunning: status === 'RUNNING',
    isPaused: status === 'PAUSED',
    isCompleted: status === 'COMPLETED',
    isIdle: status === 'IDLE',
    error,
    setTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    clearError,
  };
}
