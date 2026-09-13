import type { AuthMeResponse, UserRole } from '@walikelas/types';
import type { ApiClient } from './client.js';

export async function fetchCurrentUser(client: ApiClient): Promise<AuthMeResponse> {
  return client.get<AuthMeResponse>('/auth/me');
}

export async function logout(client: ApiClient): Promise<{ success: boolean }> {
  return client.post<{ success: boolean }>('/auth/logout');
}

export async function devLogin(
  client: ApiClient,
  payload?: { role?: UserRole; email?: string; name?: string },
): Promise<AuthMeResponse> {
  return client.post<AuthMeResponse>('/auth/dev-login', payload);
}
