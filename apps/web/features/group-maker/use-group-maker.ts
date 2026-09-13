'use client';

import { useState, useCallback } from 'react';

export type GroupMode = 'BY_COUNT' | 'BY_SIZE';

export interface GroupResult {
  groupNumber: number;
  members: string[];
}

export function parseItems(rawInput: string): string[] {
  return rawInput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = temp;
  }
  return result;
}

export function createBalancedGroups(
  items: string[],
  mode: GroupMode,
  targetValue: number,
): GroupResult[] {
  if (items.length === 0 || targetValue <= 0) {
    return [];
  }

  const shuffled = shuffleArray(items);
  let groupCount: number;

  if (mode === 'BY_COUNT') {
    // Mode A: Number of groups
    groupCount = Math.min(targetValue, shuffled.length);
  } else {
    // Mode B: Group size
    const targetSize = targetValue;
    groupCount = Math.max(1, Math.ceil(shuffled.length / targetSize));
  }

  const groups: GroupResult[] = Array.from({ length: groupCount }, (_, idx) => ({
    groupNumber: idx + 1,
    members: [],
  }));

  // Distribute round-robin for optimal balance (e.g. 10 items into 3 groups -> 4, 3, 3)
  shuffled.forEach((item, idx) => {
    const targetGroup = groups[idx % groupCount];
    if (targetGroup) {
      targetGroup.members.push(item);
    }
  });

  return groups;
}

export function useGroupMaker(initialRawInput = '') {
  const [rawInput, setRawInput] = useState(initialRawInput);
  const [mode, setMode] = useState<GroupMode>('BY_COUNT');
  const [targetValue, setTargetValue] = useState<number>(4);
  const [groups, setGroups] = useState<GroupResult[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const items = parseItems(rawInput);

  const generate = useCallback(() => {
    if (items.length === 0) {
      setGroups([]);
      setHasGenerated(false);
      return;
    }

    const res = createBalancedGroups(items, mode, targetValue);
    setGroups(res);
    setHasGenerated(true);
  }, [items, mode, targetValue]);

  const reset = useCallback(() => {
    setGroups([]);
    setHasGenerated(false);
  }, []);

  const formatCopyText = useCallback((): string => {
    if (groups.length === 0) return '';
    return groups
      .map(
        (g) =>
          `Kelompok ${g.groupNumber} (${g.members.length} siswa):\n${g.members
            .map((m, i) => `  ${i + 1}. ${m}`)
            .join('\n')}`,
      )
      .join('\n\n');
  }, [groups]);

  return {
    rawInput,
    setRawInput,
    items,
    itemCount: items.length,
    mode,
    setMode,
    targetValue,
    setTargetValue,
    groups,
    hasGenerated,
    generate,
    reset,
    formatCopyText,
  };
}
