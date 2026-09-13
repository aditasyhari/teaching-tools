import { describe, it, expect, beforeEach } from 'vitest';
import { PollRuntimeService } from '../poll-runtime.service';
import type { Poll, SessionParticipant } from '@walikelas/types';

describe('PollRuntimeService', () => {
  let service: PollRuntimeService;

  const mockPoll: Poll = {
    id: 'poll-1',
    teacherId: 'teacher-1',
    title: 'Cek Pemahaman',
    question: 'Apakah materi ini mudah dimengerti?',
    type: 'SINGLE_CHOICE',
    settings: {
      allowMultiple: false,
      showResultsToParticipants: true,
      isAnonymous: true,
    },
    status: 'PUBLISHED',
    options: [
      { id: 'opt-1', pollId: 'poll-1', order: 1, optionText: 'Sangat Mudah' },
      { id: 'opt-2', pollId: 'poll-1', order: 2, optionText: 'Cukup Mudah' },
      { id: 'opt-3', pollId: 'poll-1', order: 3, optionText: 'Sulit' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    service = new PollRuntimeService();
  });

  describe('initPoll', () => {
    it('initializes a live poll in a session with distribution set to zero', () => {
      const state = service.initPoll('sess-100', mockPoll);

      expect(state.sessionId).toBe('sess-100');
      expect(state.pollId).toBe('poll-1');
      expect(state.status).toBe('LIVE');
      expect(state.options).toHaveLength(3);
      expect(state.distribution['opt-1']).toBe(0);
      expect(state.distribution['opt-2']).toBe(0);
      expect(state.distribution['opt-3']).toBe(0);
      expect(service.isPollActive('sess-100')).toBe(true);
    });
  });

  describe('recordResponse', () => {
    beforeEach(() => {
      service.initPoll('sess-100', mockPoll);
    });

    it('records participant response and updates distribution', () => {
      const res = service.recordResponse('sess-100', 'part-1', 'opt-1');

      expect(res.accepted).toBe(true);
      expect(res.selectedOptionIds).toEqual(['opt-1']);

      const active = service.getActivePoll('sess-100');
      expect(active?.distribution['opt-1']).toBe(1);
      expect(active?.distribution['opt-2']).toBe(0);
      expect(active?.responses.size).toBe(1);
    });

    it('rejects duplicate response from the same participant (single submission locking)', () => {
      service.recordResponse('sess-100', 'part-1', 'opt-1');
      const res2 = service.recordResponse('sess-100', 'part-1', 'opt-2');

      expect(res2.accepted).toBe(false);
      expect(res2.error).toContain('sudah mengirim respon');

      const active = service.getActivePoll('sess-100');
      expect(active?.distribution['opt-1']).toBe(1);
      expect(active?.distribution['opt-2']).toBe(0);
    });

    it('rejects response with invalid option ID', () => {
      const res = service.recordResponse('sess-100', 'part-1', 'invalid-opt');

      expect(res.accepted).toBe(false);
      expect(res.error).toContain('tidak valid');
    });

    it('enforces single selection when allowMultiple is false', () => {
      const res = service.recordResponse('sess-100', 'part-1', undefined, ['opt-1', 'opt-2']);

      expect(res.accepted).toBe(true);
      expect(res.selectedOptionIds).toEqual(['opt-1']);

      const active = service.getActivePoll('sess-100');
      expect(active?.distribution['opt-1']).toBe(1);
      expect(active?.distribution['opt-2']).toBe(0);
    });

    it('allows multiple options when allowMultiple is true', () => {
      const multiPoll: Poll = {
        ...mockPoll,
        type: 'MULTIPLE_CHOICE',
        settings: { allowMultiple: true, showResultsToParticipants: true },
      };
      service.initPoll('sess-200', multiPoll);

      const res = service.recordResponse('sess-200', 'part-1', undefined, ['opt-1', 'opt-2']);
      expect(res.accepted).toBe(true);
      expect(res.selectedOptionIds).toEqual(['opt-1', 'opt-2']);

      const active = service.getActivePoll('sess-200');
      expect(active?.distribution['opt-1']).toBe(1);
      expect(active?.distribution['opt-2']).toBe(1);
    });

    it('rejects response if poll is not LIVE', () => {
      service.closePoll('sess-100');
      const res = service.recordResponse('sess-100', 'part-1', 'opt-1');

      expect(res.accepted).toBe(false);
      expect(res.error).toContain('ditutup atau tidak aktif');
    });
  });

  describe('closePoll', () => {
    it('closes the poll and computes final distribution and percentages', () => {
      service.initPoll('sess-100', mockPoll);
      service.recordResponse('sess-100', 'part-1', 'opt-1');
      service.recordResponse('sess-100', 'part-2', 'opt-1');
      service.recordResponse('sess-100', 'part-3', 'opt-2');

      const result = service.closePoll('sess-100');

      expect(result).not.toBeNull();
      expect(result?.totalResponses).toBe(3);
      expect(result?.distribution['opt-1']).toBe(2);
      expect(result?.distribution['opt-2']).toBe(1);
      expect(result?.distribution['opt-3']).toBe(0);

      // 2/3 = 67%, 1/3 = 33%
      expect(result?.percentages['opt-1']).toBe(67);
      expect(result?.percentages['opt-2']).toBe(33);
      expect(result?.percentages['opt-3']).toBe(0);

      expect(service.isPollActive('sess-100')).toBe(false);
    });
  });

  describe('snapshots', () => {
    const participants: SessionParticipant[] = [
      {
        id: 'part-1',
        sessionId: 'sess-100',
        displayName: 'Budi',
        joinedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        isOnline: true,
      },
      {
        id: 'part-2',
        sessionId: 'sess-100',
        displayName: 'Siti',
        joinedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        isOnline: true,
      },
    ];

    it('returns teacher snapshot with accurate response rate', () => {
      service.initPoll('sess-100', mockPoll);
      service.recordResponse('sess-100', 'part-1', 'opt-1');

      const snapshot = service.getTeacherSnapshot('sess-100', participants);

      expect(snapshot).not.toBeNull();
      expect(snapshot?.responseCount).toBe(1);
      expect(snapshot?.totalParticipants).toBe(2);
      expect(snapshot?.responseRate).toBe(50);
      expect(snapshot?.distribution['opt-1']).toBe(1);
    });

    it('returns participant snapshot with submission state and distribution', () => {
      service.initPoll('sess-100', mockPoll);
      service.recordResponse('sess-100', 'part-1', 'opt-1');

      const snapPart1 = service.getParticipantSnapshot('sess-100', 'part-1');
      expect(snapPart1?.hasResponded).toBe(true);
      expect(snapPart1?.selectedOptionIds).toEqual(['opt-1']);
      expect(snapPart1?.distribution).toBeDefined();

      const snapPart2 = service.getParticipantSnapshot('sess-100', 'part-2');
      expect(snapPart2?.hasResponded).toBe(false);
      expect(snapPart2?.selectedOptionIds).toEqual([]);
    });

    it('hides distribution from participants when showResultsToParticipants is false and poll is LIVE', () => {
      const privatePoll: Poll = {
        ...mockPoll,
        settings: { allowMultiple: false, showResultsToParticipants: false },
      };
      service.initPoll('sess-300', privatePoll);
      service.recordResponse('sess-300', 'part-1', 'opt-1');

      const snap = service.getParticipantSnapshot('sess-300', 'part-1');
      expect(snap?.distribution).toBeUndefined();

      // But when closed, distribution becomes visible
      service.closePoll('sess-300');
      const closedSnap = service.getParticipantSnapshot('sess-300', 'part-1');
      expect(closedSnap?.distribution).toBeDefined();
    });
  });

  describe('clearPoll', () => {
    it('removes poll runtime state', () => {
      service.initPoll('sess-100', mockPoll);
      expect(service.hasPoll('sess-100')).toBe(true);

      service.clearPoll('sess-100');
      expect(service.hasPoll('sess-100')).toBe(false);
      expect(service.getActivePoll('sess-100')).toBeUndefined();
    });
  });
});
