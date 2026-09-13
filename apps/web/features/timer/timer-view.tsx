'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Clock,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { Button, Badge } from '@walikelas/ui';
import { useTimer, formatTime } from './use-timer';

const PRESETS = [
  { label: '1 Menit', seconds: 60 },
  { label: '3 Menit', seconds: 180 },
  { label: '5 Menit', seconds: 300 },
  { label: '10 Menit', seconds: 600 },
  { label: '15 Menit', seconds: 900 },
];

export function TimerView(): React.JSX.Element {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('5');
  const [customSeconds, setCustomSeconds] = useState('0');

  const {
    duration,
    remaining,
    progress,
    isRunning,
    isPaused,
    isCompleted,
    start,
    pause,
    resume,
    reset,
  } = useTimer({
    initialDuration: 300,
    enableSound: soundEnabled,
  });

  const handleSelectPreset = (seconds: number) => {
    reset(seconds);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10) || 0;
    const secs = parseInt(customSeconds, 10) || 0;
    const total = mins * 60 + secs;
    if (total > 0) {
      reset(total);
      setShowCustomModal(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-slate-900">Timer Kelas</h1>
          {isCompleted && (
            <Badge variant="danger" size="sm">
              Waktu Selesai!
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Matikan suara alarm' : 'Nyalakan suara alarm'}
            leftIcon={
              soundEnabled ? (
                <Volume2 className="w-4 h-4 text-slate-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )
            }
          >
            {soundEnabled ? 'Suara Aktif' : 'Mute'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            aria-label="Mode Layar Penuh / Proyektor"
            leftIcon={<Maximize2 className="w-4 h-4 text-slate-700" />}
          >
            Layar Penuh
          </Button>
        </div>
      </div>

      {/* Main Timer Display Area */}
      <div
        className={`bg-white rounded-3xl border-2 p-8 sm:p-14 shadow-sm flex flex-col items-center justify-center text-center transition-all ${
          isCompleted
            ? 'border-red-500 bg-red-50/40 ring-4 ring-red-100'
            : isRunning
              ? 'border-blue-500 ring-4 ring-blue-50'
              : 'border-slate-200'
        }`}
      >
        {/* Visual Countdown Digits */}
        <div
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          className={`font-mono text-7xl sm:text-9xl font-extrabold tracking-tight select-none transition-colors ${
            isCompleted ? 'text-red-600 animate-pulse' : 'text-slate-900'
          }`}
        >
          {formatTime(remaining)}
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full max-w-md bg-slate-100 h-3 rounded-full mt-8 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted ? 'bg-red-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="mt-6 flex items-center gap-2 text-red-600 font-bold text-lg animate-bounce">
            <CheckCircle2 className="w-6 h-6" />
            <span>Waktu pembelajaran telah habis!</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          {!isRunning && !isPaused && (
            <Button
              variant="primary"
              size="lg"
              className="px-8 text-base shadow-md"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              onClick={() => start()}
            >
              Mulai Timer
            </Button>
          )}

          {isRunning && !isPaused && (
            <Button
              variant="secondary"
              size="lg"
              className="px-8 text-base bg-amber-500 text-white hover:bg-amber-600 border-amber-600"
              leftIcon={<Pause className="w-5 h-5 fill-current" />}
              onClick={pause}
            >
              Jeda
            </Button>
          )}

          {isPaused && (
            <Button
              variant="primary"
              size="lg"
              className="px-8 text-base shadow-md"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              onClick={resume}
            >
              Lanjutkan
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="px-6 text-base"
            leftIcon={<RotateCcw className="w-5 h-5" />}
            onClick={() => reset()}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Pilihan Durasi Cepat
        </h2>

        <div className="flex flex-wrap items-center gap-2.5">
          {PRESETS.map((p) => {
            const isSelected = duration === p.seconds && !isRunning;
            return (
              <button
                key={p.seconds}
                type="button"
                onClick={() => handleSelectPreset(p.seconds)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomModal(true)}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Durasi Kustom...
          </Button>
        </div>
      </div>

      {/* Custom Duration Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl space-y-5 animate-scale-in">
            <h3 className="font-bold text-slate-900 text-base">Atur Durasi Kustom</h3>

            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Menit</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-300 rounded-xl text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Detik</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-300 rounded-xl text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
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
        </div>
      )}
    </div>
  );
}
