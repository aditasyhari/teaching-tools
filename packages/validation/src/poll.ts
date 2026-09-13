import { z } from 'zod';

export const pollOptionSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().min(0).optional(),
  optionText: z
    .string()
    .trim()
    .min(1, 'Teks opsi tidak boleh kosong')
    .max(200, 'Teks opsi maksimal 200 karakter'),
});

export type PollOptionInput = z.infer<typeof pollOptionSchema>;

export const pollSettingsSchema = z.object({
  allowMultiple: z.boolean().default(false),
  showResultsToParticipants: z.boolean().default(true),
  isAnonymous: z.boolean().default(true),
});

export type PollSettingsInput = z.infer<typeof pollSettingsSchema>;

export const createPollSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul polling tidak boleh kosong')
    .max(100, 'Judul polling maksimal 100 karakter'),
  question: z
    .string()
    .trim()
    .min(1, 'Pertanyaan polling tidak boleh kosong')
    .max(500, 'Pertanyaan polling maksimal 500 karakter'),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']).default('SINGLE_CHOICE'),
  settings: pollSettingsSchema.default({
    allowMultiple: false,
    showResultsToParticipants: true,
    isAnonymous: true,
  }),
  options: z
    .array(pollOptionSchema)
    .min(2, 'Polling harus memiliki minimal 2 opsi jawaban')
    .max(8, 'Polling maksimal memiliki 8 opsi jawaban'),
});

export type CreatePollInput = z.input<typeof createPollSchema>;
export type CreatePollOutput = z.output<typeof createPollSchema>;

export const updatePollSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul polling tidak boleh kosong')
    .max(100, 'Judul polling maksimal 100 karakter')
    .optional(),
  question: z
    .string()
    .trim()
    .min(1, 'Pertanyaan polling tidak boleh kosong')
    .max(500, 'Pertanyaan polling maksimal 500 karakter')
    .optional(),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']).optional(),
  settings: pollSettingsSchema.optional(),
  options: z
    .array(pollOptionSchema)
    .min(2, 'Polling harus memiliki minimal 2 opsi jawaban')
    .max(8, 'Polling maksimal memiliki 8 opsi jawaban')
    .optional(),
});

export type UpdatePollInput = z.input<typeof updatePollSchema>;
export type UpdatePollOutput = z.output<typeof updatePollSchema>;

export const pollResponseSubmissionSchema = z
  .object({
    sessionId: z.string().min(1, 'ID sesi wajib diisi'),
    pollId: z.string().min(1, 'ID polling wajib diisi'),
    optionId: z.string().optional(),
    optionIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (data) => {
      const hasSingle = typeof data.optionId === 'string' && data.optionId.length > 0;
      const hasMultiple = Array.isArray(data.optionIds) && data.optionIds.length > 0;
      return hasSingle || hasMultiple;
    },
    {
      message: 'Minimal satu opsi jawaban harus dipilih',
      path: ['optionId'],
    },
  );

export type PollResponseSubmissionInput = z.infer<typeof pollResponseSubmissionSchema>;
