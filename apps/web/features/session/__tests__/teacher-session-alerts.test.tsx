import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeacherSessionAlerts, playClassroomChime, ClassroomAlertItem } from '../teacher-session-alerts';

describe('TeacherSessionAlerts Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders nothing when alerts list is empty', () => {
    const { container } = render(
      <TeacherSessionAlerts alerts={[]} onDismiss={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders raise hand and new question alerts with proper buttons and details', () => {
    const onDismiss = vi.fn();
    const onActionHand = vi.fn();
    const onActionQuestion = vi.fn();

    const alerts: ClassroomAlertItem[] = [
      {
        id: 'a-1',
        type: 'RAISE_HAND',
        title: 'Siswa Mengangkat Tangan',
        author: 'Rina Wijaya',
        message: 'Rina Wijaya mengangkat tangan (antrean #1)',
        timestamp: Date.now(),
        actionLabel: 'Lihat Antrean',
        onAction: onActionHand,
      },
      {
        id: 'a-2',
        type: 'NEW_QUESTION',
        title: 'Pertanyaan Baru Masuk',
        author: 'Anonim',
        message: 'Apakah ada PR untuk materi ini?',
        timestamp: Date.now(),
        actionLabel: 'Buka Kotak Pertanyaan',
        onAction: onActionQuestion,
      },
    ];

    render(<TeacherSessionAlerts alerts={alerts} onDismiss={onDismiss} />);

    expect(screen.getByText('Siswa Mengangkat Tangan')).toBeDefined();
    expect(screen.getByText('Rina Wijaya')).toBeDefined();
    expect(screen.getByText('Pertanyaan Baru Masuk')).toBeDefined();
    expect(screen.getByText(/Apakah ada PR untuk materi ini\?/)).toBeDefined();

    // Click on action button
    const actionBtn = screen.getByRole('button', { name: /Lihat Antrean/i });
    fireEvent.click(actionBtn);
    expect(onActionHand).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('a-1');

    // Click on dismiss button (X)
    const closeBtns = screen.getAllByTitle('Tutup Notifikasi');
    fireEvent.click(closeBtns[1]!);
    expect(onDismiss).toHaveBeenCalledWith('a-2');
  });

  it('toggles audio mute state when mute button is clicked and stores in localStorage', () => {
    const alerts: ClassroomAlertItem[] = [
      {
        id: 'a-1',
        type: 'RAISE_HAND',
        title: 'Siswa Mengangkat Tangan',
        author: 'Budi',
        message: 'Budi mengangkat tangan',
        timestamp: Date.now(),
        actionLabel: 'Lihat Antrean',
        onAction: vi.fn(),
      },
    ];

    render(<TeacherSessionAlerts alerts={alerts} onDismiss={vi.fn()} />);

    const muteBtn = screen.getByTitle('Senyapkan Suara Notifikasi');
    expect(muteBtn).toBeDefined();

    fireEvent.click(muteBtn);
    expect(localStorage.getItem('walikelas:alerts-muted')).toBe('true');
    expect(screen.getByTitle('Aktifkan Suara Notifikasi')).toBeDefined();
  });

  it('playClassroomChime executes safely without throwing', () => {
    expect(() => playClassroomChime(false)).not.toThrow();
    expect(() => playClassroomChime(true)).not.toThrow();
  });
});
