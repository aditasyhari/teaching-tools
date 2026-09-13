import { z } from 'zod';

export const exitTicketQuestionTypeSchema = z.enum(['SCALE', 'SHORT_TEXT', 'MULTIPLE_CHOICE']);

export const exitTicketScaleConfigSchema = z.object({
  min: z.number().int().min(1).max(5).default(1),
  max: z.number().int().min(1).max(5).default(5),
  minLabel: z.string().max(50).trim().optional(),
  maxLabel: z.string().max(50).trim().optional(),
});

export const exitTicketOptionSchema = z.object({
  id: z.string().min(1).max(50).trim(),
  text: z
    .string()
    .min(1, 'Teks opsi tidak boleh kosong')
    .max(100, 'Teks opsi maksimal 100 karakter')
    .trim(),
});

export const exitTicketQuestionInputSchema = z
  .object({
    type: exitTicketQuestionTypeSchema,
    prompt: z
      .string()
      .trim()
      .min(1, 'Pertanyaan tidak boleh kosong')
      .max(300, 'Pertanyaan maksimal 300 karakter'),
    required: z.boolean().default(true),
    scale: exitTicketScaleConfigSchema.optional(),
    options: z.array(exitTicketOptionSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'MULTIPLE_CHOICE') {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Pilihan ganda minimal memiliki 2 opsi',
          path: ['options'],
        });
      } else if (data.options.length > 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Pilihan ganda maksimal memiliki 6 opsi',
          path: ['options'],
        });
      }
    }
  });

export const createExitTicketSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi diperlukan').trim(),
  title: z.string().max(100, 'Judul maksimal 100 karakter').trim().optional(),
  isAnonymous: z.boolean().default(true),
  questions: z
    .array(exitTicketQuestionInputSchema)
    .min(1, 'Exit ticket minimal memiliki 1 pertanyaan')
    .max(3, 'Exit ticket maksimal memiliki 3 pertanyaan'),
});

export const exitTicketActionSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi diperlukan').trim(),
});

export const exitTicketAnswerSchema = z.object({
  questionId: z.string().min(1, 'ID pertanyaan diperlukan').trim(),
  value: z.union([z.number(), z.string()]),
});

export const submitExitTicketSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi diperlukan').trim(),
  answers: z.array(exitTicketAnswerSchema).min(1, 'Jawaban tidak boleh kosong'),
});

export type CreateExitTicketInput = z.infer<typeof createExitTicketSchema>;
export type ExitTicketActionInput = z.infer<typeof exitTicketActionSchema>;
export type SubmitExitTicketInput = z.infer<typeof submitExitTicketSchema>;
