'use client';

import { useState, useCallback } from 'react';

export interface UseRandomPickerOptions {
  initialRawInput?: string;
  allowImmediateRepeat?: boolean;
}

export function parseItems(rawInput: string): string[] {
  return rawInput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function useRandomPicker({
  initialRawInput = '',
  allowImmediateRepeat = false,
}: UseRandomPickerOptions = {}) {
  const [rawInput, setRawInput] = useState(initialRawInput);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [allowRepeat, setAllowRepeat] = useState(allowImmediateRepeat);
  const [isPicking, setIsPicking] = useState(false);

  const items = parseItems(rawInput);

  const pick = useCallback((): string | null => {
    if (items.length === 0) {
      setSelectedItem(null);
      return null;
    }

    if (items.length === 1) {
      const chosen = items[0]!;
      setSelectedItem(chosen);
      setHistory((prev) => [chosen, ...prev]);
      return chosen;
    }

    let candidates = items;
    // Avoid immediately picking the exact same item as the previous selection
    if (!allowRepeat && selectedItem) {
      const filtered = items.filter((item) => item !== selectedItem);
      if (filtered.length > 0) {
        candidates = filtered;
      }
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[randomIndex]!;

    setIsPicking(true);
    setSelectedItem(chosen);
    setHistory((prev) => [chosen, ...prev]);

    // Fast reveal reset
    setTimeout(() => {
      setIsPicking(false);
    }, 400);

    return chosen;
  }, [allowRepeat, items, selectedItem]);

  const clear = useCallback(() => {
    setSelectedItem(null);
    setHistory([]);
  }, []);

  const resetAll = useCallback(() => {
    setRawInput('');
    setSelectedItem(null);
    setHistory([]);
  }, []);

  return {
    rawInput,
    setRawInput,
    items,
    itemCount: items.length,
    selectedItem,
    history,
    allowRepeat,
    setAllowRepeat,
    isPicking,
    pick,
    clear,
    resetAll,
  };
}
