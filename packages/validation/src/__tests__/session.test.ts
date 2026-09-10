import { describe, it, expect } from 'vitest';
import { joinSessionSchema, createSessionSchema } from '../session.js';

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
});

describe('createSessionSchema', () => {
  it('should validate valid session creation', () => {
    const input = {
      title: 'Kelas Matematika 7A',
    };

    const result = createSessionSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Kelas Matematika 7A');
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
