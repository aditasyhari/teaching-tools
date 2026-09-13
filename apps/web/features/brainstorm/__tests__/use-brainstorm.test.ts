import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBrainstorm } from '../use-brainstorm';

describe('useBrainstorm Hook', () => {
  let mockSocket: any;
  let eventHandlers: Record<string, Function> = {};

  beforeEach(() => {
    eventHandlers = {};
    mockSocket = {
      connected: true,
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
      off: vi.fn((event: string) => {
        delete eventHandlers[event];
      }),
      emit: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Teacher Mode', () => {
    it('initializes with snapshot from brainstorm:state', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['brainstorm:state']?.({
          activity: {
            id: 'act-1',
            sessionId: 'sess-123',
            prompt: 'Apa itu fotosintesis?',
            status: 'OPEN',
            settings: {
              isAnonymous: false,
              ideasVisibleToParticipants: true,
              submissionMode: 'MULTIPLE_PER_PARTICIPANT',
              maxIdeasPerParticipant: 5,
            },
            createdAt: 1000,
          },
          ideas: [
            {
              id: 'idea-1',
              sessionId: 'sess-123',
              activityId: 'act-1',
              participantId: 'p-1',
              authorName: 'Budi',
              isAnonymous: false,
              content: 'Proses membuat makanan oleh tumbuhan',
              status: 'VISIBLE',
              createdAt: 1100,
            },
          ],
          visibleCount: 1,
          hiddenCount: 0,
          totalCount: 1,
        });
      });

      expect(result.current.activity?.id).toBe('act-1');
      expect(result.current.activity?.status).toBe('OPEN');
      expect(result.current.ideas).toHaveLength(1);
      expect(result.current.visibleCount).toBe(1);
      expect(result.current.totalCount).toBe(1);
    });

    it('handles status transitions: opened, paused, closed', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['brainstorm:state']?.({
          activity: {
            id: 'act-1',
            sessionId: 'sess-123',
            prompt: 'Ide topik sains',
            status: 'DRAFT',
            settings: {
              isAnonymous: false,
              ideasVisibleToParticipants: true,
              submissionMode: 'ONE_PER_PARTICIPANT',
              maxIdeasPerParticipant: 1,
            },
            createdAt: 1000,
          },
          ideas: [],
          visibleCount: 0,
          hiddenCount: 0,
          totalCount: 0,
        });
      });

      expect(result.current.activity?.status).toBe('DRAFT');

      act(() => {
        eventHandlers['brainstorm:opened']?.({
          activityId: 'act-1',
          openedAt: 1200,
        });
      });
      expect(result.current.activity?.status).toBe('OPEN');

      act(() => {
        eventHandlers['brainstorm:paused']?.({
          activityId: 'act-1',
          pausedAt: 1300,
        });
      });
      expect(result.current.activity?.status).toBe('PAUSED');

      act(() => {
        eventHandlers['brainstorm:closed']?.({
          activityId: 'act-1',
          closedAt: 1400,
        });
      });
      expect(result.current.activity?.status).toBe('CLOSED');
    });

    it('receives new idea from brainstorm:idea-created', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['brainstorm:idea-created']?.({
          idea: {
            id: 'idea-2',
            sessionId: 'sess-123',
            activityId: 'act-1',
            participantId: 'p-2',
            authorName: 'Siti',
            isAnonymous: false,
            content: 'Memerlukan klorofil dan cahaya matahari',
            status: 'VISIBLE',
            createdAt: 1500,
          },
          visibleCount: 1,
          totalCount: 1,
        });
      });

      expect(result.current.ideas).toHaveLength(1);
      expect(result.current.ideas[0]?.content).toBe('Memerlukan klorofil dan cahaya matahari');
      expect(result.current.visibleCount).toBe(1);
    });

    it('handles brainstorm:idea-hidden and brainstorm:idea-restored', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['brainstorm:state']?.({
          activity: { id: 'act-1', status: 'OPEN' },
          ideas: [
            {
              id: 'idea-1',
              sessionId: 'sess-123',
              activityId: 'act-1',
              participantId: 'p-1',
              authorName: 'Budi',
              isAnonymous: false,
              content: 'Ide bagus',
              status: 'VISIBLE',
              createdAt: 1000,
            },
          ],
          visibleCount: 1,
          hiddenCount: 0,
          totalCount: 1,
        });
      });

      act(() => {
        eventHandlers['brainstorm:idea-hidden']?.({
          ideaId: 'idea-1',
          totalCount: 0,
        });
      });

      expect(result.current.ideas[0]?.status).toBe('HIDDEN');
      expect(result.current.visibleCount).toBe(0);

      act(() => {
        eventHandlers['brainstorm:idea-restored']?.({
          idea: {
            id: 'idea-1',
            authorName: 'Budi',
            isAnonymous: false,
            content: 'Ide bagus',
            createdAt: 1000,
          },
          totalCount: 1,
        });
      });

      expect(result.current.ideas[0]?.status).toBe('VISIBLE');
      expect(result.current.visibleCount).toBe(1);
    });

    it('emits teacher lifecycle and moderation actions', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.createActivity('Topik Baru', {
          isAnonymous: true,
          ideasVisibleToParticipants: true,
          submissionMode: 'ONE_PER_PARTICIPANT',
        });
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('brainstorm:create', {
        sessionId: 'sess-123',
        prompt: 'Topik Baru',
        isAnonymous: true,
        ideasVisibleToParticipants: true,
        submissionMode: 'ONE_PER_PARTICIPANT',
      });

      act(() => {
        result.current.openActivity();
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('brainstorm:open', {
        sessionId: 'sess-123',
      });

      act(() => {
        result.current.pauseActivity();
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('brainstorm:pause', {
        sessionId: 'sess-123',
      });

      act(() => {
        result.current.closeActivity();
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('brainstorm:close', {
        sessionId: 'sess-123',
      });

      act(() => {
        result.current.hideIdea('idea-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('brainstorm:hide', {
        sessionId: 'sess-123',
        ideaId: 'idea-1',
      });

      act(() => {
        result.current.restoreIdea('idea-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('brainstorm:restore', {
        sessionId: 'sess-123',
        ideaId: 'idea-1',
      });
    });
  });

  describe('Participant Mode', () => {
    it('initializes with snapshot from brainstorm:state', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['brainstorm:state']?.({
          activity: {
            id: 'act-1',
            prompt: 'Apa itu ekosistem?',
            status: 'OPEN',
            settings: {
              isAnonymous: false,
              ideasVisibleToParticipants: true,
              submissionMode: 'ONE_PER_PARTICIPANT',
              maxIdeasPerParticipant: 1,
            },
          },
          myIdeas: [],
          ideas: [],
          canSubmit: true,
          totalIdeasCount: 0,
        });
      });

      expect(result.current.participantActivity?.prompt).toBe('Apa itu ekosistem?');
      expect(result.current.canSubmit).toBe(true);
      expect(result.current.myIdeas).toHaveLength(0);
    });

    it('submits idea and handles brainstorm:idea-submitted', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        result.current.submitIdea('Komunitas makhluk hidup dan lingkungannya');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('brainstorm:submit', {
        sessionId: 'sess-123',
        content: 'Komunitas makhluk hidup dan lingkungannya',
      });
      expect(result.current.isSubmitting).toBe(true);

      act(() => {
        eventHandlers['brainstorm:idea-submitted']?.({
          idea: {
            id: 'idea-1',
            content: 'Komunitas makhluk hidup dan lingkungannya',
            status: 'VISIBLE',
            isAnonymous: false,
            createdAt: 1000,
          },
        });
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.cooldown).toBe(3);
      expect(result.current.myIdeas).toHaveLength(1);
      expect(result.current.successMessage).toBe('Ide Anda berhasil dikirim ke papan!');
    });

    it('rejects empty or whitespace-only ideas on client', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        result.current.submitIdea('   ');
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Ide tidak boleh kosong');
    });

    it('handles brainstorm:error', () => {
      const { result } = renderHook(() =>
        useBrainstorm({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['brainstorm:error']?.({
          code: 'LIMIT_EXCEEDED',
          message: 'Anda telah mencapai batas maksimum ide',
        });
      });

      expect(result.current.error).toBe('Anda telah mencapai batas maksimum ide');
    });
  });
});
