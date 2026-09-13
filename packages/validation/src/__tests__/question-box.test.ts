import { describe, it, expect } from 'vitest';
import { submitQuestionSchema, moderateQuestionSchema } from '../question-box.js';

describe('submitQuestionSchema', () => {
  it('validates a valid question submission', () => {
    const valid = {
      sessionId: 'sess-123',
      content: 'Kenapa hasil fotosintesis membutuhkan cahaya matahari?',
      isAnonymous: false,
    };
    const res = submitQuestionSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.content).toBe('Kenapa hasil fotosintesis membutuhkan cahaya matahari?');
      expect(res.data.isAnonymous).toBe(false);
    }
  });

  it('defaults isAnonymous to false when omitted', () => {
    const valid = {
      sessionId: 'sess-123',
      content: 'Bagaimana cara menentukan gradien garis lurus?',
    };
    const res = submitQuestionSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.isAnonymous).toBe(false);
    }
  });

  it('rejects empty content or whitespace-only content', () => {
    const invalid = {
      sessionId: 'sess-123',
      content: '     ',
    };
    const res = submitQuestionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects content exceeding 500 characters', () => {
    const invalid = {
      sessionId: 'sess-123',
      content: 'a'.repeat(501),
    };
    const res = submitQuestionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects missing sessionId', () => {
    const invalid = {
      sessionId: '',
      content: 'Ada pertanyaan?',
    };
    const res = submitQuestionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('moderateQuestionSchema', () => {
  it('validates valid moderation payload', () => {
    const valid = {
      sessionId: 'sess-123',
      questionId: 'q-999',
    };
    const res = moderateQuestionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects missing questionId', () => {
    const invalid = {
      sessionId: 'sess-123',
      questionId: '',
    };
    const res = moderateQuestionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
