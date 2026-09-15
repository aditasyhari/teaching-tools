import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreboardView } from '../scoreboard-view';

describe('ScoreboardView Component', () => {
  it('renders initial 4 default teams and scores', () => {
    render(<ScoreboardView />);

    expect(screen.getByRole('heading', { name: /Scoreboard Kelas/i })).toBeDefined();
    expect(screen.getByText(/4 Tim/i)).toBeDefined();
    expect(screen.getByText('Tim Merah')).toBeDefined();
    expect(screen.getByText('Tim Biru')).toBeDefined();
  });

  it('increments and decrements scores via touch controls', () => {
    render(<ScoreboardView />);

    const plusOneBtn = screen.getByRole('button', { name: /Tambah 1 poin untuk Tim Merah/i });
    fireEvent.click(plusOneBtn);

    expect(screen.getByRole('status', { name: /Skor Tim Merah: 1/i })).toBeDefined();

    const plusFiveBtn = screen.getByRole('button', { name: /Tambah 5 poin untuk Tim Merah/i });
    fireEvent.click(plusFiveBtn);

    expect(screen.getByRole('status', { name: /Skor Tim Merah: 6/i })).toBeDefined();

    const minusOneBtn = screen.getByRole('button', { name: /Kurang 1 poin untuk Tim Merah/i });
    fireEvent.click(minusOneBtn);

    expect(screen.getByRole('status', { name: /Skor Tim Merah: 5/i })).toBeDefined();

    const minusFiveBtn = screen.getByRole('button', { name: /Kurang 5 poin untuk Tim Merah/i });
    fireEvent.click(minusFiveBtn);

    expect(screen.getByRole('status', { name: /Skor Tim Merah: 0/i })).toBeDefined();
  });

  it('allows inline renaming a team', () => {
    render(<ScoreboardView />);

    const editBtn = screen.getByRole('button', { name: /Ubah nama Tim Merah/i });
    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue('Tim Merah');
    fireEvent.change(input, { target: { value: 'Garuda Juara' } });

    const saveBtn = screen.getByRole('button', { name: /Simpan nama tim/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Garuda Juara')).toBeDefined();
  });

  it('adds and removes teams', () => {
    render(<ScoreboardView />);

    const addBtn = screen.getByRole('button', { name: /Tambah tim baru/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/5 Tim/i)).toBeDefined();
    expect(screen.getByText('Tim 5')).toBeDefined();

    const deleteBtn = screen.getByRole('button', { name: /Hapus Tim 5/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/4 Tim/i)).toBeDefined();
  });

  it('renders welcoming empty state when board is cleared', () => {
    render(<ScoreboardView />);

    const clearBtn = screen.getByRole('button', { name: /Kosongkan seluruh tim/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText('Papan Skor Kosong')).toBeDefined();
    expect(screen.getByRole('button', { name: /Tambah Tim Pertama/i })).toBeDefined();
  });
});

