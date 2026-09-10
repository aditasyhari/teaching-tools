import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../page.js';

describe('HomePage', () => {
  it('renders title and tool categories', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        name: /Perkakas Pembelajaran Interaktif di Kelas/i,
      }),
    ).toBeDefined();

    expect(screen.getByText('Alat Bantu Guru (Lokal)')).toBeDefined();
    expect(screen.getByText('Aktivitas Interaktif Siswa')).toBeDefined();
  });
});
