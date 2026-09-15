'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button, Card } from '@walikelas/ui';

export interface PresetItem {
  label: string;
  seconds: number;
}

export const TIMER_PRESETS: PresetItem[] = [
  { label: '1 Menit', seconds: 60 },
  { label: '3 Menit', seconds: 180 },
  { label: '5 Menit', seconds: 300 },
  { label: '10 Menit', seconds: 600 },
  { label: '15 Menit', seconds: 900 },
];

export interface TimerPresetsProps {
  currentDuration: number;
  isRunning: boolean;
  onSelectPreset: (seconds: number) => void;
  onOpenCustom: () => void;
}

export function TimerPresets({
  currentDuration,
  isRunning,
  onSelectPreset,
  onOpenCustom,
}: TimerPresetsProps): React.JSX.Element {
  return (
    <Card className="p-5 sm:p-6 space-y-3.5 border-[#e8e4dc] bg-white shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Pilihan Durasi Cepat
        </h2>
        <span className="text-xs text-stone-600 hidden sm:inline">
          Pilih waktu atau tentukan sendiri
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {TIMER_PRESETS.map((preset) => {
          const isSelected = currentDuration === preset.seconds && !isRunning;
          return (
            <button
              key={preset.seconds}
              type="button"
              onClick={() => onSelectPreset(preset.seconds)}
              aria-pressed={isSelected}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-xs ring-2 ring-stone-900/10'
                  : 'bg-stone-100 hover:bg-stone-200/90 text-stone-700 hover:text-stone-900'
              }`}
            >
              {preset.label}
            </button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCustom}
          className="border-[#e8e4dc] text-stone-700 hover:bg-stone-100 font-semibold"
          leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />}
        >
          Durasi Kustom...
        </Button>
      </div>
    </Card>
  );
}

