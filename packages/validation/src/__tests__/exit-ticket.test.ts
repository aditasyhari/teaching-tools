import { describe, it, expect } from 'vitest';
import {
  createExitTicketSchema,
  exitTicketActionSchema,
  submitExitTicketSchema,
} from '../exit-ticket';

describe('Exit Ticket Validation Schemas', () => {
  describe('createExitTicketSchema', () => {
    it('accepts valid 1-question Exit Ticket', () => {
      const result = createExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        title: 'Refleksi Akhir Kelas',
        isAnonymous: true,
        questions: [
          {
            type: 'SCALE',
            prompt: 'Seberapa paham kamu dengan materi hari ini?',
            required: true,
            scale: { min: 1, max: 5, minLabel: 'Belum paham', maxLabel: 'Sangat paham' },
          },
        ],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Refleksi Akhir Kelas');
        expect(result.data.isAnonymous).toBe(true);
        expect(result.data.questions).toHaveLength(1);
      }
    });

    it('accepts valid 3-question combination Exit Ticket', () => {
      const result = createExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        title: 'Evaluasi Pembelajaran',
        isAnonymous: false,
        questions: [
          {
            type: 'SCALE',
            prompt: 'Tingkat pemahaman?',
            required: true,
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Bagian favorit kamu?',
            required: true,
            options: [
              { id: 'opt-1', text: 'Diskusi' },
              { id: 'opt-2', text: 'Latihan Soal' },
              { id: 'opt-3', text: 'Game Edukasi' },
            ],
          },
          {
            type: 'SHORT_TEXT',
            prompt: 'Hal yang masih membingungkan?',
            required: false,
          },
        ],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.questions).toHaveLength(3);
      }
    });

    it('rejects Exit Ticket with 0 questions', () => {
      const result = createExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        questions: [],
      });

      expect(result.success).toBe(false);
    });

    it('rejects Exit Ticket with more than 3 questions', () => {
      const result = createExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        questions: [
          { type: 'SCALE', prompt: 'Q1' },
          { type: 'SCALE', prompt: 'Q2' },
          { type: 'SCALE', prompt: 'Q3' },
          { type: 'SCALE', prompt: 'Q4' },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('rejects empty or whitespace question prompt', () => {
      const result = createExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        questions: [
          {
            type: 'SHORT_TEXT',
            prompt: '   ',
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('rejects multiple choice with less than 2 options', () => {
      const result = createExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Pilihan favorit?',
            options: [{ id: 'opt-1', text: 'Hanya satu' }],
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('rejects multiple choice with more than 6 options', () => {
      const result = createExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Pilihan favorit?',
            options: [
              { id: '1', text: 'A' },
              { id: '2', text: 'B' },
              { id: '3', text: 'C' },
              { id: '4', text: 'D' },
              { id: '5', text: 'E' },
              { id: '6', text: 'F' },
              { id: '7', text: 'G' },
            ],
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('rejects question prompt longer than 300 characters', () => {
      const result = createExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        questions: [
          {
            type: 'SCALE',
            prompt: 'A'.repeat(301),
          },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('exitTicketActionSchema', () => {
    it('accepts valid sessionId', () => {
      const result = exitTicketActionSchema.safeParse({ sessionId: 'sess-123' });
      expect(result.success).toBe(true);
    });

    it('rejects missing or empty sessionId', () => {
      const result = exitTicketActionSchema.safeParse({ sessionId: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('submitExitTicketSchema', () => {
    it('accepts valid answers list', () => {
      const result = submitExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        answers: [
          { questionId: 'q-1', value: 4 },
          { questionId: 'q-2', value: 'opt-2' },
          { questionId: 'q-3', value: 'Pecahan campuran masih agak bingung' },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('rejects empty answers list', () => {
      const result = submitExitTicketSchema.safeParse({
        sessionId: 'sess-123',
        answers: [],
      });

      expect(result.success).toBe(false);
    });
  });
});
