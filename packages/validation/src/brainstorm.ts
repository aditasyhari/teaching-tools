import { z } from 'zod';

export const createBrainstormSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
  prompt: z
    .string()
    .trim()
    .min(1, 'Topik atau pertanyaan papan ide wajib diisi')
    .max(300, 'Topik atau pertanyaan maksimal 300 karakter'),
  isAnonymous: z.boolean().optional().default(false),
  ideasVisibleToParticipants: z.boolean().optional().default(false),
  submissionMode: z
    .enum(['ONE_PER_PARTICIPANT', 'MULTIPLE_PER_PARTICIPANT'])
    .optional()
    .default('ONE_PER_PARTICIPANT'),
});

export const brainstormActionSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
});

export const submitBrainstormIdeaSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
  content: z.string().trim().min(1, 'Ide tidak boleh kosong').max(300, 'Ide maksimal 300 karakter'),
});

export const moderateBrainstormIdeaSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
  ideaId: z.string().min(1, 'ID ide wajib diisi'),
});
