import type { ApiClient } from './client.js';
import type { TeachingSession, SessionSnapshot, SessionParticipant } from '@walikelas/types';
import type { CreateSessionInput } from '@walikelas/validation';
import { API_ROUTES } from '@walikelas/config';

export async function fetchTeacherSessions(client: ApiClient): Promise<TeachingSession[]> {
  return client.get<TeachingSession[]>(API_ROUTES.SESSIONS);
}

export async function fetchSession(client: ApiClient, id: string): Promise<SessionSnapshot> {
  return client.get<SessionSnapshot>(`${API_ROUTES.SESSIONS}/${id}`);
}

export async function createSession(
  client: ApiClient,
  input: CreateSessionInput,
): Promise<TeachingSession> {
  return client.post<TeachingSession>(API_ROUTES.SESSIONS, input);
}

export async function startSession(client: ApiClient, id: string): Promise<TeachingSession> {
  return client.post<TeachingSession>(`${API_ROUTES.SESSIONS}/${id}/start`);
}

export async function endSession(client: ApiClient, id: string): Promise<TeachingSession> {
  return client.post<TeachingSession>(`${API_ROUTES.SESSIONS}/${id}/end`);
}

export async function fetchSessionParticipants(
  client: ApiClient,
  id: string,
): Promise<SessionParticipant[]> {
  return client.get<SessionParticipant[]>(`${API_ROUTES.SESSIONS}/${id}/participants`);
}

export async function verifyJoinCode(
  client: ApiClient,
  code: string,
): Promise<{
  id: string;
  title: string;
  joinCode: string;
  status: string;
}> {
  return client.post<{
    id: string;
    title: string;
    joinCode: string;
    status: string;
  }>(`${API_ROUTES.SESSIONS}/verify-code`, { code });
}
