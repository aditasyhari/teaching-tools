import { describe, it, expect } from 'vitest';
import {
  setClassroomTimerSchema,
  startClassroomTimerSchema,
  resetClassroomTimerSchema,
  timerActionSchema,
} from '../classroom-timer';

describe('Classroom Timer Validation Schemas', () => {
  describe('setClassroomTimerSchema', () => {
    it('accepts valid duration and options', () => {
      const validData = {
        sessionId: 'sess-123',
        duration: 300,
        label: 'Diskusi Kelompok',
        visibility: 'SHARED_TIMER',
      };

      const result = setClassroomTimerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.duration).toBe(300);
        expect(result.data.label).toBe('Diskusi Kelompok');
        expect(result.data.visibility).toBe('SHARED_TIMER');
      }
    });

    it('defaults visibility to SHARED_TIMER if omitted', () => {
      const result = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 60,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visibility).toBe('SHARED_TIMER');
      }
    });

    it('accepts boundary durations (5s and 3600s)', () => {
      const minResult = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 5,
      });
      expect(minResult.success).toBe(true);

      const maxResult = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 3600,
      });
      expect(maxResult.success).toBe(true);
    });

    it('rejects duration < 5 seconds', () => {
      const result = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 4,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('Durasi minimal 5 detik');
      }
    });

    it('rejects duration > 3600 seconds', () => {
      const result = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 3601,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('Durasi maksimal 60 menit');
      }
    });

    it('rejects zero or negative durations', () => {
      const zeroResult = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 0,
      });
      expect(zeroResult.success).toBe(false);

      const negResult = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: -10,
      });
      expect(negResult.success).toBe(false);
    });

    it('rejects non-integer durations', () => {
      const result = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 30.5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('bilangan bulat');
      }
    });

    it('rejects labels longer than 100 characters', () => {
      const result = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 60,
        label: 'a'.repeat(101),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('Label maksimal 100 karakter');
      }
    });

    it('accepts PRIVATE_TIMER visibility', () => {
      const result = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 120,
        visibility: 'PRIVATE_TIMER',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visibility).toBe('PRIVATE_TIMER');
      }
    });

    it('rejects invalid visibility', () => {
      const result = setClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 120,
        visibility: 'SECRET_TIMER' as any,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('startClassroomTimerSchema', () => {
    it('accepts start with optional duration and label override', () => {
      const result = startClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 180,
        label: 'Presentasi',
      });

      expect(result.success).toBe(true);
    });

    it('accepts start without duration and label', () => {
      const result = startClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
      });

      expect(result.success).toBe(true);
    });

    it('rejects invalid duration in start schema', () => {
      const result = startClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        duration: 2,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('resetClassroomTimerSchema', () => {
    it('accepts reset without new duration', () => {
      const result = resetClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
      });

      expect(result.success).toBe(true);
    });

    it('accepts reset with valid new duration', () => {
      const result = resetClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        newDuration: 600,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.newDuration).toBe(600);
      }
    });

    it('rejects invalid new duration in reset schema', () => {
      const result = resetClassroomTimerSchema.safeParse({
        sessionId: 'sess-123',
        newDuration: 4000,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('timerActionSchema', () => {
    it('validates sessionId', () => {
      expect(timerActionSchema.safeParse({ sessionId: 'sess-1' }).success).toBe(true);
      expect(timerActionSchema.safeParse({ sessionId: '' }).success).toBe(false);
      expect(timerActionSchema.safeParse({}).success).toBe(false);
    });
  });
});

