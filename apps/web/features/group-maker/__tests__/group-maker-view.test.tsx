import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupMakerView } from '../group-maker-view';

describe('GroupMakerView Component', () => {
  it('renders initial setup with 20 sample students', () => {
    render(<GroupMakerView />);

    expect(screen.getByRole('heading', { name: /Group Maker/i })).toBeDefined();
    expect(screen.getByText(/20 siswa terdaftar/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Bagi kelompok siswa sekarang/i })).toBeDefined();
  });

  it('generates groups on clicking generate button', () => {
    render(<GroupMakerView />);

    const generateBtn = screen.getByRole('button', { name: /Bagi kelompok siswa sekarang/i });
    fireEvent.click(generateBtn);

    expect(screen.getByText(/Hasil: \d+ Kelompok Terbentuk/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Salin hasil kelompok ke clipboard/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Cetak daftar kelompok/i })).toBeDefined();
    expect(screen.getAllByRole('heading', { name: /Kelompok \d+/i }).length).toBeGreaterThan(0);
  });

  it('allows toggling between BY_COUNT and BY_SIZE modes', () => {
    render(<GroupMakerView />);

    const bySizeBtn = screen.getByRole('button', { name: 'Ukuran per Tim' });
    fireEvent.click(bySizeBtn);

    expect(screen.getByText(/Target Siswa per Kelompok/i)).toBeDefined();

    const byCountBtn = screen.getByRole('button', { name: 'Jumlah Tim' });
    fireEvent.click(byCountBtn);

    expect(screen.getByText(/Target Jumlah Kelompok/i)).toBeDefined();
  });

  it('triggers window.print on clicking print button', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<GroupMakerView />);

    // Generate groups first
    fireEvent.click(screen.getByRole('button', { name: /Bagi kelompok siswa sekarang/i }));

    const printBtn = screen.getByRole('button', { name: /Cetak daftar kelompok/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('empties roster and disables generate button', () => {
    render(<GroupMakerView />);

    const emptyBtn = screen.getByRole('button', { name: /Kosongkan daftar nama dan hasil/i });
    fireEvent.click(emptyBtn);

    expect(screen.getByText(/0 siswa terdaftar/i)).toBeDefined();
    const generateBtn = screen.getByRole('button', { name: /Bagi kelompok siswa sekarang/i }) as HTMLButtonElement;
    expect(generateBtn.disabled).toBe(true);
  });
});

