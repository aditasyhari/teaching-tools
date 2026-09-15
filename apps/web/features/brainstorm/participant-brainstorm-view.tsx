'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Send,
  Clock,
  ShieldCheck,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@walikelas/ui';
import type {
  ParticipantBrainstormIdea,
  SharedBrainstormIdea,
  BrainstormActivityStatus,
  BrainstormSettings,
} from '@walikelas/types';

interface ParticipantBrainstormViewProps {
  activity: {
    id: string;
    prompt: string;
    status: BrainstormActivityStatus;
    settings: BrainstormSettings;
  } | null;
  myIdeas: ParticipantBrainstormIdea[];
  sharedIdeas: SharedBrainstormIdea[];
  canSubmit: boolean;
  totalIdeasCount: number;
  onSubmitIdea: (content: string) => void;
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

export function ParticipantBrainstormView({
  activity,
  myIdeas,
  sharedIdeas,
  canSubmit,
  totalIdeasCount,
  onSubmitIdea,
  isSubmitting,
  cooldown,
  error,
  successMessage,
  onClearError,
  onClearSuccess,
}: ParticipantBrainstormViewProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || cooldown > 0 || isSubmitting) return;
    onSubmitIdea(content.trim());
    setContent('');
  };

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e4dc] bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900/60 shadow-2xs">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100/80 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          <Lightbulb className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          Belum Ada Papan Ide Aktif
        </h3>
        <p className="mt-1 max-w-sm text-xs text-stone-500 dark:text-stone-400">
          Guru belum memulai aktivitas papan ide pada sesi ini. Tetap perhatikan layar kelas!
        </p>
      </div>
    );
  }

  const isClosed = activity.status === 'CLOSED';
  const isPaused = activity.status === 'PAUSED';
  const isOpen = activity.status === 'OPEN';

  return (
    <div className="space-y-6">
      {/* Prompt Card */}
      <div className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-5 sm:p-6 dark:border-violet-900/40 dark:bg-violet-950/20 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
              <Lightbulb className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">
              Papan Ide Kelas
            </span>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
              isOpen
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                : isPaused
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
            }`}
          >
            {isOpen && 'Menerima Ide'}
            {isPaused && 'Dijeda Sementara'}
            {isClosed && 'Aktivitas Ditutup'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-2 leading-snug break-words">
          {activity.prompt}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
          {activity.settings.isAnonymous ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 border border-[#e8e4dc] dark:border-stone-800 dark:bg-stone-900 text-stone-700 dark:text-stone-300 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
              Nama Anda anonim
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 border border-[#e8e4dc] dark:border-stone-800 dark:bg-stone-900 text-stone-700 dark:text-stone-300 shadow-2xs">
              <User className="h-3.5 w-3.5 text-stone-500" />
              Nama ditampilkan
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 border border-[#e8e4dc] dark:border-stone-800 dark:bg-stone-900 text-stone-700 dark:text-stone-300 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-stone-500" />
            {activity.settings.ideasVisibleToParticipants
              ? 'Ide terlihat oleh peserta lain'
              : 'Ide hanya dilihat oleh guru'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
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

      {/* Success Banner */}
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

      {/* Submission Form */}
      {isOpen && canSubmit ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-2xl border border-[#e8e4dc] bg-white p-5 dark:border-stone-800 dark:bg-stone-900 shadow-2xs">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
              Kirimkan Ide / Jawaban Anda:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ketik ide singkat Anda di sini (maks. 300 karakter)..."
              rows={3}
              maxLength={300}
              disabled={isSubmitting || cooldown > 0}
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-100 dark:focus:bg-stone-900 transition-all"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-stone-400">
                {cooldown > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 inline" />
                    Tunggu {cooldown}s sebelum kirim lagi
                  </span>
                ) : (
                  `${content.length}/300 karakter`
                )}
              </span>
              <Button
                type="submit"
                size="md"
                disabled={!content.trim() || cooldown > 0 || isSubmitting}
                className="min-h-[44px] bg-violet-600 hover:bg-violet-700 text-white gap-2 text-xs font-bold px-5 rounded-xl shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? 'Mengirim...' : 'Kirim Ide'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-[#e8e4dc] bg-stone-50/80 p-5 dark:border-stone-800 dark:bg-stone-850 text-xs text-stone-600 dark:text-stone-400">
          <Lock className="h-4 w-4 shrink-0 text-stone-400" />
          <span className="font-medium">
            {isPaused && 'Pengiriman ide sedang dijeda sementara oleh guru.'}
            {isClosed && 'Aktivitas papan ide telah ditutup.'}
            {isOpen &&
              !canSubmit &&
              'Anda telah mencapai batas maksimum pengiriman ide untuk sesi ini.'}
          </span>
        </div>
      )}

      {/* My Submitted Ideas */}
      {myIdeas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Ide Anda ({myIdeas.length})
            </h4>
          </div>
          <div className="space-y-2.5">
            {myIdeas.map((idea) => (
              <div
                key={idea.id}
                className="rounded-xl border border-violet-200/60 bg-violet-50/30 p-4 dark:border-violet-950/60 dark:bg-violet-950/10 shadow-2xs animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 break-words leading-relaxed">
                  {idea.content}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatElapsed(idea.createdAt)}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Terkirim
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Ideas from Classmates (If Visible) */}
      {activity.settings.ideasVisibleToParticipants && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                Ide Bersama ({sharedIdeas.length})
              </h4>
              {totalIdeasCount > 0 && (
                <span className="text-xs rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 px-2.5 py-0.5 font-bold">
                  {totalIdeasCount} di papan
                </span>
              )}
            </div>
            <span className="text-xs text-stone-400">Pembaruan realtime</span>
          </div>

          {sharedIdeas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e8e4dc] bg-stone-50/50 p-6 text-center dark:border-stone-800 dark:bg-stone-900/40">
              <p className="text-xs text-stone-400 font-medium">
                Belum ada ide yang ditampilkan di papan bersama.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sharedIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex flex-col justify-between rounded-xl border border-[#e8e4dc] bg-white p-4 dark:border-stone-800 dark:bg-stone-900 shadow-2xs"
                >
                  <p className="text-sm text-stone-900 dark:text-stone-100 break-words mb-3 leading-relaxed">
                    {idea.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-2.5">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {idea.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatElapsed(idea.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
