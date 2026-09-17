'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Hand, HelpCircle, X, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { Button } from '@walikelas/ui';

export interface ClassroomAlertItem {
  id: string;
  type: 'RAISE_HAND' | 'NEW_QUESTION';
  title: string;
  message: string;
  author?: string;
  timestamp: number;
  onAction: () => void;
  actionLabel: string;
}

interface TeacherSessionAlertsProps {
  alerts: ClassroomAlertItem[];
  onDismiss: (id: string) => void;
}

/**
 * Generates a warm, pleasant, non-intrusive classroom chime using standard Web Audio API.
 * 100% offline, zero network assets required.
 */
export function playClassroomChime(isMuted: boolean = false): void {
  if (isMuted || typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First harmonic tone (C5 ~ 523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second bell tone (E5 ~ 659.25 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.08);
    gain2.gain.setValueAtTime(0.1, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch {
    // Graceful fallback if Web Audio API is blocked by browser policy
  }
}

export function TeacherSessionAlerts({
  alerts,
  onDismiss,
}: TeacherSessionAlertsProps): React.JSX.Element | null {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('walikelas:alerts-muted');
      if (saved !== null) {
        setIsMuted(saved === 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    try {
      localStorage.setItem('walikelas:alerts-muted', String(next));
    } catch {
      // Ignore
    }
  };

  // Play sound whenever a new alert arrives
  const previousAlertCount = useRef(alerts.length);
  useEffect(() => {
    if (alerts.length > previousAlertCount.current) {
      playClassroomChime(isMuted);
    }
    previousAlertCount.current = alerts.length;
  }, [alerts.length, isMuted]);

  if (alerts.length === 0) return null;

  return (
    <aside
      aria-label="Notifikasi Kelas Real-time"
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {/* Sound Preference Badge / Mute Toggle */}
      <div className="flex justify-end pointer-events-auto">
        <button
          type="button"
          onClick={toggleMute}
          title={isMuted ? 'Aktifkan Suara Notifikasi' : 'Senyapkan Suara Notifikasi'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-900/85 text-stone-200 hover:bg-stone-900 shadow-sm transition-colors backdrop-blur-sm cursor-pointer"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3 h-3 text-rose-400" />
              <span>Suara Senyap</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 text-emerald-400" />
              <span>Suara Aktif</span>
            </>
          )}
        </button>
      </div>

      {alerts.map((alert) => {
        const isRaiseHand = alert.type === 'RAISE_HAND';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
              isRaiseHand
                ? 'bg-amber-50/95 border-amber-300/80 text-stone-900 ring-2 ring-amber-400/20'
                : 'bg-white/95 border-blue-200 text-stone-900 ring-2 ring-blue-400/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                    isRaiseHand
                      ? 'bg-amber-500 text-stone-950 shadow-xs ring-2 ring-amber-200'
                      : 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-100'
                  }`}
                >
                  {isRaiseHand ? (
                    <Hand className="h-5 w-5 animate-pulse" />
                  ) : (
                    <HelpCircle className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                      {alert.title}
                    </h4>
                    <span className="text-[10px] text-stone-600">Baru saja</span>
                  </div>

                  <p className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                    {alert.author || 'Peserta Kelas'}
                  </p>

                  <p className="text-xs text-stone-700 mt-1 line-clamp-2 leading-relaxed">
                    &ldquo;{alert.message}&rdquo;
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        alert.onAction();
                        onDismiss(alert.id);
                      }}
                      className={`text-xs h-7.5 px-3 font-bold ${
                        isRaiseHand
                          ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      rightIcon={<ArrowRight className="w-3 h-3" />}
                    >
                      {alert.actionLabel}
                    </Button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                className="text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 p-1 rounded-lg transition-colors cursor-pointer"
                title="Tutup Notifikasi"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </aside>
  );
}

