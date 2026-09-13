import { describe, it, expect } from 'vitest';
import {
  createBrainstormSchema,
  brainstormActionSchema,
  submitBrainstormIdeaSchema,
  moderateBrainstormIdeaSchema,
} from '../brainstorm.js';

describe('createBrainstormSchema', () => {
  it('validates a valid brainstorm creation payload with defaults', () => {
    const valid = {
      sessionId: 'sess-123',
      prompt: 'Apa ide kalian untuk membuat sekolah lebih ramah lingkungan?',
    };
    const res = createBrainstormSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.prompt).toBe('Apa ide kalian untuk membuat sekolah lebih ramah lingkungan?');
      expect(res.data.isAnonymous).toBe(false);
      expect(res.data.ideasVisibleToParticipants).toBe(false);
      expect(res.data.submissionMode).toBe('ONE_PER_PARTICIPANT');
    }
  });

  it('accepts custom settings', () => {
    const valid = {
      sessionId: 'sess-123',
      prompt: 'Refleksi pembelajaran hari ini',
      isAnonymous: true,
      ideasVisibleToParticipants: true,
      submissionMode: 'MULTIPLE_PER_PARTICIPANT' as const,
    };
    const res = createBrainstormSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.isAnonymous).toBe(true);
      expect(res.data.ideasVisibleToParticipants).toBe(true);
      expect(res.data.submissionMode).toBe('MULTIPLE_PER_PARTICIPANT');
    }
  });

  it('rejects empty or whitespace-only prompt', () => {
    const invalid = {
      sessionId: 'sess-123',
      prompt: '     ',
    };
    const res = createBrainstormSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects prompt exceeding 300 characters', () => {
    const invalid = {
      sessionId: 'sess-123',
      prompt: 'a'.repeat(301),
    };
    const res = createBrainstormSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('brainstormActionSchema', () => {
  it('validates a valid action payload', () => {
    const valid = { sessionId: 'sess-123' };
    const res = brainstormActionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects missing or empty sessionId', () => {
    const invalid = { sessionId: '' };
    const res = brainstormActionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('submitBrainstormIdeaSchema', () => {
  it('validates a valid idea submission and trims whitespace', () => {
    const valid = {
      sessionId: 'sess-123',
      content: '  Membuat bank sampah plastik  ',
    };
    const res = submitBrainstormIdeaSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.content).toBe('Membuat bank sampah plastik');
    }
  });

  it('rejects empty or whitespace-only content', () => {
    const invalid = {
      sessionId: 'sess-123',
      content: '   ',
    };
    const res = submitBrainstormIdeaSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects content exceeding 300 characters', () => {
    const invalid = {
      sessionId: 'sess-123',
      content: 'a'.repeat(301),
    };
    const res = submitBrainstormIdeaSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('moderateBrainstormIdeaSchema', () => {
  it('validates a valid moderation payload', () => {
    const valid = {
      sessionId: 'sess-123',
      ideaId: 'idea-456',
    };
    const res = moderateBrainstormIdeaSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects empty ideaId', () => {
    const invalid = {
      sessionId: 'sess-123',
      ideaId: '',
    };
    const res = moderateBrainstormIdeaSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
