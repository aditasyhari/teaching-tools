import { z } from 'zod';

export const setClassroomTimerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID wajib diisi'),
  duration: z
    .number({ invalid_type_error: 'Durasi harus berupa angka' })
    .int('Durasi harus berupa bilangan bulat')
    .min(5, 'Durasi minimal 5 detik')
    .max(3600, 'Durasi maksimal 60 menit (3600 detik)'),
  label: z
    .string()
    .trim()
    .max(100, 'Label maksimal 100 karakter')
    .optional(),
  visibility: z.enum(['SHARED_TIMER', 'PRIVATE_TIMER']).default('SHARED_TIMER'),
});

export const startClassroomTimerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID wajib diisi'),
  duration: z
    .number({ invalid_type_error: 'Durasi harus berupa angka' })
    .int('Durasi harus berupa bilangan bulat')
    .min(5, 'Durasi minimal 5 detik')
    .max(3600, 'Durasi maksimal 60 menit (3600 detik)')
    .optional(),
  label: z
    .string()
    .trim()
    .max(100, 'Label maksimal 100 karakter')
    .optional(),
  visibility: z.enum(['SHARED_TIMER', 'PRIVATE_TIMER']).optional(),
});

export const timerActionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID wajib diisi'),
});

export const resetClassroomTimerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID wajib diisi'),
  newDuration: z
    .number({ invalid_type_error: 'Durasi harus berupa angka' })
    .int('Durasi harus berupa bilangan bulat')
    .min(5, 'Durasi minimal 5 detik')
    .max(3600, 'Durasi maksimal 60 menit (3600 detik)')
    .optional(),
});

export type SetClassroomTimerInput = z.infer<typeof setClassroomTimerSchema>;
export type StartClassroomTimerInput = z.infer<typeof startClassroomTimerSchema>;
export type TimerActionInput = z.infer<typeof timerActionSchema>;
export type ResetClassroomTimerInput = z.infer<typeof resetClassroomTimerSchema>;

