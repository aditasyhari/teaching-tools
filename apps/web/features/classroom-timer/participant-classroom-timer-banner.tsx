'use client';

import React from 'react';
import { Clock, Tag } from 'lucide-react';
import { Badge } from '@walikelas/ui';
import type { ClassroomTimerState } from '@walikelas/types';
import { formatTime } from './use-classroom-timer';

interface ParticipantClassroomTimerBannerProps {
  timer: ClassroomTimerState | null;
  remaining: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
}

export function ParticipantClassroomTimerBanner({
  timer,
  remaining,
  progress,
  isRunning,
  isPaused,
  isCompleted,
}: ParticipantClassroomTimerBannerProps): React.JSX.Element | null {
  // If no timer or if timer is PRIVATE_TIMER or IDLE, do not render
  if (!timer || timer.visibility === 'PRIVATE_TIMER') {
    return null;
  }

  // If timer is IDLE and not yet started, we can either hide or show ready state
  // Only show if RUNNING, PAUSED, or COMPLETED
  if (!isRunning && !isPaused && !isCompleted) {
    return null;
  }

  return (
    <div
      className={`w-full mb-4 rounded-2xl border transition-all overflow-hidden shadow-sm ${
        isCompleted
          ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-900 animate-pulse'
          : isPaused
            ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-900'
            : 'bg-indigo-50/80 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800'
      }`}
    >
      <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
        {/* Left side: Icon, Status, Label */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              isCompleted
                ? 'bg-rose-600 text-white'
                : isPaused
                  ? 'bg-amber-500 text-white'
                  : 'bg-indigo-600 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {isRunning && (
                <Badge variant="success" size="sm">
                  Waktu Berjalan
                </Badge>
              )}
              {isPaused && (
                <Badge variant="warning" size="sm">
                  Timer Dijeda
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="danger" size="sm">
                  Waktu Habis!
                </Badge>
              )}
            </div>

            {timer.label && (
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                <Tag className="w-3 h-3 flex-shrink-0 text-slate-400" />
                <span className="truncate">{timer.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Countdown digits */}
        <div className="flex-shrink-0 text-right">
          <span
            className={`font-mono font-black text-2xl sm:text-3xl tracking-tight ${
              isCompleted
                ? 'text-rose-600 dark:text-rose-400'
                : isPaused
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-indigo-600 dark:text-indigo-400'
            }`}
          >
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Thin bottom progress bar */}
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full transition-all duration-300 ${
            isCompleted
              ? 'bg-rose-500'
              : isPaused
                ? 'bg-amber-500'
                : 'bg-indigo-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

