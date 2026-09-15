'use client';

import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { formatTime } from './use-timer';

export interface TimerStageProps {
  remaining: number;
  duration: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isFullscreen?: boolean;
  onAddSeconds?: (seconds: number) => void;
}

export function TimerStage({
  remaining,
  duration: _duration,
  progress,
  isRunning,
  isPaused,
  isCompleted,
  isFullscreen = false,
  onAddSeconds,
}: TimerStageProps): React.JSX.Element {
  const formattedTime = formatTime(remaining);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div
      className={`relative w-full transition-all duration-300 flex flex-col items-center justify-center text-center select-none ${
        isFullscreen
          ? 'py-8 px-4 flex-1'
          : `bg-white rounded-3xl border-2 p-5 xs:p-8 sm:p-12 lg:p-16 shadow-xs ${
              isCompleted
                ? 'border-red-400 bg-red-50/40 ring-4 ring-red-100/70'
                : isRunning && !isPaused
                  ? 'border-amber-400 ring-4 ring-amber-100/60'
                  : isPaused
                    ? 'border-stone-300 ring-4 ring-stone-100/60'
                    : 'border-[#e8e4dc]'
            }`
      }`}
    >
      {/* Visual Countdown Digits with Tabular Monospace Font */}
      <div
        role="timer"
        aria-label={`Sisa waktu: ${minutes} menit ${seconds} detik`}
        className={`font-mono tabular-nums font-black tracking-tight transition-colors duration-200 ${
          isFullscreen
            ? 'text-7xl xs:text-8xl sm:text-[11rem] md:text-[14rem] lg:text-[17rem] leading-none'
            : 'text-6xl xs:text-7xl sm:text-9xl md:text-[10rem] lg:text-[11.5rem] leading-none'
        } ${
          isCompleted
            ? 'text-red-600 animate-pulse'
            : isPaused
              ? 'text-stone-500'
              : 'text-stone-900'
        }`}
      >
        {formattedTime}
      </div>

      {/* Visual Progress Bar */}
      <div
        className={`w-full ${
          isFullscreen ? 'max-w-2xl' : 'max-w-md sm:max-w-lg'
        } bg-[#f2ede4] h-3.5 rounded-full mt-6 sm:mt-10 overflow-hidden shadow-inner`}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kemajuan waktu timer"
      >
        <div
          className={`h-full transition-all duration-200 ease-out rounded-full ${
            isCompleted ? 'bg-red-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-100 text-red-800 border border-red-200 font-bold text-sm sm:text-base animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
          <span>Waktu pembelajaran telah selesai!</span>
        </div>
      )}

      {/* Quick Add Time Chips (Available during active teaching) */}
      {onAddSeconds && (isRunning || isPaused) && (
        <div className="mt-6 flex items-center gap-2.5 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => onAddSeconds(60)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200/80 active:scale-95 min-h-[44px]"
            aria-label="Tambah 1 menit ke timer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>+1 Menit</span>
          </button>
          <button
            type="button"
            onClick={() => onAddSeconds(300)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200/80 active:scale-95 min-h-[44px]"
            aria-label="Tambah 5 menit ke timer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>+5 Menit</span>
          </button>
        </div>
      )}
    </div>
  );
}
