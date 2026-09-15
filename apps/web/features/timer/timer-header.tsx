'use client';

import React from 'react';
import { Clock, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { Button, Badge, Card } from '@walikelas/ui';

export interface TimerHeaderProps {
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function TimerHeader({
  isRunning,
  isPaused,
  isCompleted,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
}: TimerHeaderProps): React.JSX.Element {
  return (
    <Card className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs border-[#e8e4dc] bg-white">
      {/* Title & Status */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
          <Clock className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
              Timer Kelas
            </h1>
            {isCompleted ? (
              <Badge variant="danger" size="sm">
                Waktu Selesai!
              </Badge>
            ) : isRunning && !isPaused ? (
              <Badge variant="warning" size="sm" className="bg-amber-100 text-amber-800 border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse inline-block mr-1" />
                Berjalan
              </Badge>
            ) : isPaused ? (
              <Badge variant="neutral" size="sm">
                Dijeda
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Siap
              </Badge>
            )}
          </div>
          <p className="text-xs text-stone-600 hidden sm:block">
            Hitung mundur waktu pembelajaran kelas & aktivitas kelompok
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Matikan suara alarm bel' : 'Nyalakan suara alarm bel'}
          className="text-stone-700 hover:text-stone-900 hover:bg-stone-100"
          leftIcon={
            soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" aria-hidden="true" />
            )
          }
        >
          <span className="text-xs font-semibold">{soundEnabled ? 'Suara Aktif' : 'Senyap'}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Keluar mode layar penuh' : 'Mode layar penuh / proyektor'}
          className="text-stone-700 hover:text-stone-900 hover:bg-stone-100"
          leftIcon={
            isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-stone-700" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-4 h-4 text-stone-700" aria-hidden="true" />
            )
          }
        >
          <span className="text-xs font-semibold">
            {isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          </span>
        </Button>
      </div>
    </Card>
  );
}

