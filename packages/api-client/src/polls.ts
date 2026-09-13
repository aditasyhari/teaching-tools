import type { ApiClient } from './client.js';
import type { Poll, PollSummary } from '@walikelas/types';
import type { CreatePollInput, UpdatePollInput } from '@walikelas/validation';
import { API_ROUTES } from '@walikelas/config';

export async function fetchTeacherPolls(client: ApiClient): Promise<PollSummary[]> {
  return client.get<PollSummary[]>(API_ROUTES.POLLS);
}

export async function fetchPoll(client: ApiClient, id: string): Promise<Poll> {
  return client.get<Poll>(`${API_ROUTES.POLLS}/${id}`);
}

export async function createPoll(client: ApiClient, input: CreatePollInput): Promise<Poll> {
  return client.post<Poll>(API_ROUTES.POLLS, input);
}

export async function updatePoll(
  client: ApiClient,
  id: string,
  input: UpdatePollInput,
): Promise<Poll> {
  return client.patch<Poll>(`${API_ROUTES.POLLS}/${id}`, input);
}

export async function deletePoll(client: ApiClient, id: string): Promise<void> {
  await client.delete<{ id: string }>(`${API_ROUTES.POLLS}/${id}`);
}
