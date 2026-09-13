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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
          <Lightbulb className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Belum Ada Papan Ide Aktif
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
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
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/90 to-purple-50/50 p-5 dark:border-violet-900/60 dark:from-violet-950/30 dark:to-purple-950/10 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
              <Lightbulb className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">
              Papan Ide Kelas
            </span>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isOpen
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : isPaused
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
            }`}
          >
            {isOpen && 'Menerima Ide'}
            {isPaused && 'Dijeda Sementara'}
            {isClosed && 'Aktivitas Ditutup'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 leading-snug break-words">
          {activity.prompt}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          {activity.settings.isAnonymous ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <ShieldCheck className="h-3 w-3 text-slate-500" />
              Nama Anda anonim
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <User className="h-3 w-3 text-slate-500" />
              Nama ditampilkan
            </span>
          )}

          <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <Users className="h-3 w-3 text-slate-500" />
            {activity.settings.ideasVisibleToParticipants
              ? 'Ide terlihat oleh peserta lain'
              : 'Ide hanya dilihat oleh guru'}
          </span>
        </div>
      </div>

      {/* Messages */}
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

      {/* Submission Form */}
      {isOpen && canSubmit ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Kirimkan Ide / Jawaban Anda:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ketik ide singkat Anda di sini (maks. 300 karakter)..."
              rows={3}
              maxLength={300}
              disabled={isSubmitting || cooldown > 0}
              className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-900"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {cooldown > 0 ? (
                  <span className="text-amber-600 font-medium">
                    Tunggu {cooldown}s sebelum kirim lagi
                  </span>
                ) : (
                  `${content.length}/300 karakter`
                )}
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || cooldown > 0 || isSubmitting}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 text-xs font-semibold px-4"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? 'Mengirim...' : 'Kirim Ide'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
          <Lock className="h-4 w-4 shrink-0 text-slate-400" />
          <span>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Ide Anda ({myIdeas.length})
            </h4>
          </div>
          <div className="space-y-2.5">
            {myIdeas.map((idea) => (
              <div
                key={idea.id}
                className="rounded-xl border border-violet-100 bg-violet-50/40 p-3.5 dark:border-violet-950/60 dark:bg-violet-950/10"
              >
                <p className="text-sm text-slate-900 dark:text-slate-100 break-words">
                  {idea.content}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatElapsed(idea.createdAt)}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
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
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Ide Bersama ({sharedIdeas.length})
              </h4>
              {totalIdeasCount > 0 && (
                <span className="text-[10px] rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 px-2 py-0.5 font-semibold">
                  {totalIdeasCount} di papan
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">Pembaruan realtime</span>
          </div>

          {sharedIdeas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-xs text-slate-400">
                Belum ada ide yang ditampilkan di papan bersama.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sharedIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
                >
                  <p className="text-sm text-slate-900 dark:text-slate-100 break-words mb-3">
                    {idea.content}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
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
