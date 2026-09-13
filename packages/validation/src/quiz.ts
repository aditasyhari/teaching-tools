import { z } from 'zod';

export const quizOptionSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .trim()
    .min(1, 'Teks opsi tidak boleh kosong')
    .max(200, 'Teks opsi maksimal 200 karakter'),
  isCorrect: z.boolean(),
});

export type QuizOptionInput = z.infer<typeof quizOptionSchema>;

export const quizQuestionSchema = z
  .object({
    id: z.string().optional(),
    text: z
      .string()
      .trim()
      .min(1, 'Teks pertanyaan tidak boleh kosong')
      .max(500, 'Teks pertanyaan maksimal 500 karakter'),
    points: z.number().int().min(10).max(1000).default(100),
    timeLimitSeconds: z.number().int().min(5).max(300).nullable().optional(),
    options: z
      .array(quizOptionSchema)
      .min(2, 'Setiap pertanyaan harus memiliki minimal 2 opsi jawaban')
      .max(6, 'Setiap pertanyaan maksimal memiliki 6 opsi jawaban'),
  })
  .refine(
    (data) => {
      const correctCount = data.options.filter((o) => o.isCorrect).length;
      return correctCount === 1;
    },
    {
      message: 'Setiap pertanyaan harus memiliki tepat satu (1) jawaban yang benar',
      path: ['options'],
    },
  );

export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;

export const quizSettingsSchema = z.object({
  timeLimitSeconds: z.number().int().min(5).max(300).default(30),
  showLeaderboard: z.boolean().default(true),
  showCorrectAnswer: z.boolean().default(true),
});

export type QuizSettingsInput = z.infer<typeof quizSettingsSchema>;

export const createQuizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul kuis tidak boleh kosong')
    .max(100, 'Judul kuis maksimal 100 karakter'),
  description: z.string().trim().max(500, 'Deskripsi maksimal 500 karakter').nullable().optional(),
  settings: quizSettingsSchema.default({
    timeLimitSeconds: 30,
    showLeaderboard: true,
    showCorrectAnswer: true,
  }),
  questions: z.array(quizQuestionSchema).min(1, 'Kuis harus memiliki minimal 1 pertanyaan'),
});

export type CreateQuizInput = z.input<typeof createQuizSchema>;
export type CreateQuizOutput = z.output<typeof createQuizSchema>;

export const updateQuizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul kuis tidak boleh kosong')
    .max(100, 'Judul kuis maksimal 100 karakter')
    .optional(),
  description: z.string().trim().max(500, 'Deskripsi maksimal 500 karakter').nullable().optional(),
  settings: quizSettingsSchema.optional(),
  questions: z
    .array(quizQuestionSchema)
    .min(1, 'Kuis harus memiliki minimal 1 pertanyaan')
    .optional(),
});

export type UpdateQuizInput = z.input<typeof updateQuizSchema>;
export type UpdateQuizOutput = z.output<typeof updateQuizSchema>;

export const quizAnswerSubmissionSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
  questionId: z.string().min(1, 'ID pertanyaan wajib diisi'),
  optionId: z.string().min(1, 'ID opsi jawaban wajib diisi'),
});

export type QuizAnswerSubmissionInput = z.infer<typeof quizAnswerSubmissionSchema>;
