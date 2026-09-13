import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer, formatTime } from '../use-timer';

describe('useTimer Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats time correctly', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(600)).toBe('10:00');
  });

  it('initializes with default duration', () => {
    const { result } = renderHook(() => useTimer({ initialDuration: 60 }));
    expect(result.current.duration).toBe(60);
    expect(result.current.remaining).toBe(60);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isCompleted).toBe(false);
  });

  it('starts and counts down', () => {
    const { result } = renderHook(() => useTimer({ initialDuration: 10, enableSound: false }));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.remaining).toBeLessThanOrEqual(7);
  });

  it('pauses and resumes accurately', () => {
    const { result } = renderHook(() => useTimer({ initialDuration: 10, enableSound: false }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPaused).toBe(true);
    const pausedRemaining = result.current.remaining;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should not count down while paused
    expect(result.current.remaining).toBe(pausedRemaining);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isPaused).toBe(false);
  });

  it('completes when remaining time hits 0', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTimer({ initialDuration: 2, onComplete, enableSound: false }),
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.remaining).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('resets timer state', () => {
    const { result } = renderHook(() => useTimer({ initialDuration: 60, enableSound: false }));

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(5000);
      result.current.reset(120);
    });

    expect(result.current.duration).toBe(120);
    expect(result.current.remaining).toBe(120);
    expect(result.current.isRunning).toBe(false);
  });
});
