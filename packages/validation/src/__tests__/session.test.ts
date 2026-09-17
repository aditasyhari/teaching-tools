import { describe, it, expect } from 'vitest';
import {
  joinSessionSchema,
  createSessionSchema,
  sessionActionSchema,
  sessionHeartbeatSchema,
} from '../session.js';

describe('joinSessionSchema', () => {
  it('should validate valid join input and uppercase the code', () => {
    const input = {
      code: 'abc123',
      displayName: 'Ahmad Budi',
    };

    const result = joinSessionSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe('ABC123');
      expect(result.data.displayName).toBe('Ahmad Budi');
    }
  });

  it('should accept optional participantId for reconnect', () => {
    const input = {
      code: 'AB7K42',
      displayName: 'Siti Rahma',
      participantId: 'p-12345',
    };

    const result = joinSessionSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.participantId).toBe('p-12345');
    }
  });

  it('should reject invalid code length', () => {
    const input = {
      code: 'ABC',
      displayName: 'Ahmad Budi',
    };

    const result = joinSessionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject empty display name', () => {
    const input = {
      code: 'ABC123',
      displayName: '   ',
    };

    const result = joinSessionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject display name exceeding max length', () => {
    const input = {
      code: 'ABC123',
      displayName: 'A'.repeat(31),
    };

    const result = joinSessionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('SEC-003: should reject reserved display names impersonating staff or system', () => {
    const reservedNames = [
      'guru',
      'Guru',
      'Pak Guru',
      'Bu Guru',
      'admin',
      'ADMIN',
      'Administrator',
      'operator',
      'system',
      'Sistem',
      'walikelas',
      'Wali Kelas',
      'host',
      'moderator',
    ];

    for (const name of reservedNames) {
      const res = joinSessionSchema.safeParse({
        code: 'ABC123',
        displayName: name,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toContain('dicadangkan');
      }
    }
  });

  it('should accept ordinary student names and projector display name', () => {
    const validNames = ['Ahmad Dahlan', 'Siti Rahma', 'Budi Santoso', 'Layar Proyektor', 'Agus'];
    for (const name of validNames) {
      const res = joinSessionSchema.safeParse({
        code: 'ABC123',
        displayName: name,
      });
      expect(res.success).toBe(true);
    }
  });
});

describe('createSessionSchema', () => {
  it('should validate valid session creation with optional classroomId', () => {
    const input = {
      title: 'Kelas Matematika 7A',
      classroomId: 'c-class-123',
    };

    const result = createSessionSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Kelas Matematika 7A');
      expect(result.data.classroomId).toBe('c-class-123');
    }
  });

  it('should reject empty title', () => {
    const input = {
      title: '   ',
    };

    const result = createSessionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('sessionActionSchema & sessionHeartbeatSchema', () => {
  it('should validate session action payload', () => {
    const valid = sessionActionSchema.safeParse({ sessionId: 'sess-123' });
    expect(valid.success).toBe(true);

    const invalid = sessionActionSchema.safeParse({ sessionId: '' });
    expect(invalid.success).toBe(false);
  });

  it('should validate session heartbeat payload', () => {
    const valid = sessionHeartbeatSchema.safeParse({
      sessionId: 'sess-123',
      participantId: 'p-1',
    });
    expect(valid.success).toBe(true);
  });
});
