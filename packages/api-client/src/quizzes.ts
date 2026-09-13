import type { ApiClient } from './client.js';
import type { Quiz, QuizSummary } from '@walikelas/types';
import type { CreateQuizInput, UpdateQuizInput } from '@walikelas/validation';
import { API_ROUTES } from '@walikelas/config';

export async function fetchTeacherQuizzes(client: ApiClient): Promise<QuizSummary[]> {
  return client.get<QuizSummary[]>(API_ROUTES.QUIZZES);
}

export async function fetchQuiz(client: ApiClient, id: string): Promise<Quiz> {
  return client.get<Quiz>(`${API_ROUTES.QUIZZES}/${id}`);
}

export async function createQuiz(client: ApiClient, input: CreateQuizInput): Promise<Quiz> {
  return client.post<Quiz>(API_ROUTES.QUIZZES, input);
}

export async function updateQuiz(
  client: ApiClient,
  id: string,
  input: UpdateQuizInput,
): Promise<Quiz> {
  return client.patch<Quiz>(`${API_ROUTES.QUIZZES}/${id}`, input);
}

export async function deleteQuiz(client: ApiClient, id: string): Promise<void> {
  await client.delete<{ id: string }>(`${API_ROUTES.QUIZZES}/${id}`);
}
