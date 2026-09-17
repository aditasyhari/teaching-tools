'use client';

import React from 'react';
import { ClipboardCheck, Users, Radio, CheckCircle2, Smartphone } from 'lucide-react';
import type { ExitTicketActivity, ExitTicketAggregates } from '@walikelas/types';

interface ProjectorExitTicketViewProps {
  activity: ExitTicketActivity | null;
  responseCount: number;
  totalExpected: number;
  completionRate: number;
  aggregates?: ExitTicketAggregates | null;
}

export function ProjectorExitTicketView({
  activity,
  responseCount,
  totalExpected,
  completionRate,
}: ProjectorExitTicketViewProps): React.JSX.Element {
  const isOpen = activity?.status === 'OPEN';
  const effectiveTotal = Math.max(totalExpected, responseCount, 1);
  const percentage =
    completionRate > 0
      ? Math.min(100, Math.round(completionRate))
      : Math.min(100, Math.round((responseCount / effectiveTotal) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-600/20">
              <ClipboardCheck className="w-4 h-4" />
              Tiket Keluar Kelas
            </span>
            <span className="text-sm font-semibold text-slate-300">
              Refleksi Pembelajaran
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOpen ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs tracking-wide">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Pengisian Sedang Berlangsung</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs">
                <span>Tiket Keluar Ditutup</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity Title */}
        <div className="space-y-2">
          <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            Aktivitas Refleksi
          </p>
          <h2 className="text-2xl md:text-4xl font-black text-white leading-snug tracking-tight">
            {activity?.title || 'Refleksi Akhir Pembelajaran'}
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            Mohon luangkan 1-2 menit untuk mengisi form refleksi di HP Anda sebelum meninggalkan kelas.
          </p>
        </div>

        {/* Realtime Submission Progress Meter */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm md:text-base">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Progres Pengumpulan Refleksi</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xl md:text-2xl font-black text-emerald-400">
              <span>{responseCount}</span>
              <span className="text-slate-500 text-base font-medium">/</span>
              <span className="text-slate-400 text-base font-medium">{effectiveTotal}</span>
              <span className="text-sm font-bold text-slate-300 ml-1">({percentage}%)</span>
            </div>
          </div>

          <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              Isi melalui layar sesi di HP Anda
            </span>
            {percentage >= 100 ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Seluruh siswa telah mengumpulkan
              </span>
            ) : (
              <span>Menunggu respons siswa lainnya...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
