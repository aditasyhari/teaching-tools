import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolsPage from '../page.js';

describe('ToolsPage (/tools) — Teacher Toolbox Catalogue', () => {
  it('renders teacher-first heading and supporting copy', () => {
    render(<ToolsPage />);
    expect(
      screen.getByRole('heading', { name: /Perkakas untuk kelas yang lebih aktif/i }),
    ).toBeDefined();
    expect(
      screen.getByText(/Mulai aktivitas kelas dengan perkakas yang tepat/i),
    ).toBeDefined();
    expect(screen.getByText('Kotak Perkakas Guru')).toBeDefined();
  });

  it('renders the 3 featured tools in Perkakas Utama Kelas', () => {
    render(<ToolsPage />);
    expect(screen.getByText('Perkakas Utama Kelas')).toBeDefined();
    expect(screen.getByText('Atur ritme kegiatan kelas.')).toBeDefined();
    expect(screen.getByText('Pilih siswa secara acak.')).toBeDefined();
    expect(screen.getByText('Buat kuis dan mainkan bersama kelas.')).toBeDefined();
  });

  it('renders teacher-centric category filters', () => {
    render(<ToolsPage />);
    expect(screen.getByRole('tab', { name: /Semua/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Manajemen Kelas/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Partisipasi & Respon/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Diskusi & Refleksi/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Materi & Catatan/i })).toBeDefined();
  });

  it('does NOT display technical metadata like P0, P1, P2, Lokal, or Realtime', () => {
    render(<ToolsPage />);
    expect(screen.queryByText('P0')).toBeNull();
    expect(screen.queryByText('P1')).toBeNull();
    expect(screen.queryByText('P2')).toBeNull();
    expect(screen.queryByText('Lokal')).toBeNull();
    expect(screen.queryByText('Realtime')).toBeNull();
  });

  it('filters tools by search query and allows reset', () => {
    render(<ToolsPage />);
    const searchInput = screen.getByPlaceholderText('Cari perkakas...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent_xyz' } });

    expect(screen.getByText('Perkakas tidak ditemukan')).toBeDefined();

    const resetBtn = screen.getByRole('button', { name: /Reset Pencarian & Filter/i });
    fireEvent.click(resetBtn);

    expect(screen.queryByText('Perkakas tidak ditemukan')).toBeNull();
  });
});

