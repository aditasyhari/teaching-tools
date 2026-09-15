'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  Maximize2,
  Minimize2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { Button, Badge, Card, Input } from '@walikelas/ui';
import { motion } from 'motion/react';
import { scoreBumpMotion } from '../../lib/motion';
import { useScoreboard, ScoreTeam } from './use-scoreboard';

export function ScoreboardView(): React.JSX.Element {
  const {
    teams,
    teamCount,
    addTeam,
    removeTeam,
    renameTeam,
    changeScore,
    resetTeamScore,
    resetAllScores,
    clearBoard,
  } = useScoreboard();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // Sync with browser fullscreen events
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
      // Fullscreen may be restricted in iframe or browser policy
    }
  }, []);

  const handleStartRename = (team: ScoreTeam) => {
    setEditingId(team.id);
    setEditingName(team.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      renameTeam(id, editingName.trim());
      setAnnouncement(`Nama tim diubah menjadi ${editingName.trim()}`);
    }
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
  };

  const handleScoreChange = (team: ScoreTeam, delta: number) => {
    changeScore(team.id, delta);
    const newScore = team.score + delta;
    setAnnouncement(`Skor ${team.name} sekarang ${newScore}`);
  };

  const handleResetTeam = (team: ScoreTeam) => {
    resetTeamScore(team.id);
    setAnnouncement(`Skor ${team.name} diatur ulang ke 0`);
  };

  const handleResetAll = () => {
    resetAllScores();
    setAnnouncement('Semua skor tim diatur ulang ke 0');
  };

  const handleClear = () => {
    clearBoard();
    setAnnouncement('Papan skor dikosongkan');
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      ref={fullscreenContainerRef}
      className={`space-y-6 focus:outline-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#faf8f5] text-stone-900 p-6 sm:p-10 overflow-y-auto'
          : 'max-w-6xl mx-auto'
      }`}
    >
      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Header Bar */}
      <Card className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs border-[#e8e4dc] bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
            <Trophy className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                Scoreboard Kelas
              </h1>
              <Badge variant="neutral" size="sm">
                {teamCount} Tim
              </Badge>
            </div>
            <p className="text-xs text-stone-600 hidden sm:block">
              Papan skor real-time untuk permainan kelas, kuis kelompok, dan kompetisi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold border-amber-600 shadow-xs"
            leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
            onClick={() => addTeam()}
            aria-label="Tambah tim baru"
          >
            Tambah Tim
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-[#e8e4dc] text-stone-700 hover:bg-stone-50 font-semibold"
            leftIcon={<RotateCcw className="w-4 h-4 text-stone-500" aria-hidden="true" />}
            onClick={handleResetAll}
            aria-label="Reset semua skor ke 0"
          >
            Reset Semua Skor
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-stone-700 hover:text-red-700 hover:bg-red-50"
            leftIcon={<Trash2 className="w-4 h-4 text-stone-400" aria-hidden="true" />}
            onClick={handleClear}
            aria-label="Kosongkan seluruh tim"
          >
            Kosongkan
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Keluar mode layar penuh (Esc)' : 'Mode layar penuh / proyektor'}
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

      {/* Empty State */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-[#e8e4dc] p-12 sm:p-16 text-center flex flex-col items-center justify-center min-h-[360px] text-stone-400 space-y-4 select-none shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
            <Trophy className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h2 className="text-base font-bold text-stone-800">Papan Skor Kosong</h2>
            <p className="text-xs text-stone-500 font-medium">
              Mulai permainan atau kuis kelompok dengan menambahkan tim pertama.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold border-amber-600 shadow-xs"
            leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
            onClick={() => addTeam()}
          >
            Tambah Tim Pertama
          </Button>
        </div>
      ) : (
        /* Team Scorecards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="p-5 sm:p-6 flex flex-col justify-between gap-5 border-[#e8e4dc] bg-white shadow-xs transition-all duration-200 hover:border-amber-300"
              style={{ borderTopColor: team.color, borderTopWidth: 6 }}
            >
              {/* Team Card Header with Inline Rename */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                {editingId === team.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <Input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(team.id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      autoFocus
                      className="h-9 text-sm font-bold px-2 py-1 border-[#e8e4dc] focus-visible:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(team.id)}
                      className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      aria-label="Simpan nama tim"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      aria-label="Batal ubah nama"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.color }}
                      aria-hidden="true"
                    />
                    <h3 className="font-extrabold text-stone-900 text-base truncate">
                      {team.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleStartRename(team)}
                      className="text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
                      aria-label={`Ubah nama ${team.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeTeam(team.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                  aria-label={`Hapus ${team.name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Focal Score Display (Projector Distance Readable) */}
              <div className="py-2 text-center select-none overflow-hidden">
                <motion.div
                  key={team.score}
                  variants={scoreBumpMotion}
                  initial="initial"
                  animate="animate"
                  className="font-mono tabular-nums text-7xl sm:text-8xl font-black text-stone-900 select-none tracking-tight leading-none inline-block"
                  role="status"
                  aria-label={`Skor ${team.name}: ${team.score}`}
                >
                  {team.score}
                </motion.div>
              </div>

              {/* Touch-First Score Controls (Guaranteed >= 44x44px targets) */}
              <div className="space-y-2.5">
                {/* Primary Increment / Decrement (+1, -1) with generous 50px height */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleScoreChange(team, -1)}
                    aria-label={`Kurang 1 poin untuk ${team.name}`}
                    className="min-h-[50px] rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 font-bold text-lg flex items-center justify-center transition-all border border-stone-200/60 cursor-pointer select-none"
                  >
                    <Minus className="w-5 h-5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScoreChange(team, 1)}
                    aria-label={`Tambah 1 poin untuk ${team.name}`}
                    className="min-h-[50px] rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-black text-xl flex items-center justify-center shadow-xs transition-all border border-amber-600/30 cursor-pointer select-none"
                  >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Secondary Quick Jump Increments (+5, -5) with guaranteed 44px height */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleScoreChange(team, -5)}
                    aria-label={`Kurang 5 poin untuk ${team.name}`}
                    className="min-h-[44px] rounded-xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-700 font-bold text-xs transition-all border border-stone-200/50 cursor-pointer select-none"
                  >
                    -5
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScoreChange(team, 5)}
                    aria-label={`Tambah 5 poin untuk ${team.name}`}
                    className="min-h-[44px] rounded-xl bg-amber-100 hover:bg-amber-200/90 active:scale-95 text-amber-950 font-bold text-xs transition-all border border-amber-300/80 cursor-pointer select-none"
                  >
                    +5
                  </button>
                </div>

                {/* Individual Team Reset Link */}
                <div className="pt-2 text-center border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleResetTeam(team)}
                    className="text-xs text-stone-400 hover:text-stone-700 font-medium transition-colors cursor-pointer"
                  >
                    Reset Skor Tim
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
