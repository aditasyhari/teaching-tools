'use client';

import React from 'react';
import { BarChart2, Users, Lock, X } from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { TeacherLivePollSnapshot } from '@walikelas/types';

interface TeacherLivePollHudProps {
  isPollActive: boolean;
  isPollClosed: boolean;
  teacherSnapshot: TeacherLivePollSnapshot | null;
  distribution: Record<string, number>;
  percentages: Record<string, number>;
  responseCount: number;
  totalParticipants: number;
  responseRate: number;
  onClosePoll: () => void;
  onDismiss?: () => void;
}

const OPTION_BAR_COLORS = [
  'bg-blue-600 dark:bg-blue-500',
  'bg-emerald-600 dark:bg-emerald-500',
  'bg-amber-600 dark:bg-amber-500',
  'bg-purple-600 dark:bg-purple-500',
  'bg-rose-600 dark:bg-rose-500',
  'bg-cyan-600 dark:bg-cyan-500',
  'bg-indigo-600 dark:bg-indigo-500',
  'bg-teal-600 dark:bg-teal-500',
];

const OPTION_BADGE_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
  'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
];

export function TeacherLivePollHud({
  isPollActive,
  isPollClosed,
  teacherSnapshot,
  distribution,
  percentages,
  responseCount,
  totalParticipants,
  responseRate,
  onClosePoll,
  onDismiss,
}: TeacherLivePollHudProps): React.JSX.Element | null {
  if (!isPollActive && !isPollClosed && !teacherSnapshot) {
    return null;
  }

  const title = teacherSnapshot?.title || 'Live Polling';
  const question = teacherSnapshot?.question || '';
  const options = teacherSnapshot?.options || [];
  const isMultiple = teacherSnapshot?.type === 'MULTIPLE_CHOICE';

  return (
    <div className="bg-white border border-[#e8e4dc] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e4dc] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-200/60">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isPollActive ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  POLLING BERLANGSUNG
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  <Lock className="w-3.5 h-3.5" />
                  POLLING DITUTUP
                </span>
              )}
              <span className="text-xs font-medium text-stone-500">
                {isMultiple ? 'Pilihan Ganda' : 'Pilihan Tunggal'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mt-0.5">{title}</h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isPollActive ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Lock className="w-4 h-4 text-amber-600" />}
              onClick={onClosePoll}
            >
              Tutup Polling & Kunci Hasil
            </Button>
          ) : (
            onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss} className="gap-1.5">
                <X className="w-4 h-4" />
                Selesai / Tutup Panel
              </Button>
            )
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-stone-50 border border-[#e8e4dc] rounded-xl p-4 sm:p-5">
        <span className="text-xs font-bold text-stone-500 tracking-wider uppercase block mb-1">
          Pertanyaan
        </span>
        <p className="text-base sm:text-lg font-medium text-stone-900 leading-relaxed">
          {question}
        </p>
      </div>

      {/* Response Metrics & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Users className="w-4 h-4 text-amber-600" />
            <span>
              Respon Masuk: <strong className="text-stone-900">{responseCount}</strong>
              {totalParticipants > 0 && ` dari ${totalParticipants} murid online`}
            </span>
          </div>
          <span className="text-stone-500 font-bold">{responseRate}% Terkumpul</span>
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, responseRate)}%` }}
          />
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-3 pt-2">
        {options.map((opt, index) => {
          const count = distribution[opt.id] || 0;
          const pct =
            percentages[opt.id] ??
            (responseCount > 0 ? Math.round((count / responseCount) * 100) : 0);
          const barColor = OPTION_BAR_COLORS[index % OPTION_BAR_COLORS.length];
          const badgeColor = OPTION_BADGE_COLORS[index % OPTION_BADGE_COLORS.length];

          return (
            <div
              key={opt.id}
              className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${badgeColor}`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium text-foreground truncate">{opt.optionText}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-foreground text-sm">{pct}%</span>
                  <span className="text-xs text-muted-foreground ml-1.5">({count} respon)</span>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
