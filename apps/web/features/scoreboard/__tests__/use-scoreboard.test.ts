import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScoreboard } from '../use-scoreboard';

describe('useScoreboard Hook', () => {
  it('initializes with default 4 teams', () => {
    const { result } = renderHook(() => useScoreboard());
    expect(result.current.teamCount).toBe(4);
    expect(result.current.teams[0]?.name).toBe('Tim Merah');
    expect(result.current.teams[0]?.score).toBe(0);
  });

  it('increments and decrements scores correctly', () => {
    const { result } = renderHook(() => useScoreboard());
    const firstTeamId = result.current.teams[0]!.id;

    act(() => {
      result.current.changeScore(firstTeamId, 5);
    });
    expect(result.current.teams[0]?.score).toBe(5);

    act(() => {
      result.current.changeScore(firstTeamId, -2);
    });
    expect(result.current.teams[0]?.score).toBe(3);
  });

  it('adds and removes teams', () => {
    const { result } = renderHook(() => useScoreboard());

    act(() => {
      result.current.addTeam('Tim Ungu');
    });

    expect(result.current.teamCount).toBe(5);
    expect(result.current.teams[4]?.name).toBe('Tim Ungu');

    const addedId = result.current.teams[4]!.id;
    act(() => {
      result.current.removeTeam(addedId);
    });

    expect(result.current.teamCount).toBe(4);
  });

  it('renames a team', () => {
    const { result } = renderHook(() => useScoreboard());
    const firstTeamId = result.current.teams[0]!.id;

    act(() => {
      result.current.renameTeam(firstTeamId, 'Garuda Muda');
    });

    expect(result.current.teams[0]?.name).toBe('Garuda Muda');
  });

  it('resets team score and all scores', () => {
    const { result } = renderHook(() => useScoreboard());
    const team1Id = result.current.teams[0]!.id;
    const team2Id = result.current.teams[1]!.id;

    act(() => {
      result.current.changeScore(team1Id, 10);
      result.current.changeScore(team2Id, 15);
    });

    act(() => {
      result.current.resetTeamScore(team1Id);
    });

    expect(result.current.teams[0]?.score).toBe(0);
    expect(result.current.teams[1]?.score).toBe(15);

    act(() => {
      result.current.resetAllScores();
    });

    expect(result.current.teams[1]?.score).toBe(0);
  });
});
