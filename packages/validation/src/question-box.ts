import { z } from 'zod';

export const submitQuestionSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
  content: z
    .string()
    .trim()
    .min(1, 'Pertanyaan tidak boleh kosong')
    .max(500, 'Pertanyaan maksimal 500 karakter'),
  isAnonymous: z.boolean().default(false),
});

export type SubmitQuestionInput = z.infer<typeof submitQuestionSchema>;

export const moderateQuestionSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
  questionId: z.string().min(1, 'ID pertanyaan wajib diisi'),
});

export type ModerateQuestionInput = z.infer<typeof moderateQuestionSchema>;
