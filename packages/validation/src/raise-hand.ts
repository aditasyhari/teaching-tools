import { z } from 'zod';

export const raiseHandActionSchema = z.object({
  sessionId: z.string().trim().min(1, 'ID sesi wajib diisi'),
});

export type RaiseHandActionInput = z.infer<typeof raiseHandActionSchema>;

export const moderateHandActionSchema = z.object({
  sessionId: z.string().trim().min(1, 'ID sesi wajib diisi'),
  handId: z.string().trim().min(1, 'ID angkat tangan wajib diisi'),
});

export type ModerateHandActionInput = z.infer<typeof moderateHandActionSchema>;
