'use client';

import React, { useState } from 'react';
import { BarChart2, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { PollOption, PollSettings } from '@walikelas/types';

interface ParticipantLivePollViewProps {
  isPollActive: boolean;
  isPollClosed: boolean;
  pollId: string | null;
  title: string;
  question: string;
  options: PollOption[];
  settings: PollSettings;
  hasResponded: boolean;
  selectedOptionIds: string[];
  distribution?: Record<string, number>;
  percentages?: Record<string, number>;
  responseCount?: number;
  onSubmitResponse: (pollId: string, optionId?: string, optionIds?: string[]) => void;
}

const OPTION_STYLES = [
  'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100',
  'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
  'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100',
  'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-100',
  'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100',
  'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 text-cyan-950 dark:text-cyan-100',
  'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100',
  'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 text-teal-950 dark:text-teal-100',
];

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
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-purple-600 text-white',
  'bg-rose-600 text-white',
  'bg-cyan-600 text-white',
  'bg-indigo-600 text-white',
  'bg-teal-600 text-white',
];

export function ParticipantLivePollView({
  isPollActive,
  isPollClosed,
  pollId,
  title,
  question,
  options,
  settings,
  hasResponded,
  selectedOptionIds,
  distribution,
  percentages,
  responseCount,
  onSubmitResponse,
}: ParticipantLivePollViewProps): React.JSX.Element | null {
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  if (!isPollActive && !isPollClosed && !pollId) {
    return null;
  }

  const isMultiple = settings.allowMultiple;
  const isLocked = hasResponded || isPollClosed;
  const showResults = Boolean(
    (settings.showResultsToParticipants || isPollClosed) && distribution && percentages,
  );

  const handleOptionClick = (optionId: string) => {
    if (isLocked || !pollId) return;

    if (isMultiple) {
      setLocalSelected((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      );
    } else {
      // Single choice: submit immediately on tap
      setLocalSelected([optionId]);
      onSubmitResponse(pollId, optionId);
    }
  };

  const handleMultipleSubmit = () => {
    if (isLocked || !pollId || localSelected.length === 0) return;
    onSubmitResponse(pollId, undefined, localSelected);
  };

  const effectiveSelected = hasResponded ? selectedOptionIds : localSelected;

  return (
    <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 sm:p-7 shadow-xs space-y-5 animate-in fade-in-50 duration-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-3 border-b border-[#e8e4dc] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-200/60">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                {isPollClosed ? 'Polling Ditutup' : 'Live Polling'}
              </span>
              <span className="text-[11px] text-stone-500">
                {isMultiple ? 'Boleh pilih lebih dari satu' : 'Pilih satu jawaban'}
                {responseCount !== undefined &&
                  responseCount > 0 &&
                  ` • ${responseCount} suara masuk`}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 line-clamp-1">{title}</h2>
          </div>
        </div>

        {hasResponded && (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terkirim
          </span>
        )}
      </div>

      {/* Question */}
      <div className="bg-stone-50 border border-[#e8e4dc] rounded-xl p-4 sm:p-5">
        <p className="text-base sm:text-lg font-medium text-stone-900 leading-relaxed">
          {question}
        </p>
      </div>

      {/* State Notice after submission */}
      {hasResponded && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Respon Anda Berhasil Dikirim!</span>
          </div>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
            {showResults
              ? 'Berikut adalah distribusi hasil jawaban seluruh kelas saat ini:'
              : 'Hasil polling akan ditampilkan oleh guru di layar projector.'}
          </p>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-3">
        {options.map((opt, index) => {
          const isSelected = effectiveSelected.includes(opt.id);
          const optStyle = OPTION_STYLES[index % OPTION_STYLES.length];
          const badgeColor = OPTION_BADGE_COLORS[index % OPTION_BADGE_COLORS.length];
          const barColor = OPTION_BAR_COLORS[index % OPTION_BAR_COLORS.length];

          const pct = percentages?.[opt.id] ?? 0;
          const count = distribution?.[opt.id] ?? 0;

          return (
            <div key={opt.id} className="space-y-1.5">
              <button
                type="button"
                disabled={isLocked}
                onClick={() => handleOptionClick(opt.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-sm font-medium ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
                    : isLocked
                      ? 'opacity-85 border-border bg-card cursor-not-allowed'
                      : `${optStyle} shadow-sm active:scale-[0.99]`
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${badgeColor}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-foreground font-medium text-sm sm:text-base truncate">
                    {opt.optionText}
                  </span>
                </div>

                {isSelected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
              </button>

              {/* Show Percentage Bar if results visible */}
              {showResults && (
                <div className="px-2 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{count} suara</span>
                    <span className="font-bold text-foreground">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-500 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Multiple Choice Submit Action */}
      {isMultiple && !isLocked && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleMultipleSubmit}
            disabled={localSelected.length === 0}
            className="w-full gap-2 text-base font-semibold"
          >
            <Send className="w-4 h-4" />
            Kirim Respon ({localSelected.length} Dipilih)
          </Button>
        </div>
      )}
    </div>
  );
}
