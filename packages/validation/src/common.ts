import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'ID tidak boleh kosong'),
});

export type IdParamInput = z.infer<typeof idParamSchema>;
