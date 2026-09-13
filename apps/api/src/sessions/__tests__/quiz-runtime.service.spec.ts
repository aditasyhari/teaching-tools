import { describe, it, expect, beforeEach } from 'vitest';
import { QuizRuntimeService } from '../quiz-runtime.service';
import type { Quiz } from '@walikelas/types';

describe('QuizRuntimeService', () => {
  let service: QuizRuntimeService;

  const sampleQuiz: Quiz = {
    id: 'quiz-1',
    teacherId: 'teacher-1',
    title: 'Kuis Geografi',
    description: 'Bab 1',
    settings: {
      timeLimitSeconds: 10,
      showLeaderboard: true,
      showCorrectAnswer: true,
    },
    status: 'PUBLISHED',
    questions: [
      {
        id: 'q-1',
        quizId: 'quiz-1',
        order: 1,
        questionText: 'Ibu kota Indonesia?',
        points: 100,
        timeLimitSeconds: 10,
        options: [
          { id: 'opt-1', questionId: 'q-1', order: 1, optionText: 'Jakarta', isCorrect: false },
          { id: 'opt-2', questionId: 'q-1', order: 2, optionText: 'Nusantara', isCorrect: true },
        ],
      },
      {
        id: 'q-2',
        quizId: 'quiz-1',
        order: 2,
        questionText: 'Benua terbesar di dunia?',
        points: 100,
        timeLimitSeconds: 10,
        options: [
          { id: 'opt-3', questionId: 'q-2', order: 1, optionText: 'Asia', isCorrect: true },
          { id: 'opt-4', questionId: 'q-2', order: 2, optionText: 'Afrika', isCorrect: false },
        ],
      },
    ],
    createdAt: '2026-09-13T00:00:00.000Z',
    updatedAt: '2026-09-13T00:00:00.000Z',
  };

  beforeEach(() => {
    service = new QuizRuntimeService();
  });

  describe('initQuiz', () => {
    it('initializes quiz in memory with first question active', () => {
      const state = service.initQuiz('sess-1', sampleQuiz);

      expect(state.sessionId).toBe('sess-1');
      expect(state.quizId).toBe('quiz-1');
      expect(state.status).toBe('QUESTION_ACTIVE');
      expect(state.currentQuestionIndex).toBe(0);
      expect(service.isQuizActive('sess-1')).toBe(true);
    });

    it('sanitizes participant question by removing isCorrect field', () => {
      service.initQuiz('sess-1', sampleQuiz);
      const participantQ = service.getCurrentParticipantQuestion('sess-1');

      expect(participantQ).toBeDefined();
      expect(participantQ?.id).toBe('q-1');
      expect(participantQ?.options).toHaveLength(2);
      expect((participantQ?.options[0] as any).isCorrect).toBeUndefined();
      expect((participantQ?.options[1] as any).isCorrect).toBeUndefined();
    });
  });

  describe('recordAnswer & Scoring', () => {
    beforeEach(() => {
      service.initQuiz('sess-1', sampleQuiz);
    });

    it('records correct answer and awards points', () => {
      const result = service.recordAnswer('sess-1', 'p-1', 'q-1', 'opt-2'); // opt-2 is correct

      expect(result.accepted).toBe(true);
      expect(result.wasCorrect).toBe(true);
      expect(result.pointsEarned).toBe(100);
    });

    it('records incorrect answer with zero points', () => {
      const result = service.recordAnswer('sess-1', 'p-1', 'q-1', 'opt-1'); // opt-1 is wrong

      expect(result.accepted).toBe(true);
      expect(result.wasCorrect).toBe(false);
      expect(result.pointsEarned).toBe(0);
    });

    it('rejects duplicate answer submissions from the same participant', () => {
      service.recordAnswer('sess-1', 'p-1', 'q-1', 'opt-2');
      const duplicateResult = service.recordAnswer('sess-1', 'p-1', 'q-1', 'opt-1');

      expect(duplicateResult.accepted).toBe(false);
      expect(duplicateResult.error).toContain('sudah menjawab');
    });

    it('rejects submissions for wrong questionId', () => {
      const wrongQResult = service.recordAnswer('sess-1', 'p-1', 'q-wrong', 'opt-1');

      expect(wrongQResult.accepted).toBe(false);
      expect(wrongQResult.error).toContain('tidak valid');
    });
  });

  describe('endQuestion & nextQuestion', () => {
    beforeEach(() => {
      service.initQuiz('sess-1', sampleQuiz);
      service.recordAnswer('sess-1', 'p-1', 'q-1', 'opt-2'); // Correct
      service.recordAnswer('sess-1', 'p-2', 'q-1', 'opt-1'); // Wrong
    });

    it('ends question and returns option distribution', () => {
      const result = service.endQuestion('sess-1');

      expect(result).toBeDefined();
      expect(result?.correctOptionId).toBe('opt-2');
      expect(result?.distribution['opt-1']).toBe(1);
      expect(result?.distribution['opt-2']).toBe(1);

      // Now answering is rejected because status is QUESTION_ENDED
      const lateAns = service.recordAnswer('sess-1', 'p-3', 'q-1', 'opt-2');
      expect(lateAns.accepted).toBe(false);
    });

    it('advances to next question', () => {
      service.endQuestion('sess-1');
      const nextResult = service.nextQuestion('sess-1');

      expect(nextResult?.isComplete).toBe(false);
      expect(nextResult?.questionNumber).toBe(2);

      const currentQ = service.getCurrentParticipantQuestion('sess-1');
      expect(currentQ?.id).toBe('q-2');
    });

    it('marks quiz complete after last question', () => {
      service.endQuestion('sess-1');
      service.nextQuestion('sess-1'); // move to q-2

      service.endQuestion('sess-1');
      const finalNext = service.nextQuestion('sess-1'); // no more questions

      expect(finalNext?.isComplete).toBe(true);
      expect(service.isQuizActive('sess-1')).toBe(false);
    });
  });

  describe('Leaderboard & Snapshots', () => {
    it('compiles leaderboard sorted by score descending', () => {
      service.initQuiz('sess-1', sampleQuiz);
      service.recordAnswer('sess-1', 'p-1', 'q-1', 'opt-2'); // 100 pts
      service.recordAnswer('sess-1', 'p-2', 'q-1', 'opt-1'); // 0 pts

      const participants = [
        { id: 'p-1', displayName: 'Budi' },
        { id: 'p-2', displayName: 'Siti' },
      ];

      const leaderboard = service.getLeaderboard('sess-1', participants as any);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].participantId).toBe('p-1');
      expect(leaderboard[0].displayName).toBe('Budi');
      expect(leaderboard[0].score).toBe(100);
      expect(leaderboard[0].rank).toBe(1);

      expect(leaderboard[1].participantId).toBe('p-2');
      expect(leaderboard[1].score).toBe(0);
      expect(leaderboard[1].rank).toBe(2);
    });

    it('produces sanitized participant snapshot without leaking correct answers', () => {
      service.initQuiz('sess-1', sampleQuiz);
      service.recordAnswer('sess-1', 'p-1', 'q-1', 'opt-1');

      const snapshot = service.getParticipantSnapshot('sess-1', 'p-1');
      expect(snapshot).toBeDefined();
      expect(snapshot?.hasAnswered).toBe(true);
      expect(snapshot?.selectedOptionId).toBe('opt-1');
      expect(snapshot?.totalScore).toBe(0);
      expect((snapshot?.currentQuestion?.options[0] as any)?.isCorrect).toBeUndefined();
    });
  });
});
