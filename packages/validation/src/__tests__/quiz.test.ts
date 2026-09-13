import { describe, it, expect } from 'vitest';
import {
  createQuizSchema,
  updateQuizSchema,
  quizQuestionSchema,
  quizAnswerSubmissionSchema,
} from '../quiz.js';

describe('quizQuestionSchema', () => {
  it('validates a valid question with exactly 1 correct option', () => {
    const valid = {
      text: 'Apa ibukota Indonesia?',
      points: 100,
      options: [
        { text: 'Jakarta', isCorrect: false },
        { text: 'Nusantara', isCorrect: true },
        { text: 'Surabaya', isCorrect: false },
      ],
    };

    const res = quizQuestionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects a question with 0 correct options', () => {
    const invalid = {
      text: 'Pertanyaan tanpa jawaban',
      options: [
        { text: 'Opsi A', isCorrect: false },
        { text: 'Opsi B', isCorrect: false },
      ],
    };

    const res = quizQuestionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects a question with multiple correct options (V1 single choice only)', () => {
    const invalid = {
      text: 'Pertanyaan dengan 2 jawaban benar',
      options: [
        { text: 'Opsi A', isCorrect: true },
        { text: 'Opsi B', isCorrect: true },
      ],
    };

    const res = quizQuestionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects a question with fewer than 2 options', () => {
    const invalid = {
      text: 'Hanya 1 opsi',
      options: [{ text: 'Opsi Tunggal', isCorrect: true }],
    };

    const res = quizQuestionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('createQuizSchema', () => {
  it('validates a complete quiz creation payload', () => {
    const valid = {
      title: 'Kuis Biologi Sel',
      description: 'Uji pemahaman struktur dan fungsi sel',
      questions: [
        {
          text: 'Organel penghasil energi adalah?',
          options: [
            { text: 'Mitokondria', isCorrect: true },
            { text: 'Ribosom', isCorrect: false },
          ],
        },
      ],
    };

    const res = createQuizSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.title).toBe('Kuis Biologi Sel');
      expect(res.data.settings.timeLimitSeconds).toBe(30);
    }
  });

  it('rejects a quiz with empty questions array', () => {
    const invalid = {
      title: 'Kuis Kosong',
      questions: [],
    };

    const res = createQuizSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('updateQuizSchema', () => {
  it('validates partial quiz update', () => {
    const valid = {
      title: 'Kuis Biologi Lanjutan',
    };

    const res = updateQuizSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});

describe('quizAnswerSubmissionSchema', () => {
  it('validates answer submission payload', () => {
    const valid = {
      sessionId: 'sess-123',
      questionId: 'q-1',
      optionId: 'opt-2',
    };

    const res = quizAnswerSubmissionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects missing fields', () => {
    const invalid = {
      sessionId: 'sess-123',
      questionId: '',
      optionId: 'opt-2',
    };

    const res = quizAnswerSubmissionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
