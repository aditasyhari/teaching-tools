import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../page.js';

vi.mock('../../lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    classrooms: [],
    activeClassroom: null,
    loading: false,
    loginWithGoogle: vi.fn(),
    devLogin: vi.fn(),
    logout: vi.fn(),
    selectClassroom: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

describe('HomePage', () => {
  it('renders brand title and hero elements', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        name: /Perkakas kecil\.\s+Kelas yang lebih hidup/i,
      }),
    ).toBeDefined();

    expect(screen.getByText('WaliKelas')).toBeDefined();
    expect(screen.getByText('Teaching Tools')).toBeDefined();
  });

  it('renders student session join card and input', () => {
    render(<HomePage />);
    expect(screen.getByText(/Punya Kode Sesi Kelas Hari Ini\?/i)).toBeDefined();
    expect(screen.getByPlaceholderText('KODE: WK-982')).toBeDefined();
    expect(screen.getByRole('button', { name: /Gabung/i })).toBeDefined();
  });

  it('renders tool collections and how-it-works section', () => {
    render(<HomePage />);
    expect(screen.getByText(/Semua perkakas yang Anda butuhkan di kelas/i)).toBeDefined();
    expect(screen.getByText(/Tiga Langkah Sederhana Menghidupkan Kelas/i)).toBeDefined();
  });
});
