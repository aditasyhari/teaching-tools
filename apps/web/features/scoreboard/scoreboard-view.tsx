'use client';

import React, { useState } from 'react';
import { Trophy, Plus, Minus, RotateCcw, Trash2, Maximize2, Edit2, Check } from 'lucide-react';
import { Button, Badge } from '@walikelas/ui';
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleStartRename = (team: ScoreTeam) => {
    setEditingId(team.id);
    setEditingName(team.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      renameTeam(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h1 className="text-lg font-bold text-slate-900">Scoreboard Kelas</h1>
          <Badge variant="neutral" size="sm">
            {teamCount} Tim
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => addTeam()}
          >
            Tambah Tim
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={resetAllScores}
          >
            Reset Semua Skor
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
            onClick={clearBoard}
          >
            Kosongkan
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

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[360px] text-slate-400 space-y-3">
          <Trophy className="w-12 h-12 text-slate-300" />
          <p className="text-sm font-medium">
            Papan skor kosong. Klik <b>Tambah Tim</b> untuk memulai kompetisi.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => addTeam()}
          >
            Tambah Tim Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col justify-between gap-6 transition-all hover:border-slate-300"
              style={{ borderTopColor: team.color, borderTopWidth: 6 }}
            >
              {/* Team Header */}
              <div className="flex items-center justify-between gap-2">
                {editingId === team.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(team.id)}
                      autoFocus
                      className="w-full text-sm font-bold px-2 py-1 border border-blue-400 rounded-lg focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(team.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-700"
                      aria-label="Simpan nama tim"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                    <h3 className="font-extrabold text-slate-900 text-base truncate">
                      {team.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleStartRename(team)}
                      className="text-slate-300 hover:text-slate-600 transition-colors p-1"
                      aria-label={`Ubah nama ${team.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeTeam(team.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  aria-label={`Hapus ${team.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Score Display */}
              <div className="py-4 text-center">
                <div
                  className="font-mono text-7xl sm:text-8xl font-black text-slate-900 select-none tracking-tight"
                  role="status"
                  aria-label={`Skor ${team.name}: ${team.score}`}
                >
                  {team.score}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* Primary Increment / Decrement (+1, -1) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => changeScore(team.id, -1)}
                    aria-label={`Kurang 1 poin untuk ${team.name}`}
                    className="min-h-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-lg flex items-center justify-center transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => changeScore(team.id, 1)}
                    aria-label={`Tambah 1 poin untuk ${team.name}`}
                    className="min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-lg flex items-center justify-center shadow-xs transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Secondary Quick Increments (+5, -5) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => changeScore(team.id, -5)}
                    aria-label={`Kurang 5 poin untuk ${team.name}`}
                    className="min-h-[40px] rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 font-semibold text-xs transition-all"
                  >
                    -5
                  </button>

                  <button
                    type="button"
                    onClick={() => changeScore(team.id, 5)}
                    aria-label={`Tambah 5 poin untuk ${team.name}`}
                    className="min-h-[40px] rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 font-semibold text-xs transition-all"
                  >
                    +5
                  </button>
                </div>

                {/* Reset Individual Team */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => resetTeamScore(team.id)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                  >
                    Reset Skor Tim
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
