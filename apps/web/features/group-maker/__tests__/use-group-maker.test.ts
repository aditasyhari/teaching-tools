import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGroupMaker, createBalancedGroups } from '../use-group-maker';

describe('useGroupMaker Hook & Algorithm', () => {
  describe('createBalancedGroups', () => {
    const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']; // 10 items

    it('distributes 10 items into 3 groups evenly (4, 3, 3) in BY_COUNT mode', () => {
      const groups = createBalancedGroups(items, 'BY_COUNT', 3);
      expect(groups).toHaveLength(3);

      const totalMembers = groups.reduce((acc, g) => acc + g.members.length, 0);
      expect(totalMembers).toBe(10);

      // Sizes should differ by at most 1
      const sizes = groups.map((g) => g.members.length);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    });

    it('distributes 10 items with target size 4 in BY_SIZE mode into 3 groups', () => {
      const groups = createBalancedGroups(items, 'BY_SIZE', 4);
      // Math.ceil(10 / 4) = 3 groups
      expect(groups).toHaveLength(3);

      const totalMembers = groups.reduce((acc, g) => acc + g.members.length, 0);
      expect(totalMembers).toBe(10);
    });

    it('handles empty items cleanly', () => {
      const groups = createBalancedGroups([], 'BY_COUNT', 4);
      expect(groups).toEqual([]);
    });
  });

  describe('useGroupMaker hook interactions', () => {
    it('generates groups, reformats copy text, and resets', () => {
      const { result } = renderHook(() => useGroupMaker('Ahmad\nBudi\nCitra\nDewi'));

      expect(result.current.itemCount).toBe(4);
      expect(result.current.hasGenerated).toBe(false);

      act(() => {
        result.current.generate();
      });

      expect(result.current.hasGenerated).toBe(true);
      expect(result.current.groups.length).toBeGreaterThan(0);

      const copyText = result.current.formatCopyText();
      expect(copyText).toContain('Kelompok 1');

      act(() => {
        result.current.reset();
      });

      expect(result.current.hasGenerated).toBe(false);
      expect(result.current.groups).toEqual([]);
    });
  });
});
