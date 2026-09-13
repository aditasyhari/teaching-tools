import { z } from 'zod';

export const createClassroomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama kelas minimal 2 karakter')
    .max(100, 'Nama kelas maksimal 100 karakter'),
  subject: z.string().trim().max(100, 'Mata pelajaran maksimal 100 karakter').optional(),
  grade: z.string().trim().max(50, 'Tingkat kelas maksimal 50 karakter').optional(),
});

export type CreateClassroomInput = z.infer<typeof createClassroomSchema>;

export const updateClassroomSchema = createClassroomSchema.partial().extend({
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

export type UpdateClassroomInput = z.infer<typeof updateClassroomSchema>;

export const addClassroomMemberSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Nama siswa tidak boleh kosong')
    .max(100, 'Nama siswa maksimal 100 karakter'),
  studentIdentifier: z
    .string()
    .trim()
    .max(50, 'Nomor identitas/NIS maksimal 50 karakter')
    .optional(),
});

export type AddClassroomMemberInput = z.infer<typeof addClassroomMemberSchema>;

export const updateTeacherProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Nama tampilan minimal 2 karakter').max(100).optional(),
  schoolName: z.string().trim().max(100).optional(),
  preferences: z.record(z.any()).optional(),
});

export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;
