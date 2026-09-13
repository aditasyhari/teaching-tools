import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from '../atoms/Badge/Badge.js';
import { SearchField } from '../molecules/SearchField/SearchField.js';
import { EmptyState } from '../molecules/EmptyState/EmptyState.js';
import { JoinCodeDisplay } from '../molecules/JoinCodeDisplay/JoinCodeDisplay.js';
import { StatCard } from '../molecules/StatCard/StatCard.js';
import { ToolCard } from '../molecules/ToolCard/ToolCard.js';
import { ToolGrid } from '../organisms/ToolGrid/ToolGrid.js';
import type { ToolMetadata } from '@walikelas/types';

describe('Design System Components', () => {
  describe('Badge atom', () => {
    it('renders with correct variant', () => {
      render(<Badge variant="success">Aktif</Badge>);
      const badge = screen.getByText('Aktif');
      expect(badge).toBeDefined();
      expect(badge.className).toContain('bg-emerald-50');
    });
  });

  describe('SearchField molecule', () => {
    it('calls onChange when typed', () => {
      const onChange = vi.fn();
      render(<SearchField value="" onChange={onChange} placeholder="Cari..." />);
      const input = screen.getByPlaceholderText('Cari...');
      fireEvent.change(input, { target: { value: 'kuis' } });
      expect(onChange).toHaveBeenCalledWith('kuis');
    });

    it('clears query when clear button clicked', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      render(<SearchField value="test" onChange={onChange} onClear={onClear} />);
      const clearBtn = screen.getByRole('button', { name: 'Bersihkan pencarian' });
      fireEvent.click(clearBtn);
      expect(onChange).toHaveBeenCalledWith('');
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('EmptyState molecule', () => {
    it('renders title and description', () => {
      render(
        <EmptyState title="Tidak ada sesi" description="Belum ada sesi kelas yang berlangsung." />,
      );
      expect(screen.getByText('Tidak ada sesi')).toBeDefined();
      expect(screen.getByText('Belum ada sesi kelas yang berlangsung.')).toBeDefined();
    });
  });

  describe('JoinCodeDisplay molecule', () => {
    it('renders the formatted code', () => {
      render(<JoinCodeDisplay code="WK-1234" />);
      expect(screen.getByText('WK-1234')).toBeDefined();
      expect(screen.getByText('Kode Sesi')).toBeDefined();
    });
  });

  describe('StatCard molecule', () => {
    it('renders label, value and change indicator', () => {
      render(<StatCard label="Total Guru" value={120} change="+15%" changeType="positive" />);
      expect(screen.getByText('Total Guru')).toBeDefined();
      expect(screen.getByText('120')).toBeDefined();
      expect(screen.getByText('+15%')).toBeDefined();
    });
  });

  describe('ToolCard & ToolGrid organisms', () => {
    const mockTools: ToolMetadata[] = [
      {
        id: 'timer',
        name: 'Timer Kelas',
        description: 'Penghitung waktu mundur kelas',
        category: 'LOCAL',
        isInteractive: false,
        requiresAuth: false,
        priority: 'P0',
        route: '/tools/timer',
        iconName: 'timer',
        status: 'AVAILABLE',
      },
      {
        id: 'live-quiz',
        name: 'Live Quiz',
        description: 'Kuis interaktif langsung bersama murid',
        category: 'INTERACTIVE',
        isInteractive: true,
        requiresAuth: true,
        priority: 'P0',
        route: '/tools/live-quiz',
        iconName: 'help-circle',
        status: 'COMING_SOON',
      },
    ];

    it('renders tool card details correctly', () => {
      const onAction = vi.fn();
      render(<ToolCard tool={mockTools[0]!} onAction={onAction} />);
      expect(screen.getByText('Timer Kelas')).toBeDefined();
      expect(screen.getByText('Penghitung waktu mundur kelas')).toBeDefined();
      expect(screen.getByText('Lokal')).toBeDefined();
      expect(screen.getByText('P0')).toBeDefined();

      const actionBtn = screen.getByRole('button', { name: /buka perkakas/i });
      fireEvent.click(actionBtn);
      expect(onAction).toHaveBeenCalledWith(mockTools[0]);
    });

    it('filters tools by category in ToolGrid', () => {
      render(<ToolGrid tools={mockTools} categoryFilter="INTERACTIVE" />);
      expect(screen.queryByText('Timer Kelas')).toBeNull();
      expect(screen.getByText('Live Quiz')).toBeDefined();
    });

    it('renders empty state when no tools match', () => {
      render(<ToolGrid tools={mockTools} searchQuery="nonexistent" />);
      expect(screen.getByText('Tidak ada perkakas yang ditemukan')).toBeDefined();
    });
  });
});
