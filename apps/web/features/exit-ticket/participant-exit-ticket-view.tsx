'use client';

import React, { useState } from 'react';
import {
  ClipboardCheck,
  Send,
  Clock,
  ShieldCheck,
  User,
  AlertCircle,
  CheckCircle2,
  Lock,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { ExitTicketQuestion, ExitTicketStatus, ExitTicketAnswer } from '@walikelas/types';

interface ParticipantExitTicketViewProps {
  activity: {
    id: string;
    title: string;
    status: ExitTicketStatus;
    isAnonymous: boolean;
    questions: ExitTicketQuestion[];
  } | null;
  hasSubmitted: boolean;
  submittedAt?: number;
  onSubmit: (answers: ExitTicketAnswer[]) => void;
  isSubmitting: boolean;
  cooldown: number;
  error: string | null;
  successMessage: string | null;
  onClearError: () => void;
  onClearSuccess: () => void;
}

function formatElapsed(ts?: number): string {
  if (!ts) return 'Baru saja';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return `${diffSec}d yang lalu`;
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin}m yang lalu`;
}

export function ParticipantExitTicketView({
  activity,
  hasSubmitted,
  submittedAt,
  onSubmit,
  isSubmitting,
  cooldown,
  error,
  successMessage,
  onClearError,
  onClearSuccess,
}: ParticipantExitTicketViewProps) {
  const [answers, setAnswers] = useState<Record<string, number | string>>({});

  const handleValueChange = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || isSubmitting || cooldown > 0) return;

    const formattedAnswers: ExitTicketAnswer[] = Object.entries(answers).map(
      ([questionId, value]) => ({ questionId, value }),
    );

    onSubmit(formattedAnswers);
  };

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e4dc] bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900/60 shadow-2xs">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100/80 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          Belum Ada Exit Ticket Aktif
        </h3>
        <p className="mt-1 max-w-sm text-xs text-stone-500 dark:text-stone-400">
          Guru belum memulai aktivitas Exit Ticket pada sesi ini. Tetap perhatikan layar kelas!
        </p>
      </div>
    );
  }

  // Already submitted state
  if (hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30 shadow-2xs space-y-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Refleksi Anda Sudah Terkirim!
        </h3>
        <p className="max-w-sm text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Terima kasih telah mengisi Exit Ticket hari ini. Tanggapan Anda sangat berharga bagi guru
          untuk memahami proses belajar kelas kita.
        </p>
        {submittedAt && (
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-400 pt-1">
            <Clock className="h-3.5 w-3.5" />
            Terkirim {formatElapsed(submittedAt)}
          </span>
        )}
      </div>
    );
  }

  // Closed without submitting
  if (activity.status === 'CLOSED') {
    return (
      <div className="flex items-center gap-3.5 rounded-2xl border border-[#e8e4dc] bg-stone-50 p-5 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-850 dark:text-stone-400 shadow-2xs">
        <Lock className="h-5 w-5 text-stone-400 shrink-0" />
        <div>
          <h4 className="font-bold text-stone-900 dark:text-stone-100">Exit Ticket Ditutup</h4>
          <p className="mt-0.5">Aktivitas refleksi akhir telah ditutup oleh guru.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 sm:p-6 dark:border-teal-900/40 dark:bg-teal-950/20 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
              Exit Ticket
            </span>
          </div>

          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            {activity.status === 'OPEN' ? 'Terbuka' : 'Menunggu'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-1 break-words">
          {activity.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
          {activity.isAnonymous ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 border border-[#e8e4dc] dark:border-stone-800 dark:bg-stone-900 text-stone-700 dark:text-stone-300 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
              Tanggapan dikirim secara anonim
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 border border-[#e8e4dc] dark:border-stone-800 dark:bg-stone-900 text-stone-700 dark:text-stone-300 shadow-2xs">
              <User className="h-3.5 w-3.5 text-stone-500" />
              Nama Anda akan dilihat guru
            </span>
          )}
          <span>•</span>
          <span className="font-semibold">{activity.questions.length} Pertanyaan</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={onClearError}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-red-600 hover:text-red-800 dark:text-red-400"
            aria-label="Tutup notifikasi error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={onClearSuccess}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
            aria-label="Tutup notifikasi berhasil"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {activity.questions.map((q, idx) => {
          const currentVal = answers[q.id];

          return (
            <div
              key={q.id}
              className="rounded-2xl border border-[#e8e4dc] bg-white p-5 sm:p-6 dark:border-stone-800 dark:bg-stone-900 shadow-2xs space-y-3.5"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Pertanyaan {idx + 1} dari {activity.questions.length}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 mt-1 leading-snug">
                  {q.prompt} {q.required && <span className="text-red-500">*</span>}
                </h4>
              </div>

              {/* SCALE Question input */}
              {q.type === 'SCALE' && (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = currentVal === val;

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleValueChange(q.id, val)}
                          className={`flex flex-col items-center justify-center min-h-[52px] py-3 rounded-xl border font-bold text-base transition-all duration-150 ease-out active:scale-[0.96] ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm ring-2 ring-amber-500/20'
                              : 'bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                          }`}
                        >
                          <Star
                            className={`h-4 w-4 mb-1 ${
                              isSelected ? 'fill-stone-950 text-stone-950' : 'text-stone-400'
                            }`}
                          />
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                  {(q.scale?.minLabel || q.scale?.maxLabel) && (
                    <div className="flex justify-between text-xs text-stone-500 px-1 font-medium">
                      <span>1 = {q.scale?.minLabel || 'Kurang'}</span>
                      <span>5 = {q.scale?.maxLabel || 'Sangat'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* MULTIPLE_CHOICE Question input */}
              {q.type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2 pt-1">
                  {(q.options || []).map((opt) => {
                    const isSelected = currentVal === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleValueChange(q.id, opt.id)}
                        className={`w-full min-h-[48px] text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-950 dark:bg-teal-950/40 dark:border-teal-600 dark:text-teal-200 shadow-2xs'
                            : 'bg-stone-50/60 hover:bg-stone-100 border-stone-200 text-stone-700 dark:bg-stone-800/60 dark:border-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span>{opt.text}</span>
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                            isSelected ? 'border-teal-700 bg-teal-700' : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SHORT_TEXT Question input */}
              {q.type === 'SHORT_TEXT' && (
                <div className="space-y-1.5 pt-1">
                  <textarea
                    value={typeof currentVal === 'string' ? currentVal : ''}
                    onChange={(e) => handleValueChange(q.id, e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="Tuliskan jawaban Anda di sini..."
                    className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 text-sm text-stone-900 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 transition-all"
                  />
                  <div className="flex justify-end text-xs text-stone-400">
                    {typeof currentVal === 'string' ? currentVal.length : 0}/300
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || cooldown > 0}
            className="w-full min-h-[48px] bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 text-sm rounded-xl gap-2 shadow-xs"
          >
            <Send className="h-4 w-4" />
            {isSubmitting
              ? 'Mengirimkan...'
              : cooldown > 0
                ? `Tunggu ${cooldown}s...`
                : 'Kirimkan Refleksi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
