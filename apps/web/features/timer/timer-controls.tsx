'use client';

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@walikelas/ui';

export interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  isFullscreen?: boolean;
}

export function TimerControls({
  isRunning,
  isPaused,
  isCompleted,
  onStart,
  onPause,
  onResume,
  onReset,
  isFullscreen = false,
}: TimerControlsProps): React.JSX.Element {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${
        isFullscreen ? 'mt-6' : 'mt-8'
      }`}
    >
      {/* Primary Action Button (Start / Pause / Resume / Repeat) */}
      {isCompleted ? (
        <Button
          variant="primary"
          size={isFullscreen ? 'lg' : 'lg'}
          className="px-8 py-3.5 text-base font-bold bg-amber-500 hover:bg-amber-600 text-stone-900 border-amber-600 shadow-sm"
          leftIcon={<RotateCcw className="w-5 h-5 fill-current" aria-hidden="true" />}
          onClick={onReset}
          aria-label="Ulangi timer (Spasi)"
        >
          <span>Ulangi Timer</span>
          <kbd className="hidden sm:inline-block ml-2.5 px-1.5 py-0.5 text-[11px] font-mono rounded bg-amber-600/20 text-stone-900 font-bold uppercase tracking-wider">
            Spasi
          </kbd>
        </Button>
      ) : !isRunning && !isPaused ? (
        <Button
          variant="primary"
          size="lg"
          className="px-8 py-3.5 text-base font-bold bg-amber-500 hover:bg-amber-600 text-stone-900 border-amber-600 shadow-sm"
          leftIcon={<Play className="w-5 h-5 fill-current" aria-hidden="true" />}
          onClick={onStart}
          aria-label="Mulai timer (Spasi)"
        >
          <span>Mulai Timer</span>
          <kbd className="hidden sm:inline-block ml-2.5 px-1.5 py-0.5 text-[11px] font-mono rounded bg-amber-600/20 text-stone-900 font-bold uppercase tracking-wider">
            Spasi
          </kbd>
        </Button>
      ) : isRunning && !isPaused ? (
        <Button
          variant="secondary"
          size="lg"
          className="px-8 py-3.5 text-base font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80 shadow-xs"
          leftIcon={<Pause className="w-5 h-5 fill-current" aria-hidden="true" />}
          onClick={onPause}
          aria-label="Jeda timer (Spasi)"
        >
          <span>Jeda</span>
          <kbd className="hidden sm:inline-block ml-2.5 px-1.5 py-0.5 text-[11px] font-mono rounded bg-amber-200/80 text-amber-900 font-bold uppercase tracking-wider">
            Spasi
          </kbd>
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          className="px-8 py-3.5 text-base font-bold bg-amber-500 hover:bg-amber-600 text-stone-900 border-amber-600 shadow-sm"
          leftIcon={<Play className="w-5 h-5 fill-current" aria-hidden="true" />}
          onClick={onResume}
          aria-label="Lanjutkan timer (Spasi)"
        >
          <span>Lanjutkan</span>
          <kbd className="hidden sm:inline-block ml-2.5 px-1.5 py-0.5 text-[11px] font-mono rounded bg-amber-600/20 text-stone-900 font-bold uppercase tracking-wider">
            Spasi
          </kbd>
        </Button>
      )}

      {/* Secondary Reset Button */}
      <Button
        variant="outline"
        size="lg"
        className="px-6 py-3.5 text-base font-semibold border-[#e8e4dc] bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-xs"
        leftIcon={<RotateCcw className="w-4 h-4 text-stone-600" aria-hidden="true" />}
        onClick={onReset}
        aria-label="Atur ulang timer (R)"
      >
        <span>Reset</span>
        <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[11px] font-mono rounded bg-stone-100 text-stone-600 font-bold border border-stone-200 uppercase tracking-wider">
          R
        </kbd>
      </Button>
    </div>
  );
}

