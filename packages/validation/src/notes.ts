import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul catatan tidak boleh kosong')
    .max(150, 'Judul catatan maksimal 150 karakter'),
  content: z.string().trim().max(10000, 'Isi catatan maksimal 10.000 karakter').default(''),
  classroomId: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().max(30)).max(10).optional().default([]),
  pinned: z.boolean().optional().default(false),
});

export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type CreateNoteOutput = z.output<typeof createNoteSchema>;

export const updateNoteSchema = createNoteSchema.partial();

export type UpdateNoteInput = z.input<typeof updateNoteSchema>;
export type UpdateNoteOutput = z.output<typeof updateNoteSchema>;

export const noteQuerySchema = z.object({
  classroomId: z.string().trim().optional(),
  search: z.string().trim().optional(),
  pinned: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'string' ? val === 'true' : val))
    .optional(),
});

export type NoteQueryInput = z.input<typeof noteQuerySchema>;
export type NoteQueryOutput = z.output<typeof noteQuerySchema>;
