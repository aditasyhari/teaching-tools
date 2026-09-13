import { describe, it, expect } from 'vitest';
import {
  createPollSchema,
  updatePollSchema,
  pollOptionSchema,
  pollResponseSubmissionSchema,
} from '../poll.js';

describe('pollOptionSchema', () => {
  it('validates a valid poll option', () => {
    const valid = {
      optionText: 'Paham sekali',
    };
    const res = pollOptionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects an empty option text', () => {
    const invalid = {
      optionText: '   ',
    };
    const res = pollOptionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('createPollSchema', () => {
  it('validates a complete poll creation payload', () => {
    const valid = {
      title: 'Cek Pemahaman Materi Hari Ini',
      question: 'Seberapa paham kamu dengan materi pecahan desimal?',
      type: 'SINGLE_CHOICE',
      settings: {
        allowMultiple: false,
        showResultsToParticipants: true,
        isAnonymous: true,
      },
      options: [
        { optionText: 'Sangat Paham' },
        { optionText: 'Cukup Paham' },
        { optionText: 'Masih Bingung' },
      ],
    };

    const res = createPollSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.title).toBe('Cek Pemahaman Materi Hari Ini');
      expect(res.data.options).toHaveLength(3);
    }
  });

  it('rejects a poll with fewer than 2 options', () => {
    const invalid = {
      title: 'Poll Opsi Kurang',
      question: 'Apakah setuju?',
      options: [{ optionText: 'Setuju' }],
    };

    const res = createPollSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects a poll with more than 8 options', () => {
    const invalid = {
      title: 'Poll Opsi Terlalu Banyak',
      question: 'Pilih opsi',
      options: Array.from({ length: 9 }, (_, i) => ({ optionText: `Opsi ${i + 1}` })),
    };

    const res = createPollSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects empty title or question', () => {
    const invalid = {
      title: '',
      question: 'Ada pertanyaan?',
      options: [{ optionText: 'Ya' }, { optionText: 'Tidak' }],
    };

    const res = createPollSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('updatePollSchema', () => {
  it('validates partial poll update', () => {
    const valid = {
      title: 'Judul Baru Polling',
    };

    const res = updatePollSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});

describe('pollResponseSubmissionSchema', () => {
  it('validates submission with optionId', () => {
    const valid = {
      sessionId: 'session-123',
      pollId: 'poll-123',
      optionId: 'opt-1',
    };

    const res = pollResponseSubmissionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates submission with optionIds', () => {
    const valid = {
      sessionId: 'session-123',
      pollId: 'poll-123',
      optionIds: ['opt-1', 'opt-2'],
    };

    const res = pollResponseSubmissionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects submission with neither optionId nor optionIds', () => {
    const invalid = {
      sessionId: 'session-123',
      pollId: 'poll-123',
    };

    const res = pollResponseSubmissionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects submission with empty sessionId or pollId', () => {
    const invalid = {
      sessionId: '',
      pollId: 'poll-123',
      optionId: 'opt-1',
    };

    const res = pollResponseSubmissionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
