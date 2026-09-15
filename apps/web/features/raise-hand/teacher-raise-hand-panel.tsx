'use client';

import React, { useEffect } from 'react';
import { Hand, X, Mic, CheckCircle2, Clock, Volume2, UserCheck } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@walikelas/ui';
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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasAnyActive = queue.length > 0 || currentSpeaker !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] h-[700px] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-[#e8e4dc] px-6 py-4 space-y-0 text-left bg-stone-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 shrink-0">
              <Hand className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-stone-900">
                  Antrean Angkat Tangan
                </DialogTitle>
                {raisedCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-stone-950">
                    {raisedCount} menunggu
                  </span>
                )}
              </div>
              <DialogDescription className="text-xs text-stone-500">
                Kelola giliran berbicara peserta kelas secara tertib dan realtime
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            {hasAnyActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLowerAll}
                className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                Turunkan Semua
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Speaker Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Giliran Berbicara Aktif
            </h3>
            {currentSpeaker ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 transition-all">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Mic className="h-6 w-6 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500"></span>
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-stone-900">
                        {currentSpeaker.displayName}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <Volume2 className="h-3 w-3" /> Sedang Berbicara
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>Dimulai {formatElapsed(currentSpeaker.speakingAt)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLowerParticipant(currentSpeaker.id)}
                  className="shrink-0 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                  Selesai Berbicara
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#e8e4dc] bg-stone-50/50 p-4 text-stone-500">
                <Mic className="h-5 w-5 text-stone-400 opacity-50" />
                <span className="text-sm">Belum ada peserta yang sedang berbicara</span>
              </div>
            )}
          </div>

          {/* Queue Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Daftar Antrean Angkat Tangan ({queue.length})
              </h3>
              {queue.length > 1 && (
                <span className="text-xs text-stone-500">
                  Urutan sesuai waktu tercepat mengangkat tangan
                </span>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e8e4dc] py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-3">
                  <Hand className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-800">
                  Tidak ada antrean angkat tangan
                </h4>
                <p className="mt-1 text-xs text-stone-500 max-w-sm">
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#e8e4dc] bg-white p-3.5 shadow-xs transition-all hover:border-amber-300"
                    >
                      {/* Participant info with queue order number */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-xs font-black text-amber-900 border border-amber-200/60">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-stone-900">
                              {item.displayName}
                            </span>
                            {isAcknowledged ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800 border border-sky-200">
                                <UserCheck className="h-3 w-3" /> Dilihat Guru
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200/60">
                                <Hand className="h-3 w-3" /> Menunggu
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
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
                            className="text-xs text-stone-600 hover:text-stone-900"
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1 text-sky-600" />
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
                          className="text-xs font-bold"
                        >
                          <Mic className="h-3.5 w-3.5 mr-1" />
                          Beri Giliran
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLowerParticipant(item.id)}
                          className="text-xs text-stone-400 hover:text-rose-600"
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
      </DialogContent>
    </Dialog>
  );
}
