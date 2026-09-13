import type { ApiClient } from './client.js';
import type { TeacherNote, TeacherNoteFilter } from '@walikelas/types';
import type { CreateNoteInput, UpdateNoteInput } from '@walikelas/validation';
import { API_ROUTES } from '@walikelas/config';

export async function fetchNotes(
  client: ApiClient,
  filter?: TeacherNoteFilter,
): Promise<TeacherNote[]> {
  const params = new URLSearchParams();
  if (filter?.classroomId) params.append('classroomId', filter.classroomId);
  if (filter?.search) params.append('search', filter.search);
  if (filter?.pinned !== undefined) params.append('pinned', String(filter.pinned));

  const qs = params.toString();
  const endpoint = qs ? `${API_ROUTES.NOTES}?${qs}` : API_ROUTES.NOTES;
  return client.get<TeacherNote[]>(endpoint);
}

export async function fetchNote(client: ApiClient, id: string): Promise<TeacherNote> {
  return client.get<TeacherNote>(`${API_ROUTES.NOTES}/${id}`);
}

export async function createNote(client: ApiClient, input: CreateNoteInput): Promise<TeacherNote> {
  return client.post<TeacherNote>(API_ROUTES.NOTES, input);
}

export async function updateNote(
  client: ApiClient,
  id: string,
  input: UpdateNoteInput,
): Promise<TeacherNote> {
  return client.patch<TeacherNote>(`${API_ROUTES.NOTES}/${id}`, input);
}

export async function deleteNote(client: ApiClient, id: string): Promise<void> {
  await client.delete<{ id: string }>(`${API_ROUTES.NOTES}/${id}`);
}
