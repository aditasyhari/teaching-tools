import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveQuiz } from '../use-live-quiz';

describe('useLiveQuiz Hook', () => {
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
    it('allows teacher to start quiz', () => {
      const { result } = renderHook(() =>
        useLiveQuiz({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.startQuiz('quiz-1');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('quiz:start', {
        sessionId: 'sess-123',
        quizId: 'quiz-1',
      });
    });

    it('updates state on quiz:started and quiz:question-started', () => {
      const { result } = renderHook(() =>
        useLiveQuiz({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['quiz:started']?.({
          quizId: 'quiz-1',
          title: 'Kuis IPA',
          totalQuestions: 3,
        });
      });

      expect(result.current.isQuizActive).toBe(true);
      expect(result.current.totalQuestions).toBe(3);

      act(() => {
        eventHandlers['quiz:question-started']?.({
          questionNumber: 1,
          totalQuestions: 3,
          question: {
            id: 'q-1',
            order: 1,
            questionText: 'Soal 1',
            points: 100,
            options: [
              { id: 'opt-1', order: 1, optionText: 'A' },
              { id: 'opt-2', order: 2, optionText: 'B' },
            ],
          },
          deadline: Date.now() + 20000,
        });
      });

      expect(result.current.questionNumber).toBe(1);
      expect(result.current.isQuestionEnded).toBe(false);
    });

    it('teacher ends question and advances to next', () => {
      const { result } = renderHook(() =>
        useLiveQuiz({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.endQuestion();
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('quiz:end-question', {
        sessionId: 'sess-123',
      });

      act(() => {
        eventHandlers['quiz:question-ended']?.({
          correctOptionId: 'opt-1',
          distribution: { 'opt-1': 5, 'opt-2': 2 },
        });
      });

      expect(result.current.isQuestionEnded).toBe(true);
      expect(result.current.correctOptionId).toBe('opt-1');
      expect(result.current.distribution['opt-1']).toBe(5);

      act(() => {
        result.current.nextQuestion();
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('quiz:next-question', {
        sessionId: 'sess-123',
      });
    });

    it('handles quiz:finished with leaderboard', () => {
      const { result } = renderHook(() =>
        useLiveQuiz({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['quiz:finished']?.({
          leaderboard: [
            { participantId: 'p-1', displayName: 'Budi', score: 200, correctCount: 2, rank: 1 },
          ],
        });
      });

      expect(result.current.isQuizActive).toBe(false);
      expect(result.current.isQuizFinished).toBe(true);
      expect(result.current.leaderboard).toHaveLength(1);
      expect(result.current.leaderboard[0]!.displayName).toBe('Budi');
    });
  });

  describe('Participant Mode', () => {
    it('participant receives question and submits answer', () => {
      const { result } = renderHook(() =>
        useLiveQuiz({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['quiz:question-started']?.({
          questionNumber: 1,
          totalQuestions: 2,
          question: {
            id: 'q-1',
            order: 1,
            questionText: 'Ibu kota Indonesia?',
            points: 100,
            options: [
              { id: 'opt-1', order: 1, optionText: 'Jakarta' },
              { id: 'opt-2', order: 2, optionText: 'Nusantara' },
            ],
          },
          deadline: Date.now() + 20000,
        });
      });

      expect(result.current.participantQuestion?.questionText).toBe('Ibu kota Indonesia?');
      expect(result.current.hasAnswered).toBe(false);

      act(() => {
        result.current.submitAnswer('q-1', 'opt-2');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('quiz:answer', {
        sessionId: 'sess-123',
        questionId: 'q-1',
        optionId: 'opt-2',
      });
      expect(result.current.selectedOptionId).toBe('opt-2');

      // Server acknowledges answer
      act(() => {
        eventHandlers['quiz:answer-accepted']?.({
          questionId: 'q-1',
          optionId: 'opt-2',
        });
      });
      expect(result.current.hasAnswered).toBe(true);

      // Question ends and reveals correct answer
      act(() => {
        eventHandlers['quiz:question-ended']?.({
          correctOptionId: 'opt-2',
          distribution: { 'opt-1': 1, 'opt-2': 4 },
        });
      });

      expect(result.current.isQuestionEnded).toBe(true);
      expect(result.current.wasCorrect).toBe(true);
      expect(result.current.pointsEarned).toBe(100);
      expect(result.current.totalScore).toBe(100);
    });
  });
});
