import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuestionBox } from '../use-question-box';

describe('useQuestionBox Hook', () => {
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
    it('initializes with snapshot from question:state', () => {
      const { result } = renderHook(() =>
        useQuestionBox({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['question:state']?.({
          questions: [
            {
              id: 'q-1',
              sessionId: 'sess-123',
              participantId: 'p-1',
              authorName: 'Budi',
              isAnonymous: false,
              content: 'Kapan tugas dikumpulkan?',
              status: 'PENDING',
              createdAt: 1000,
            },
          ],
          highlightedQuestionId: null,
          pendingCount: 1,
          answeredCount: 0,
          totalCount: 1,
        });
      });

      expect(result.current.questions).toHaveLength(1);
      expect(result.current.pendingCount).toBe(1);
      expect(result.current.questions[0]?.content).toBe('Kapan tugas dikumpulkan?');
    });

    it('receives new question from question:created and count update', () => {
      const { result } = renderHook(() =>
        useQuestionBox({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['question:created']?.({
          question: {
            id: 'q-2',
            sessionId: 'sess-123',
            participantId: 'p-2',
            authorName: 'Siti',
            isAnonymous: true,
            content: 'Bisa jelaskan ulang bagian rumus gravitasi?',
            status: 'PENDING',
            createdAt: 2000,
          },
        });
      });

      expect(result.current.questions).toHaveLength(1);
      expect(result.current.questions[0]?.id).toBe('q-2');

      act(() => {
        eventHandlers['question:count-update']?.({
          pendingCount: 2,
          answeredCount: 0,
          totalCount: 2,
        });
      });

      expect(result.current.pendingCount).toBe(2);
      expect(result.current.totalCount).toBe(2);
    });

    it('emits moderation events when teacher triggers actions', () => {
      const { result } = renderHook(() =>
        useQuestionBox({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.highlightQuestion('q-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('question:highlight', {
        sessionId: 'sess-123',
        questionId: 'q-1',
      });

      act(() => {
        result.current.unhighlightQuestion('q-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('question:unhighlight', {
        sessionId: 'sess-123',
        questionId: 'q-1',
      });

      act(() => {
        result.current.answerQuestion('q-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('question:answer', {
        sessionId: 'sess-123',
        questionId: 'q-1',
      });

      act(() => {
        result.current.dismissQuestion('q-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('question:dismiss', {
        sessionId: 'sess-123',
        questionId: 'q-1',
      });
    });
  });

  describe('Participant Mode', () => {
    it('allows participant to submit a question and adds it to myQuestions on question:submitted', () => {
      const { result } = renderHook(() =>
        useQuestionBox({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        result.current.submitQuestion('Bagaimana langkah praktikum?', false);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('question:submit', {
        sessionId: 'sess-123',
        content: 'Bagaimana langkah praktikum?',
        isAnonymous: false,
      });
      expect(result.current.isSubmitting).toBe(true);

      act(() => {
        eventHandlers['question:submitted']?.({
          question: {
            id: 'q-mine',
            content: 'Bagaimana langkah praktikum?',
            status: 'PENDING',
            isAnonymous: false,
            createdAt: 3000,
          },
        });
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.myQuestions).toHaveLength(1);
      expect(result.current.myQuestions[0]?.id).toBe('q-mine');
      expect(result.current.successMessage).toBeDefined();
    });

    it('receives highlighted and unhighlighted question updates', () => {
      const { result } = renderHook(() =>
        useQuestionBox({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['question:highlighted']?.({
          question: {
            id: 'q-featured',
            content: 'Pertanyaan hebat',
            authorName: 'Anonim',
            isAnonymous: true,
            createdAt: 4000,
          },
        });
      });

      expect(result.current.highlightedQuestion).toBeDefined();
      expect(result.current.highlightedQuestion?.id).toBe('q-featured');

      act(() => {
        eventHandlers['question:unhighlighted']?.({
          questionId: 'q-featured',
        });
      });

      expect(result.current.highlightedQuestion).toBeNull();
    });

    it('handles question:error gracefully', () => {
      const { result } = renderHook(() =>
        useQuestionBox({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['question:error']?.({
          code: 'SUBMISSION_REJECTED',
          message: 'Mohon tunggu 5 detik sebelum mengirim pertanyaan lagi',
        });
      });

      expect(result.current.error).toBe('Mohon tunggu 5 detik sebelum mengirim pertanyaan lagi');
      expect(result.current.isSubmitting).toBe(false);

      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });
  });
});
