import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParticipantClassroomTimerBanner } from '../participant-classroom-timer-banner';
import { TeacherClassroomTimerPanel } from '../teacher-classroom-timer-panel';
import type { ClassroomTimerState } from '@walikelas/types';

describe('ParticipantClassroomTimerBanner', () => {
  it('returns null if timer is null', () => {
    const { container } = render(
      <ParticipantClassroomTimerBanner
        timer={null}
        remaining={0}
        progress={0}
        isRunning={false}
        isPaused={false}
        isCompleted={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null if timer is PRIVATE_TIMER', () => {
    const timer: ClassroomTimerState = {
      sessionId: 'sess-1',
      serverTime: Date.now(),
      status: 'RUNNING',
      duration: 300,
      remainingSeconds: 250,
      startedAt: Date.now() - 50000,
      endsAt: Date.now() + 250000,
      label: 'Kuis Singkat',
      visibility: 'PRIVATE_TIMER',
    };
    const { container } = render(
      <ParticipantClassroomTimerBanner
        timer={timer}
        remaining={250}
        progress={16}
        isRunning={true}
        isPaused={false}
        isCompleted={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null if timer is IDLE', () => {
    const timer: ClassroomTimerState = {
      sessionId: 'sess-1',
      serverTime: Date.now(),
      status: 'IDLE',
      duration: 300,
      remainingSeconds: 300,
      visibility: 'SHARED_TIMER',
    };
    const { container } = render(
      <ParticipantClassroomTimerBanner
        timer={timer}
        remaining={300}
        progress={0}
        isRunning={false}
        isPaused={false}
        isCompleted={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders timer when RUNNING and SHARED_TIMER', () => {
    const timer: ClassroomTimerState = {
      sessionId: 'sess-1',
      serverTime: Date.now(),
      status: 'RUNNING',
      duration: 300,
      remainingSeconds: 125,
      startedAt: Date.now() - 175000,
      endsAt: Date.now() + 125000,
      label: 'Diskusi Kelompok',
      visibility: 'SHARED_TIMER',
    };
    render(
      <ParticipantClassroomTimerBanner
        timer={timer}
        remaining={125}
        progress={58}
        isRunning={true}
        isPaused={false}
        isCompleted={false}
      />,
    );

    expect(screen.getByText('Diskusi Kelompok')).toBeDefined();
    expect(screen.getByText('02:05')).toBeDefined();
    expect(screen.getByText('Waktu Berjalan')).toBeDefined();
  });

  it('renders paused state when PAUSED', () => {
    const timer: ClassroomTimerState = {
      sessionId: 'sess-1',
      serverTime: Date.now(),
      status: 'PAUSED',
      duration: 120,
      remainingSeconds: 60,
      startedAt: Date.now() - 60000,
      visibility: 'SHARED_TIMER',
    };
    render(
      <ParticipantClassroomTimerBanner
        timer={timer}
        remaining={60}
        progress={50}
        isRunning={false}
        isPaused={true}
        isCompleted={false}
      />,
    );

    expect(screen.getByText('01:00')).toBeDefined();
    expect(screen.getByText('Timer Dijeda')).toBeDefined();
  });

  it('renders completion message when COMPLETED', () => {
    const timer: ClassroomTimerState = {
      sessionId: 'sess-1',
      serverTime: Date.now(),
      status: 'COMPLETED',
      duration: 60,
      remainingSeconds: 0,
      startedAt: Date.now() - 60000,
      endsAt: Date.now(),
      label: 'Sesi Tanya Jawab',
      visibility: 'SHARED_TIMER',
    };
    render(
      <ParticipantClassroomTimerBanner
        timer={timer}
        remaining={0}
        progress={100}
        isRunning={false}
        isPaused={false}
        isCompleted={true}
      />,
    );

    expect(screen.getByText('Sesi Tanya Jawab')).toBeDefined();
    expect(screen.getByText('00:00')).toBeDefined();
    expect(screen.getByText('Waktu Habis!')).toBeDefined();
  });
});

describe('TeacherClassroomTimerPanel', () => {
  const defaultTimer: ClassroomTimerState = {
    sessionId: 'sess-1',
    serverTime: Date.now(),
    status: 'IDLE',
    duration: 300,
    remainingSeconds: 300,
    label: 'Latihan Soal',
    visibility: 'SHARED_TIMER',
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    timer: defaultTimer,
    remaining: 300,
    duration: 300,
    progress: 0,
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    isIdle: true,
    error: null,
    onSetTimer: vi.fn(),
    onStartTimer: vi.fn(),
    onPauseTimer: vi.fn(),
    onResumeTimer: vi.fn(),
    onResetTimer: vi.fn(),
    onClearError: vi.fn(),
  };

  it('does not render if isOpen is false', () => {
    const { container } = render(<TeacherClassroomTimerPanel {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders panel with title, formatted time, and presets when open', () => {
    render(<TeacherClassroomTimerPanel {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Timer Kelas' })).toBeDefined();
    expect(screen.getByText('05:00')).toBeDefined();
    expect(screen.getByDisplayValue('Latihan Soal')).toBeDefined();
    expect(screen.getByText('Mulai Timer')).toBeDefined();
  });

  it('calls onStartTimer when start button is clicked', () => {
    render(<TeacherClassroomTimerPanel {...defaultProps} />);

    const startBtn = screen.getByText('Mulai Timer');
    fireEvent.click(startBtn);

    expect(defaultProps.onStartTimer).toHaveBeenCalled();
  });

  it('renders Jeda button when running and triggers onPauseTimer', () => {
    render(
      <TeacherClassroomTimerPanel
        {...defaultProps}
        timer={{
          sessionId: 'sess-1',
          serverTime: Date.now(),
          status: 'RUNNING',
          duration: 300,
          remainingSeconds: 200,
          startedAt: Date.now() - 100000,
          endsAt: Date.now() + 200000,
          label: 'Latihan Soal',
          visibility: 'SHARED_TIMER',
        }}
        isRunning={true}
        isIdle={false}
        remaining={200}
        progress={33}
      />,
    );

    const pauseBtn = screen.getByText('Jeda');
    fireEvent.click(pauseBtn);

    expect(defaultProps.onPauseTimer).toHaveBeenCalled();
  });

  it('renders Lanjutkan button when paused and triggers onResumeTimer', () => {
    render(
      <TeacherClassroomTimerPanel
        {...defaultProps}
        timer={{
          sessionId: 'sess-1',
          serverTime: Date.now(),
          status: 'PAUSED',
          duration: 300,
          remainingSeconds: 150,
          startedAt: Date.now() - 150000,
          label: 'Latihan Soal',
          visibility: 'SHARED_TIMER',
        }}
        isPaused={true}
        isIdle={false}
        remaining={150}
        progress={50}
      />,
    );

    const resumeBtn = screen.getByText('Lanjutkan');
    fireEvent.click(resumeBtn);

    expect(defaultProps.onResumeTimer).toHaveBeenCalled();
  });
});

