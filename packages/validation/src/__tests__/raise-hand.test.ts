import { describe, it, expect } from 'vitest';
import { raiseHandActionSchema, moderateHandActionSchema } from '../raise-hand';

describe('Raise Hand Validation Schemas', () => {
  describe('raiseHandActionSchema', () => {
    it('accepts valid sessionId', () => {
      const res = raiseHandActionSchema.safeParse({ sessionId: 'session-123' });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.sessionId).toBe('session-123');
      }
    });

    it('rejects empty sessionId', () => {
      const res = raiseHandActionSchema.safeParse({ sessionId: '   ' });
      expect(res.success).toBe(false);
    });

    it('rejects missing sessionId', () => {
      const res = raiseHandActionSchema.safeParse({});
      expect(res.success).toBe(false);
    });
  });

  describe('moderateHandActionSchema', () => {
    it('accepts valid sessionId and handId', () => {
      const res = moderateHandActionSchema.safeParse({
        sessionId: 'session-123',
        handId: 'hand-456',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.sessionId).toBe('session-123');
        expect(res.data.handId).toBe('hand-456');
      }
    });

    it('rejects empty handId', () => {
      const res = moderateHandActionSchema.safeParse({
        sessionId: 'session-123',
        handId: '   ',
      });
      expect(res.success).toBe(false);
    });

    it('rejects missing handId', () => {
      const res = moderateHandActionSchema.safeParse({
        sessionId: 'session-123',
      });
      expect(res.success).toBe(false);
    });
  });
});
