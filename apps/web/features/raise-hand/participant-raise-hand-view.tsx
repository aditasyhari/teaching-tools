'use client';

import React from 'react';
import { Hand, Mic, CheckCircle2, AlertCircle, Clock, Volume2, UserCheck } from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { RaisedHandItem } from '@walikelas/types';

interface ParticipantRaiseHandViewProps {
  myHand: RaisedHandItem | null;
  queuePosition: number | null;
  totalRaisedCount: number;
  currentSpeaker: { displayName: string } | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  cooldown: number;
  onRaiseHand: () => void;
  onLowerHand: () => void;
  onClearError: () => void;
  onClearSuccess: () => void;
}

export function ParticipantRaiseHandView({
  myHand,
  queuePosition,
  totalRaisedCount,
  currentSpeaker,
  isLoading,
  error,
  successMessage,
  cooldown,
  onRaiseHand,
  onLowerHand,
  onClearError,
  onClearSuccess,
}: ParticipantRaiseHandViewProps) {
  const isSpeaking = myHand?.status === 'SPEAKING';
  const isAcknowledged = myHand?.status === 'ACKNOWLEDGED';
  const isRaised = myHand?.status === 'RAISED';
  const hasRaised = isRaised || isAcknowledged || isSpeaking;

  return (
    <div className="w-full space-y-4">
      {/* Toast / Notification Banners */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={onClearError}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={onClearSuccess}
            className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Current Speaker Notice (When another participant is speaking) */}
      {currentSpeaker && !isSpeaking && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Volume2 className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <span className="font-semibold">{currentSpeaker.displayName}</span> sedang berbicara
          </div>
        </div>
      )}

      {/* Active State View: SPEAKING */}
      {isSpeaking && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm mb-4 motion-safe:animate-pulse ring-4 ring-emerald-200/80">
            <Mic className="h-8 w-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-200 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-ping" />
            Sedang Berbicara
          </div>
          <h3 className="text-xl font-extrabold text-stone-900">
            Giliran Anda Berbicara!
          </h3>
          <p className="mt-2 text-sm text-stone-600 max-w-xs mx-auto">
            Silakan berbicara dengan jelas kepada guru dan kelas sekarang.
          </p>
          <div className="mt-4 text-xs text-stone-500">
            Guru akan menyelesaikan giliran Anda setelah selesai.
          </div>
        </div>
      )}

      {/* Active State View: ACKNOWLEDGED (Seen by teacher) */}
      {isAcknowledged && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-xs mb-3">
            <UserCheck className="h-7 w-7" />
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 border border-sky-200 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5" /> Dilihat Guru
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            Guru Telah Melihat Tangan Anda
          </h3>
          <p className="mt-1 text-xs text-stone-600">
            Harap bersiap, giliran Anda akan segera diberikan oleh guru.
          </p>

          {queuePosition !== null && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-sky-800 shadow-xs border border-sky-200">
              <Clock className="h-3.5 w-3.5" />
              Posisi Antrean: #{queuePosition} dari {totalRaisedCount}
            </div>
          )}

          <div className="mt-5">
            <Button
              variant="outline"
              size="sm"
              disabled={cooldown > 0 || isLoading}
              onClick={onLowerHand}
              className="text-xs text-stone-600 hover:text-rose-600 border-[#e8e4dc]"
            >
              {cooldown > 0 ? `Tunggu (${cooldown}s)` : 'Batalkan / Turunkan Tangan'}
            </Button>
          </div>
        </div>
      )}

      {/* Active State View: RAISED (Waiting in queue) */}
      {isRaised && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-stone-950 font-bold shadow-xs mb-3">
            <Hand className="h-7 w-7 motion-safe:animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200/60 mb-2">
            <Clock className="h-3.5 w-3.5" /> Sedang Mengantre
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            Tangan Anda Sedang Terangkat
          </h3>
          <p className="mt-1 text-xs text-stone-600">
            Menunggu guru melihat dan memberikan giliran berbicara.
          </p>

          {queuePosition !== null && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs border border-amber-200">
              <Clock className="h-3.5 w-3.5" />
              Posisi Antrean: #{queuePosition} dari {totalRaisedCount}
            </div>
          )}

          <div className="mt-5">
            <Button
              variant="outline"
              size="sm"
              disabled={cooldown > 0 || isLoading}
              onClick={onLowerHand}
              className="text-xs text-stone-600 hover:text-rose-600 border-[#e8e4dc]"
            >
              {cooldown > 0 ? `Tunggu (${cooldown}s)` : 'Batalkan / Turunkan Tangan'}
            </Button>
          </div>
        </div>
      )}

      {/* Inactive State: Raise Hand Action Button */}
      {!hasRaised && (
        <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 mb-3">
            <Hand className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            Ingin Berbicara atau Bertanya?
          </h3>
          <p className="mt-1 text-xs text-stone-600 max-w-xs mx-auto">
            Tekan tombol di bawah untuk meminta giliran berbicara secara tertib.
          </p>

          <div className="mt-5">
            <Button
              variant="primary"
              size="lg"
              disabled={cooldown > 0 || isLoading}
              onClick={onRaiseHand}
              className="w-full min-h-[52px] text-base font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 border-none shadow-xs"
            >
              <Hand className="h-5 w-5 mr-2" />
              {cooldown > 0 ? `Tunggu (${cooldown}s)` : 'Angkat Tangan'}
            </Button>
          </div>

          {totalRaisedCount > 0 && (
            <div className="mt-3 text-xs text-stone-500">
              Saat ini ada {totalRaisedCount} siswa lain dalam antrean
            </div>
          )}
        </div>
      )}
    </div>
  );
}
