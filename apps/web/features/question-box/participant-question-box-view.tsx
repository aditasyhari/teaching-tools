'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Shield,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { ParticipantQuestionItem, SharedQuestionItem } from '@walikelas/types';

interface ParticipantQuestionBoxViewProps {
  myQuestions: ParticipantQuestionItem[];
  highlightedQuestion: SharedQuestionItem | null;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  onSubmit: (content: string, isAnonymous: boolean) => void;
  onClearError: () => void;
  onClearSuccess: () => void;
}

export function ParticipantQuestionBoxView({
  myQuestions,
  highlightedQuestion,
  isSubmitting,
  error,
  successMessage,
  onSubmit,
  onClearError,
  onClearSuccess,
}: ParticipantQuestionBoxViewProps) {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const charCount = content.length;
  const isTooLong = charCount > 500;
  const isEmpty = content.trim().length === 0;
  const canSubmit = !isEmpty && !isTooLong && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit(content, isAnonymous);
    setContent('');
  };

  return (
    <div className="space-y-6">
      {/* Featured / Highlighted Question from Teacher (if any) */}
      {highlightedQuestion && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/70 p-5 shadow-md dark:border-amber-500/60 dark:bg-amber-950/30 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Sedang Dibahas Guru
            </span>
            <span className="ml-auto text-[11px] text-amber-700/70 dark:text-amber-300/70">
              {highlightedQuestion.isAnonymous ? 'Anonim' : highlightedQuestion.authorName}
            </span>
          </div>

          <p className="text-base font-semibold text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
            {highlightedQuestion.content}
          </p>
        </div>
      )}

      {/* Composer Section */}
      <div className="rounded-2xl border border-[#e8e4dc] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-amber-50 border border-amber-200/60 rounded-lg text-amber-600">
            <HelpCircle className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Tanya Guru</h3>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          Tuliskan hal yang belum Anda pahami. Pertanyaan akan masuk ke daftar pertanyaan guru.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={onClearError}
              className="font-bold hover:underline text-rose-700"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={onClearSuccess}
              className="font-bold hover:underline text-emerald-700"
            >
              Tutup
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contoh: Bagian rumus percepatan tadi maksudnya bagaimana?"
              className={`w-full rounded-xl border p-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-colors ${
                isTooLong
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-[#e8e4dc] focus:border-amber-500 focus:ring-amber-500'
              }`}
            />

            <div className="mt-1 flex items-center justify-between text-xs text-stone-400">
              <span className="text-[11px]">Maksimal 500 karakter</span>
              <span className={isTooLong ? 'font-bold text-rose-600' : ''}>{charCount}/500</span>
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-[#e8e4dc] text-amber-500 focus:ring-amber-400 h-4 w-4"
              />
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-stone-500" />
                Kirim sebagai Anonim
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!canSubmit}
              leftIcon={<Send className="h-3.5 w-3.5" />}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Pertanyaan'}
            </Button>
          </div>
        </form>
      </div>

      {/* My Questions List */}
      <div className="rounded-2xl border border-[#e8e4dc] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-stone-900">
            Pertanyaan Saya ({myQuestions.length})
          </h3>
        </div>

        {myQuestions.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            Anda belum mengajukan pertanyaan dalam sesi ini.
          </div>
        ) : (
          <div className="space-y-3">
            {myQuestions.map((q) => (
              <div
                key={q.id}
                className={`rounded-xl border p-3.5 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  q.status === 'HIGHLIGHTED'
                    ? 'border-amber-400 bg-amber-50/50'
                    : q.status === 'ANSWERED'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-[#e8e4dc] bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {q.isAnonymous && (
                      <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-medium text-stone-700">
                        Anonim
                      </span>
                    )}
                  </div>

                  <div>
                    {q.status === 'HIGHLIGHTED' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-stone-950">
                        <Sparkles className="h-2.5 w-2.5" />
                        Sedang Dibahas
                      </span>
                    ) : q.status === 'ANSWERED' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Telah Dijawab
                      </span>
                    ) : q.status === 'DISMISSED' ? (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                        Diabaikan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200/60">
                        <Clock className="h-2.5 w-2.5" />
                        Menunggu Guru
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
                  {q.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
