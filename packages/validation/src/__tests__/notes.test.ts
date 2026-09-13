import { describe, it, expect } from 'vitest';
import { createNoteSchema, updateNoteSchema, noteQuerySchema } from '../notes.js';

describe('Note Validation Schemas', () => {
  describe('createNoteSchema', () => {
    it('validates a valid note successfully', () => {
      const valid = {
        title: 'Catatan Rencana Pembelajaran IPA',
        content: 'Fokus pada praktikum kalor.',
        classroomId: 'c-123',
        tags: ['ipa', 'fisika'],
        pinned: true,
      };

      const result = createNoteSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Catatan Rencana Pembelajaran IPA');
        expect(result.data.pinned).toBe(true);
      }
    });

    it('rejects an empty title', () => {
      const invalid = {
        title: '   ',
        content: 'Some content',
      };

      const result = createNoteSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('allows empty content with default', () => {
      const valid = {
        title: 'Judul Tanpa Isi',
      };

      const result = createNoteSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('');
        expect(result.data.pinned).toBe(false);
        expect(result.data.tags).toEqual([]);
      }
    });
  });

  describe('updateNoteSchema', () => {
    it('allows partial updates like just pinning', () => {
      const result = updateNoteSchema.safeParse({ pinned: true });
      expect(result.success).toBe(true);
    });
  });

  describe('noteQuerySchema', () => {
    it('parses string pinned boolean', () => {
      const result = noteQuerySchema.safeParse({ pinned: 'true' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pinned).toBe(true);
      }
    });
  });
});
