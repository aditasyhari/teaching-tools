'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTimer, formatTime } from './use-timer';
import { TimerHeader } from './timer-header';
import { TimerStage } from './timer-stage';
import { TimerControls } from './timer-controls';
import { TimerPresets } from './timer-presets';
import { CustomDurationDialog } from './custom-duration-dialog';
import { Button } from '@walikelas/ui';
import { Minimize2, Volume2, VolumeX } from 'lucide-react';

export function TimerView(): React.JSX.Element {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

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
    addSeconds,
  } = useTimer({
    initialDuration: 300,
    enableSound: soundEnabled,
    onComplete: () => {
      setAnnouncement('Waktu pembelajaran telah selesai!');
    },
  });

  // Track fullscreen changes (e.g. user pressing ESC or browser F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (fullscreenContainerRef.current) {
          await fullscreenContainerRef.current.requestFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen API may be disallowed by browser policy in some contexts
    }
  }, []);

  // Handlers with screen reader announcements
  const handleStart = useCallback(() => {
    start();
    setAnnouncement(`Timer dimulai: ${formatTime(duration)}`);
  }, [start, duration]);

  const handlePause = useCallback(() => {
    pause();
    setAnnouncement(`Timer dijeda pada ${formatTime(remaining)}`);
  }, [pause, remaining]);

  const handleResume = useCallback(() => {
    resume();
    setAnnouncement('Timer dilanjutkan');
  }, [resume]);

  const handleReset = useCallback(() => {
    reset();
    setAnnouncement(`Timer diatur ulang ke ${formatTime(duration)}`);
  }, [reset, duration]);

  const handleSelectPreset = useCallback(
    (seconds: number) => {
      reset(seconds);
      setAnnouncement(`Durasi timer diatur ke ${formatTime(seconds)}`);
    },
    [reset],
  );

  const handleApplyCustom = useCallback(
    (seconds: number) => {
      reset(seconds);
      setAnnouncement(`Durasi kustom diatur ke ${formatTime(seconds)}`);
    },
    [reset],
  );

  const handleAddMinute = useCallback(
    (secondsToAdd: number) => {
      addSeconds(secondsToAdd);
      setAnnouncement(`Menambahkan waktu ${secondsToAdd / 60} menit`);
    },
    [addSeconds],
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never trigger shortcuts if typing inside form fields or if dialog is active
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isTyping || showCustomModal) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isCompleted) {
          handleReset();
        } else if (isRunning && !isPaused) {
          handlePause();
        } else if (isPaused) {
          handleResume();
        } else {
          handleStart();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    showCustomModal,
    isCompleted,
    isRunning,
    isPaused,
    handleReset,
    handlePause,
    handleResume,
    handleStart,
  ]);

  // If in native Fullscreen mode, render dedicated Projector Layout
  if (isFullscreen) {
    return (
      <div
        ref={fullscreenContainerRef}
        className="fixed inset-0 z-50 bg-[#faf8f5] text-stone-900 flex flex-col justify-between p-6 sm:p-10 select-none"
      >
        {/* Screen Reader Live Region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        {/* Minimal Floating Top Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-sm font-extrabold text-stone-900 tracking-tight">
              Timer Kelas — Mode Proyektor
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label={soundEnabled ? 'Matikan suara bel' : 'Nyalakan suara bel'}
              className="text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
              leftIcon={
                soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-600" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-400" aria-hidden="true" />
                )
              }
            >
              <span className="text-xs font-semibold">
                {soundEnabled ? 'Suara Aktif' : 'Senyap'}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              aria-label="Keluar dari layar penuh (Esc)"
              className="border-[#e8e4dc] bg-white text-stone-800 hover:bg-stone-100 font-semibold"
              leftIcon={<Minimize2 className="w-4 h-4" aria-hidden="true" />}
            >
              <span className="text-xs">Keluar (Esc)</span>
            </Button>
          </div>
        </header>

        {/* Central Massive Projector Stage */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <TimerStage
            remaining={remaining}
            duration={duration}
            progress={progress}
            isRunning={isRunning}
            isPaused={isPaused}
            isCompleted={isCompleted}
            isFullscreen={true}
            onAddSeconds={handleAddMinute}
          />

          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            isCompleted={isCompleted}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onReset={handleReset}
            isFullscreen={true}
          />
        </main>

        {/* Bottom Keyboard Hint Bar */}
        <footer className="text-center">
          <p className="text-xs text-stone-600 font-medium">
            Pintasan Papan Ketik:{' '}
            <span className="font-semibold text-stone-700">[Spasi]</span> Mulai/Jeda/Lanjut &bull;{' '}
            <span className="font-semibold text-stone-700">[R]</span> Reset &bull;{' '}
            <span className="font-semibold text-stone-700">[Esc]</span> Keluar Layar Penuh
          </p>
        </footer>
      </div>
    );
  }

  // Standard Workspace Layout
  return (
    <div ref={fullscreenContainerRef} className="max-w-4xl mx-auto space-y-6">
      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Top Header / Action Bar */}
      <TimerHeader
        isRunning={isRunning}
        isPaused={isPaused}
        isCompleted={isCompleted}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Display Stage */}
      <section aria-label="Area Hitung Mundur Timer">
        <TimerStage
          remaining={remaining}
          duration={duration}
          progress={progress}
          isRunning={isRunning}
          isPaused={isPaused}
          isCompleted={isCompleted}
          onAddSeconds={handleAddMinute}
        />

        {/* Action Controls */}
        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          isCompleted={isCompleted}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
        />
      </section>

      {/* Preset Duration Selector */}
      <section aria-label="Pilihan Durasi Cepat">
        <TimerPresets
          currentDuration={duration}
          isRunning={isRunning}
          onSelectPreset={handleSelectPreset}
          onOpenCustom={() => setShowCustomModal(true)}
        />
      </section>

      {/* Keyboard Shortcuts Helper Footer */}
      <footer className="p-3 bg-stone-100/70 border border-[#e8e4dc] rounded-2xl text-center text-xs text-stone-600">
        <span className="font-semibold text-stone-700">Pintasan Praktis:</span> Tekan{' '}
        <kbd className="px-1.5 py-0.5 font-mono text-[11px] font-bold bg-white border border-stone-200 rounded text-stone-800">
          Spasi
        </kbd>{' '}
        untuk Mulai / Jeda / Lanjutkan &bull; Tekan{' '}
        <kbd className="px-1.5 py-0.5 font-mono text-[11px] font-bold bg-white border border-stone-200 rounded text-stone-800">
          R
        </kbd>{' '}
        untuk Reset
      </footer>

      {/* Custom Duration Modal */}
      <CustomDurationDialog
        open={showCustomModal}
        onOpenChange={setShowCustomModal}
        onApply={handleApplyCustom}
        currentDurationSeconds={duration}
      />
    </div>
  );
}
