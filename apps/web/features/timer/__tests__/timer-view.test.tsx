import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TimerView } from '../timer-view';

describe('TimerView Component (Golden Reference)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial timer state with 05:00 and default controls', () => {
    render(<TimerView />);

    expect(screen.getByRole('heading', { name: /Timer Kelas/i })).toBeDefined();
    expect(screen.getByRole('timer').textContent).toContain('05:00');
    expect(screen.getByRole('button', { name: /Mulai timer/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Atur ulang timer/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Matikan suara alarm bel/i })).toBeDefined();
    expect(screen.getByText('Suara Aktif')).toBeDefined();
  });

  it('allows selecting preset durations', () => {
    render(<TimerView />);

    const oneMinuteBtn = screen.getByRole('button', { name: '1 Menit' });
    fireEvent.click(oneMinuteBtn);
    expect(screen.getByRole('timer').textContent).toContain('01:00');

    const tenMinutesBtn = screen.getByRole('button', { name: '10 Menit' });
    fireEvent.click(tenMinutesBtn);
    expect(screen.getByRole('timer').textContent).toContain('10:00');
  });

  it('starts, pauses, resumes, and resets via button clicks', () => {
    render(<TimerView />);

    const startBtn = screen.getByRole('button', { name: /Mulai timer/i });
    fireEvent.click(startBtn);

    // Advances timer by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole('button', { name: /Jeda timer/i })).toBeDefined();
    expect(screen.getByRole('timer').textContent).toContain('04:57');

    // Pause
    const pauseBtn = screen.getByRole('button', { name: /Jeda timer/i });
    fireEvent.click(pauseBtn);
    expect(screen.getByRole('button', { name: /Lanjutkan timer/i })).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // Time should remain unchanged while paused
    expect(screen.getByRole('timer').textContent).toContain('04:57');

    // Resume
    const resumeBtn = screen.getByRole('button', { name: /Lanjutkan timer/i });
    fireEvent.click(resumeBtn);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('timer').textContent).toContain('04:55');

    // Reset
    const resetBtn = screen.getByRole('button', { name: /Atur ulang timer/i });
    fireEvent.click(resetBtn);
    expect(screen.getByRole('timer').textContent).toContain('05:00');
    expect(screen.getByRole('button', { name: /Mulai timer/i })).toBeDefined();
  });

  it('handles keyboard shortcuts: Space for toggle and R for reset', () => {
    render(<TimerView />);

    // Press Space to start
    fireEvent.keyDown(window, { code: 'Space' });
    expect(screen.getByRole('button', { name: /Jeda timer/i })).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('timer').textContent).toContain('04:58');

    // Press Space to pause
    fireEvent.keyDown(window, { code: 'Space' });
    expect(screen.getByRole('button', { name: /Lanjutkan timer/i })).toBeDefined();

    // Press Space to resume
    fireEvent.keyDown(window, { code: 'Space' });
    expect(screen.getByRole('button', { name: /Jeda timer/i })).toBeDefined();

    // Press R to reset
    fireEvent.keyDown(window, { code: 'KeyR' });
    expect(screen.getByRole('timer').textContent).toContain('05:00');
    expect(screen.getByRole('button', { name: /Mulai timer/i })).toBeDefined();
  });

  it('toggles sound mute/unmute', () => {
    render(<TimerView />);

    const soundBtn = screen.getByRole('button', { name: /Matikan suara alarm bel/i });
    fireEvent.click(soundBtn);

    expect(screen.getByRole('button', { name: /Nyalakan suara alarm bel/i })).toBeDefined();
    expect(screen.getByText('Senyap')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Nyalakan suara alarm bel/i }));
    expect(screen.getByText('Suara Aktif')).toBeDefined();
  });

  it('opens custom duration dialog and applies new duration', () => {
    render(<TimerView />);

    const customBtn = screen.getByRole('button', { name: /Durasi Kustom\.\.\./i });
    fireEvent.click(customBtn);

    expect(screen.getByRole('heading', { name: /Atur Durasi Kustom/i })).toBeDefined();

    const inputs = screen.getAllByRole('spinbutton');
    const minutesInput = inputs[0]!;
    const secondsInput = inputs[1]!;

    fireEvent.change(minutesInput, { target: { value: '2' } });
    fireEvent.change(secondsInput, { target: { value: '30' } });

    const applyBtn = screen.getByRole('button', { name: 'Terapkan' });
    fireEvent.click(applyBtn);

    expect(screen.getByRole('timer').textContent).toContain('02:30');
  });

  it('shows completion state when countdown reaches zero', () => {
    render(<TimerView />);

    // Select 1 minute
    fireEvent.click(screen.getByRole('button', { name: '1 Menit' }));

    // Start
    fireEvent.click(screen.getByRole('button', { name: /Mulai timer/i }));

    // Advance 60 seconds
    act(() => {
      vi.advanceTimersByTime(60200);
    });

    expect(screen.getByRole('timer').textContent).toContain('00:00');
    expect(screen.getAllByText(/Waktu pembelajaran telah selesai!/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Ulangi timer/i })).toBeDefined();
  });
});
