'use client';

import { useState, useCallback } from 'react';

export interface ScoreTeam {
  id: string;
  name: string;
  score: number;
  color: string;
}

const DEFAULT_COLORS = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#0891b2', // Cyan
];

const INITIAL_TEAMS: ScoreTeam[] = [
  { id: 'team-1', name: 'Tim Merah', score: 0, color: '#dc2626' },
  { id: 'team-2', name: 'Tim Biru', score: 0, color: '#2563eb' },
  { id: 'team-3', name: 'Tim Hijau', score: 0, color: '#059669' },
  { id: 'team-4', name: 'Tim Kuning', score: 0, color: '#d97706' },
];

export function useScoreboard(initialTeams = INITIAL_TEAMS) {
  const [teams, setTeams] = useState<ScoreTeam[]>(initialTeams);

  const addTeam = useCallback((name?: string) => {
    setTeams((prev) => {
      const nextNum = prev.length + 1;
      const color = DEFAULT_COLORS[(nextNum - 1) % DEFAULT_COLORS.length] || '#2563eb';
      const newTeam: ScoreTeam = {
        id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name || `Tim ${nextNum}`,
        score: 0,
        color,
      };
      return [...prev, newTeam];
    });
  }, []);

  const removeTeam = useCallback((id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const renameTeam = useCallback((id: string, newName: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: newName.trim() || t.name } : t)),
    );
  }, []);

  const changeScore = useCallback((id: string, delta: number) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, score: t.score + delta } : t)));
  }, []);

  const resetTeamScore = useCallback((id: string) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, score: 0 } : t)));
  }, []);

  const resetAllScores = useCallback(() => {
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
  }, []);

  const clearBoard = useCallback(() => {
    setTeams([]);
  }, []);

  return {
    teams,
    teamCount: teams.length,
    addTeam,
    removeTeam,
    renameTeam,
    changeScore,
    resetTeamScore,
    resetAllScores,
    clearBoard,
    setTeams,
  };
}
