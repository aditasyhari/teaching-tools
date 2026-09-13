'use client';

import React from 'react';
import { Hand, X, Mic, CheckCircle2, Clock, Volume2, UserCheck } from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { RaisedHandItem } from '@walikelas/types';

interface TeacherRaiseHandPanelProps {
  isOpen: boolean;
  onClose: () => void;
  queue: RaisedHandItem[];
  currentSpeaker: RaisedHandItem | null;
  raisedCount: number;
  onAcknowledge: (handId: string) => void;
  onStartSpeaking: (handId: string) => void;
  onLowerParticipant: (handId: string) => void;
  onLowerAll: () => void;
}

function formatElapsed(ts?: number): string {
  if (!ts) return 'Baru saja';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return `${diffSec}d yang lalu`;
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin}m yang lalu`;
}

export function TeacherRaiseHandPanel({
  isOpen,
  onClose,
  queue,
  currentSpeaker,
  raisedCount,
  onAcknowledge,
  onStartSpeaking,
  onLowerParticipant,
  onLowerAll,
}: TeacherRaiseHandPanelProps) {
  if (!isOpen) return null;

  const hasAnyActive = queue.length > 0 || currentSpeaker !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-[90vh] max-h-[700px] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Hand className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Antrean Angkat Tangan
                </h2>
                {raisedCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {raisedCount} menunggu
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola giliran berbicara peserta kelas secara tertib dan realtime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasAnyActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLowerAll}
                className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                Turunkan Semua
              </Button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Tutup panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Speaker Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Giliran Berbicara Aktif
            </h3>
            {currentSpeaker ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-800/80 dark:bg-emerald-950/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Mic className="h-6 w-6 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500"></span>
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {currentSpeaker.displayName}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/80 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        <Volume2 className="h-3 w-3" /> Sedang Berbicara
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>Dimulai {formatElapsed(currentSpeaker.speakingAt)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLowerParticipant(currentSpeaker.id)}
                  className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                  Selesai Berbicara
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                <Mic className="h-5 w-5 text-slate-400 opacity-50" />
                <span className="text-sm">Belum ada peserta yang sedang berbicara</span>
              </div>
            )}
          </div>

          {/* Queue Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Daftar Antrean Angkat Tangan ({queue.length})
              </h3>
              {queue.length > 1 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Urutan sesuai waktu tercepat mengangkat tangan
                </span>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
                  <Hand className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tidak ada antrean angkat tangan
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Peserta dapat menekan tombol &quot;Angkat Tangan&quot; dari perangkat mereka untuk
                  meminta giliran berbicara.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {queue.map((item, index) => {
                  const isAcknowledged = item.status === 'ACKNOWLEDGED';

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700"
                    >
                      {/* Participant info with queue order number */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {item.displayName}
                            </span>
                            {isAcknowledged ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                                <UserCheck className="h-3 w-3" /> Dilihat Guru
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                <Hand className="h-3 w-3" /> Menunggu
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>Mengangkat tangan {formatElapsed(item.raisedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Teacher Actions for this item */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!isAcknowledged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAcknowledge(item.id)}
                            className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300"
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1 text-sky-600 dark:text-sky-400" />
                            Lihat
                          </Button>
                        )}

                        <Button
                          variant="primary"
                          size="sm"
                          disabled={currentSpeaker !== null}
                          onClick={() => onStartSpeaking(item.id)}
                          title={
                            currentSpeaker !== null
                              ? 'Selesaikan giliran berbicara yang aktif terlebih dahulu'
                              : 'Beri giliran berbicara'
                          }
                          className="text-xs"
                        >
                          <Mic className="h-3.5 w-3.5 mr-1" />
                          Beri Giliran
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLowerParticipant(item.id)}
                          className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          aria-label="Turunkan tangan"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {currentSpeaker ? '1 peserta sedang berbicara' : 'Tidak ada pembicara aktif'} •{' '}
            {queue.length} dalam antrean
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
