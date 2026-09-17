import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InConsoleToolHeader } from '@/components/common/in-console-tool-header';
import TeacherTimerPage from '../timer/page';
import TeacherRandomPickerPage from '../random-picker/page';
import TeacherGroupMakerPage from '../group-maker/page';
import TeacherScoreboardPage from '../scoreboard/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/teacher/tools/timer',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('In-Console Tool Navigation Header', () => {
  it('renders tool title and quick links correctly', () => {
    render(<InConsoleToolHeader toolId="timer" toolName="Timer Kelas" />);

    expect(screen.getByText('Katalog Perkakas')).toBeDefined();
    expect(screen.getByText('Timer Kelas')).toBeDefined();
    expect(screen.getByText('Mode Mandiri (Tab Baru)')).toBeDefined();
    expect(screen.getByText('Random Picker')).toBeDefined();
    expect(screen.getByText('Group Maker')).toBeDefined();
    expect(screen.getByText('Scoreboard')).toBeDefined();
  });
});

describe('Teacher In-Console Tool Pages', () => {
  it('renders TeacherTimerPage with header and timer controls', () => {
    render(<TeacherTimerPage />);
    expect(screen.getByText('Katalog Perkakas')).toBeDefined();
    expect(screen.getAllByText('Timer Kelas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Siap')).toBeDefined();
  });

  it('renders TeacherRandomPickerPage with header and picker controls', () => {
    render(<TeacherRandomPickerPage />);
    expect(screen.getByText('Katalog Perkakas')).toBeDefined();
    expect(screen.getByText('Random Picker (Pemilih Acak)')).toBeDefined();
    expect(screen.getByRole('button', { name: /Undi nama siswa acak/i })).toBeDefined();
  });

  it('renders TeacherGroupMakerPage with header and group maker controls', () => {
    render(<TeacherGroupMakerPage />);
    expect(screen.getByText('Katalog Perkakas')).toBeDefined();
    expect(screen.getByText('Group Maker (Pembagi Kelompok)')).toBeDefined();
    expect(screen.getByRole('button', { name: /Bagi kelompok siswa sekarang/i })).toBeDefined();
  });

  it('renders TeacherScoreboardPage with header and scoreboard controls', () => {
    render(<TeacherScoreboardPage />);
    expect(screen.getByText('Katalog Perkakas')).toBeDefined();
    expect(screen.getByText('Scoreboard (Papan Skor)')).toBeDefined();
    expect(screen.getAllByText(/Scoreboard Kelas/i).length).toBeGreaterThanOrEqual(1);
  });
});
