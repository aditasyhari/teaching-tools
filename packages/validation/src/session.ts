import { z } from 'zod';
import { JOIN_CODE_LENGTH, MAX_PARTICIPANT_NAME_LENGTH } from '@walikelas/config';

// Join code: uppercase alphanumeric, exactly JOIN_CODE_LENGTH characters
export const joinCodeSchema = z
  .string()
  .trim()
  .transform((val) => val.toUpperCase())
  .pipe(
    z
      .string()
      .length(JOIN_CODE_LENGTH, `Kode sesi harus berukuran ${JOIN_CODE_LENGTH} karakter`)
      .regex(/^[A-Z0-9]+$/, 'Kode sesi hanya boleh berisi huruf dan angka'),
  );

export const RESERVED_DISPLAY_NAMES = [
  'guru',
  'admin',
  'administrator',
  'operator',
  'system',
  'sistem',
  'walikelas',
  'wali kelas',
  'host',
  'moderator',
] as const;

const RESERVED_NAME_REGEX =
  /\b(guru|admin|administrator|operator|system|sistem|walikelas|wali\s+kelas|host|moderator)\b/i;

export const isReservedDisplayName = (name: string): boolean => {
  return RESERVED_NAME_REGEX.test(name.trim());
};

export const joinSessionSchema = z.object({
  code: joinCodeSchema,
  displayName: z
    .string()
    .trim()
    .min(1, 'Nama tampilan tidak boleh kosong')
    .max(
      MAX_PARTICIPANT_NAME_LENGTH,
      `Nama tampilan maksimal ${MAX_PARTICIPANT_NAME_LENGTH} karakter`,
    )
    .refine(
      (name) => !isReservedDisplayName(name),
      'Nama tersebut dicadangkan untuk peran guru atau sistem',
    ),
  participantId: z.string().optional(),
  reconnectToken: z.string().optional(),
  isProjector: z.boolean().optional(),
});

export type JoinSessionInput = z.infer<typeof joinSessionSchema>;

export const createSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul sesi tidak boleh kosong')
    .max(100, 'Judul sesi maksimal 100 karakter'),
  classroomId: z.string().optional().nullable(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const sessionActionSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
});

export type SessionActionInput = z.infer<typeof sessionActionSchema>;

export const sessionHeartbeatSchema = z.object({
  sessionId: z.string().min(1, 'ID sesi wajib diisi'),
  participantId: z.string().optional(),
});

export type SessionHeartbeatInput = z.infer<typeof sessionHeartbeatSchema>;
