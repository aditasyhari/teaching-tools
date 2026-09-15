'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Users,
  EyeOff,
  AlertCircle,
  Tag,
} from 'lucide-react';
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@walikelas/ui';
import type { ClassroomTimerState, ClassroomTimerVisibility } from '@walikelas/types';
import { formatTime } from './use-classroom-timer';

const DURATION_PRESETS = [
  { label: '30 dtk', seconds: 30 },
  { label: '1 mnt', seconds: 60 },
  { label: '2 mnt', seconds: 120 },
  { label: '5 mnt', seconds: 300 },
  { label: '10 mnt', seconds: 600 },
  { label: '15 mnt', seconds: 900 },
  { label: '20 mnt', seconds: 1200 },
  { label: '30 mnt', seconds: 1800 },
];

interface TeacherClassroomTimerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  timer: ClassroomTimerState | null;
  remaining: number;
  duration: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isIdle: boolean;
  error: string | null;
  onSetTimer: (duration: number, label?: string, visibility?: ClassroomTimerVisibility) => void;
  onStartTimer: (options?: {
    duration?: number;
    label?: string;
    visibility?: ClassroomTimerVisibility;
  }) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: (newDuration?: number) => void;
  onClearError: () => void;
}

export function TeacherClassroomTimerPanel({
  isOpen,
  onClose,
  timer,
  remaining,
  duration,
  progress,
  isRunning,
  isPaused,
  isCompleted,
  isIdle,
  error,
  onSetTimer,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onClearError,
}: TeacherClassroomTimerPanelProps): React.JSX.Element | null {
  const [customMinutes, setCustomMinutes] = useState('5');
  const [customSeconds, setCustomSeconds] = useState('0');
  const [label, setLabel] = useState(timer?.label || '');
  const [visibility, setVisibility] = useState<ClassroomTimerVisibility>(
    timer?.visibility || 'SHARED_TIMER',
  );
  const [showCustomModal, setShowCustomModal] = useState(false);

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

  const handleSelectPreset = (secs: number) => {
    onSetTimer(secs, label.trim() || undefined, visibility);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10) || 0;
    const secs = parseInt(customSeconds, 10) || 0;
    const total = mins * 60 + secs;
    if (total >= 5 && total <= 3600) {
      onSetTimer(total, label.trim() || undefined, visibility);
      setShowCustomModal(false);
    }
  };

  const handleVisibilityToggle = (newVis: ClassroomTimerVisibility) => {
    setVisibility(newVis);
    if (timer) {
      onSetTimer(timer.duration, label.trim() || undefined, newVis);
    }
  };

  const handleLabelBlur = () => {
    if (timer && timer.label !== label.trim()) {
      onSetTimer(timer.duration, label.trim() || undefined, visibility);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between text-left space-y-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black text-foreground">
                  Timer Kelas
                </DialogTitle>
                {isRunning && (
                  <Badge variant="success" size="sm">
                    Berjalan
                  </Badge>
                )}
                {isPaused && (
                  <Badge variant="warning" size="sm">
                    Dijeda
                  </Badge>
                )}
                {isCompleted && (
                  <Badge variant="danger" size="sm">
                    Waktu Habis!
                  </Badge>
                )}
                {isIdle && (
                  <Badge variant="neutral" size="sm">
                    Siap
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Hitung mundur realtime sinkron untuk semua perangkat di kelas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-400 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={onClearError}
              className="text-rose-700 dark:text-rose-400 hover:underline font-bold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Digital Timer Display Card */}
          <div
            className={`text-center py-8 px-6 rounded-3xl border transition-all ${
              isCompleted
                ? 'bg-rose-50/80 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800 animate-pulse'
                : isRunning
                  ? 'bg-indigo-50/60 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800 shadow-inner'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800'
            }`}
          >
            {/* Optional Label */}
            {label && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
                <Tag className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>
            )}

            {/* Giant Digits */}
            <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-slate-900 dark:text-slate-100 select-none">
              {formatTime(remaining)}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isCompleted ? 'bg-rose-500' : isPaused ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {isIdle && (
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Play className="w-5 h-5 fill-current" />}
                  onClick={() =>
                    onStartTimer({ duration, label: label.trim() || undefined, visibility })
                  }
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 shadow-lg text-base"
                >
                  Mulai Timer
                </Button>
              )}

              {isRunning && (
                <>
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<Pause className="w-5 h-5 fill-current text-amber-500" />}
                    onClick={onPauseTimer}
                    className="font-bold border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
                  >
                    Jeda
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<RotateCcw className="w-5 h-5" />}
                    onClick={() => onResetTimer()}
                    className="font-bold"
                  >
                    Reset
                  </Button>
                </>
              )}

              {isPaused && (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Play className="w-5 h-5 fill-current" />}
                    onClick={onResumeTimer}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 shadow-md"
                  >
                    Lanjutkan
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<RotateCcw className="w-5 h-5" />}
                    onClick={() => onResetTimer()}
                    className="font-bold"
                  >
                    Reset
                  </Button>
                </>
              )}

              {isCompleted && (
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<RotateCcw className="w-5 h-5" />}
                  onClick={() => onResetTimer()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg"
                >
                  Ulangi Timer
                </Button>
              )}
            </div>
          </div>

          {/* Duration Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Durasi Cepat
              </span>
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Kustom Durasi
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {DURATION_PRESETS.map((p) => {
                const isSelected = duration === p.seconds && isIdle;
                return (
                  <button
                    key={p.seconds}
                    type="button"
                    onClick={() => handleSelectPreset(p.seconds)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility and Label Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Visibility Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tampilkan ke Peserta
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleVisibilityToggle('SHARED_TIMER')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    visibility === 'SHARED_TIMER'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Publik (Murid)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVisibilityToggle('PRIVATE_TIMER')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    visibility === 'PRIVATE_TIMER'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hanya Guru</span>
                </button>
              </div>
            </div>

            {/* Label Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="timer-label"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Label Aktivitas (Opsional)
              </label>
              <input
                id="timer-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value.slice(0, 100))}
                onBlur={handleLabelBlur}
                placeholder="Contoh: Diskusi Kelompok"
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Custom Duration Sub-Modal */}
        {showCustomModal && (
          <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleApplyCustom}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Kustom Durasi Timer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tentukan durasi antara 5 detik hingga 60 menit (3600 detik).
              </p>

              <div className="flex items-center gap-3 justify-center py-2">
                <div className="text-center space-y-1">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="w-20 text-center py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-[11px] text-slate-500 font-semibold block">Menit</span>
                </div>
                <span className="text-2xl font-bold text-slate-400 pb-4">:</span>
                <div className="text-center space-y-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(e.target.value)}
                    className="w-20 text-center py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-[11px] text-slate-500 font-semibold block">Detik</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Terapkan
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
