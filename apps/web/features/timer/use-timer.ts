'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTimerOptions {
  initialDuration?: number; // in seconds, default 300 (5 mins)
  onComplete?: () => void;
  enableSound?: boolean;
}

export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function playTimerSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant two-tone chime: D5 (587Hz) then A5 (880Hz)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.9);
  } catch {
    // Audio context may fail if user hasn't interacted with page
  }
}

export function useTimer({
  initialDuration = 300,
  onComplete,
  enableSound = true,
}: UseTimerOptions = {}) {
  const [duration, setDuration] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timestamp-based timing references to avoid tab throttling drift
  const endTimeRef = useRef<number | null>(null);
  const remainingOnPauseRef = useRef<number>(initialDuration);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;
    const now = Date.now();
    const msRemaining = endTimeRef.current - now;
    const secondsRemaining = Math.max(0, Math.ceil(msRemaining / 1000));

    setRemaining(secondsRemaining);

    if (secondsRemaining <= 0) {
      clearTimerInterval();
      endTimeRef.current = null;
      setIsRunning(false);
      setIsPaused(false);
      setIsCompleted(true);
      if (enableSound) {
        playTimerSound();
      }
      onComplete?.();
    }
  }, [clearTimerInterval, enableSound, onComplete]);

  // Recalculate immediately when tab regains focus or visibility
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (isRunning && !isPaused && endTimeRef.current) {
        tick();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', handleVisibilityOrFocus);
      window.addEventListener('focus', handleVisibilityOrFocus);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
        window.removeEventListener('focus', handleVisibilityOrFocus);
      }
    };
  }, [isRunning, isPaused, tick]);

  const start = useCallback(
    (customSeconds?: number) => {
      clearTimerInterval();
      const targetDuration = customSeconds !== undefined ? customSeconds : duration;

      setDuration(targetDuration);
      setRemaining(targetDuration);
      setIsRunning(true);
      setIsPaused(false);
      setIsCompleted(false);

      endTimeRef.current = Date.now() + targetDuration * 1000;
      timerIntervalRef.current = setInterval(tick, 200);
    },
    [clearTimerInterval, duration, tick],
  );

  const pause = useCallback(() => {
    if (!isRunning || isPaused || !endTimeRef.current) return;
    clearTimerInterval();

    const now = Date.now();
    const msRemaining = Math.max(0, endTimeRef.current - now);
    const secs = Math.ceil(msRemaining / 1000);

    remainingOnPauseRef.current = secs;
    setRemaining(secs);
    setIsPaused(true);
    endTimeRef.current = null;
  }, [clearTimerInterval, isPaused, isRunning]);

  const resume = useCallback(() => {
    if (!isRunning || !isPaused) return;

    clearTimerInterval();
    const remainingSecs = remainingOnPauseRef.current;
    endTimeRef.current = Date.now() + remainingSecs * 1000;
    setIsPaused(false);

    timerIntervalRef.current = setInterval(tick, 200);
  }, [clearTimerInterval, isPaused, isRunning, tick]);

  const reset = useCallback(
    (newDuration?: number) => {
      clearTimerInterval();
      endTimeRef.current = null;

      const target = newDuration !== undefined ? newDuration : duration;
      setDuration(target);
      setRemaining(target);
      remainingOnPauseRef.current = target;
      setIsRunning(false);
      setIsPaused(false);
      setIsCompleted(false);
    },
    [clearTimerInterval, duration],
  );

  const addSeconds = useCallback(
    (secondsToAdd: number) => {
      if (secondsToAdd <= 0) return;
      setDuration((prev) => prev + secondsToAdd);
      setRemaining((prev) => prev + secondsToAdd);

      if (isRunning && !isPaused && endTimeRef.current) {
        endTimeRef.current += secondsToAdd * 1000;
      } else if (isPaused) {
        remainingOnPauseRef.current += secondsToAdd;
      }

      if (isCompleted) {
        setIsCompleted(false);
      }
    },
    [isCompleted, isPaused, isRunning],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => clearTimerInterval();
  }, [clearTimerInterval]);

  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return {
    duration,
    remaining,
    progress,
    isRunning,
    isPaused,
    isCompleted,
    start,
    pause,
    resume,
    reset,
    addSeconds,
  };
}
