import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RandomPickerView } from '../random-picker-view';

describe('RandomPickerView Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state with sample names', () => {
    render(<RandomPickerView />);

    expect(screen.getByRole('heading', { name: /Random Picker/i })).toBeDefined();
    expect(screen.getByText(/10 nama terdaftar/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Undi nama siswa acak/i })).toBeDefined();
  });

  it('picks a random student when button clicked', () => {
    render(<RandomPickerView />);

    const pickBtn = screen.getByRole('button', { name: /Undi nama siswa acak/i });
    fireEvent.click(pickBtn);

    // Fast-forward spinning interval
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('Siswa Terpilih!')).toBeDefined();
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByRole('button', { name: /Atur ulang pilihan/i })).toBeDefined();
  });

  it('supports Space keyboard shortcut to trigger pick', () => {
    render(<RandomPickerView />);

    fireEvent.keyDown(window, { code: 'Space' });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('Siswa Terpilih!')).toBeDefined();
  });

  it('allows clearing and resetting selection', () => {
    render(<RandomPickerView />);

    // Pick a student
    fireEvent.click(screen.getByRole('button', { name: /Undi nama siswa acak/i }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const resetBtn = screen.getByRole('button', { name: /Atur ulang pilihan/i });
    fireEvent.click(resetBtn);

    expect(screen.queryByText('Siswa Terpilih!')).toBeNull();
  });

  it('empties roster and disables pick button', () => {
    render(<RandomPickerView />);

    const emptyBtn = screen.getByRole('button', { name: /Kosongkan seluruh daftar nama/i });
    fireEvent.click(emptyBtn);

    expect(screen.getByText(/0 nama terdaftar/i)).toBeDefined();
    const pickBtn = screen.getByRole('button', { name: /Undi nama siswa acak/i }) as HTMLButtonElement;
    expect(pickBtn.disabled).toBe(true);
  });
});

