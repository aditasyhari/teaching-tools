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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Belum Ada Exit Ticket Aktif
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Guru belum memulai aktivitas Exit Ticket pada sesi ini. Tetap perhatikan layar kelas!
        </p>
      </div>
    );
  }

  // Already submitted state
  if (hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30 shadow-sm space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Refleksi Anda Sudah Terkirim!
        </h3>
        <p className="max-w-sm text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Terima kasih telah mengisi Exit Ticket hari ini. Tanggapan Anda sangat berharga bagi guru
          untuk memahami proses belajar kelas kita.
        </p>
        {submittedAt && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            Terkirim {formatElapsed(submittedAt)}
          </span>
        )}
      </div>
    );
  }

  // Closed without submitting
  if (activity.status === 'CLOSED') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400 shadow-sm">
        <Lock className="h-5 w-5 text-slate-400 shrink-0" />
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200">Exit Ticket Ditutup</h4>
          <p className="mt-0.5">Aktivitas refleksi akhir telah ditutup oleh guru.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/90 to-emerald-50/50 p-5 dark:border-teal-900/60 dark:from-teal-950/30 dark:to-emerald-950/10 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Exit Ticket
            </span>
          </div>

          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            {activity.status === 'OPEN' ? 'Terbuka' : 'Menunggu'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 break-words">
          {activity.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          {activity.isAnonymous ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <ShieldCheck className="h-3 w-3 text-slate-500" />
              Tanggapan dikirim secara anonim
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <User className="h-3 w-3 text-slate-500" />
              Nama Anda akan dilihat guru
            </span>
          )}
          <span>•</span>
          <span>{activity.questions.length} Pertanyaan</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={onClearSuccess}
            className="text-emerald-500 hover:text-emerald-700 font-bold ml-2"
          >
            ✕
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
              className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pertanyaan {idx + 1} dari {activity.questions.length}
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {q.prompt} {q.required && <span className="text-red-500">*</span>}
                </h4>
              </div>

              {/* SCALE Question input */}
              {q.type === 'SCALE' && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = currentVal === val;

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleValueChange(q.id, val)}
                          className={`flex flex-col items-center justify-center py-3 rounded-xl border font-bold text-base transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-102'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Star
                            className={`h-4 w-4 mb-1 ${isSelected ? 'fill-white' : 'text-slate-400'}`}
                          />
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                  {(q.scale?.minLabel || q.scale?.maxLabel) && (
                    <div className="flex justify-between text-[11px] text-slate-400 px-1">
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
                        className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-teal-500 text-teal-900 dark:bg-teal-950/40 dark:border-teal-600 dark:text-teal-200'
                            : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{opt.text}</span>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SHORT_TEXT Question input */}
              {q.type === 'SHORT_TEXT' && (
                <div className="space-y-1 pt-1">
                  <textarea
                    value={typeof currentVal === 'string' ? currentVal : ''}
                    onChange={(e) => handleValueChange(q.id, e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="Tuliskan jawaban Anda di sini..."
                    className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <div className="flex justify-end text-[11px] text-slate-400">
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
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 text-sm rounded-xl gap-2 shadow-sm"
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
