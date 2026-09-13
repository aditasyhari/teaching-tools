import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRandomPicker, parseItems } from '../use-random-picker';

describe('useRandomPicker Hook', () => {
  describe('parseItems', () => {
    it('trims values and excludes empty lines', () => {
      const raw = '  Ahmad  \n\n  Budi \n   \nCitra';
      const items = parseItems(raw);
      expect(items).toEqual(['Ahmad', 'Budi', 'Citra']);
    });
  });

  describe('picking behavior', () => {
    it('returns null when list is empty', () => {
      const { result } = renderHook(() => useRandomPicker({ initialRawInput: '' }));
      act(() => {
        const picked = result.current.pick();
        expect(picked).toBeNull();
      });
      expect(result.current.selectedItem).toBeNull();
    });

    it('picks single item when only one exists', () => {
      const { result } = renderHook(() => useRandomPicker({ initialRawInput: 'Satu Saja' }));
      act(() => {
        const picked = result.current.pick();
        expect(picked).toBe('Satu Saja');
      });
      expect(result.current.selectedItem).toBe('Satu Saja');
      expect(result.current.history).toEqual(['Satu Saja']);
    });

    it('picks from list and avoids immediate repeat when allowRepeat is false', () => {
      const { result } = renderHook(() =>
        useRandomPicker({
          initialRawInput: 'Ahmad\nBudi',
          allowImmediateRepeat: false,
        }),
      );

      let firstPick: string | null = null;
      let secondPick: string | null = null;

      act(() => {
        firstPick = result.current.pick();
      });

      act(() => {
        secondPick = result.current.pick();
      });

      expect(firstPick).not.toBeNull();
      expect(secondPick).not.toBeNull();
      // With only 2 items and allowRepeat=false, second pick must differ from first pick
      expect(firstPick).not.toBe(secondPick);
      expect(result.current.history).toHaveLength(2);
    });

    it('clears selection and history', () => {
      const { result } = renderHook(() =>
        useRandomPicker({ initialRawInput: 'Ahmad\nBudi\nCitra' }),
      );

      act(() => {
        result.current.pick();
        result.current.clear();
      });

      expect(result.current.selectedItem).toBeNull();
      expect(result.current.history).toEqual([]);
      expect(result.current.itemCount).toBe(3);
    });
  });
});
