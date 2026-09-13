import type { Classroom, ClassroomMember } from '@walikelas/types';
import type {
  CreateClassroomInput,
  UpdateClassroomInput,
  AddClassroomMemberInput,
} from '@walikelas/validation';
import type { ApiClient } from './client.js';

export async function fetchClassrooms(client: ApiClient): Promise<Classroom[]> {
  return client.get<Classroom[]>('/classrooms');
}

export async function createClassroom(
  client: ApiClient,
  data: CreateClassroomInput,
): Promise<Classroom> {
  return client.post<Classroom>('/classrooms', data);
}

export async function fetchClassroom(client: ApiClient, id: string): Promise<Classroom> {
  return client.get<Classroom>(`/classrooms/${id}`);
}

export async function updateClassroom(
  client: ApiClient,
  id: string,
  data: UpdateClassroomInput,
): Promise<Classroom> {
  return client.patch<Classroom>(`/classrooms/${id}`, data);
}

export async function deleteClassroom(
  client: ApiClient,
  id: string,
): Promise<{ success: boolean }> {
  return client.delete<{ success: boolean }>(`/classrooms/${id}`);
}

export async function addClassroomMember(
  client: ApiClient,
  classroomId: string,
  data: AddClassroomMemberInput,
): Promise<ClassroomMember> {
  return client.post<ClassroomMember>(`/classrooms/${classroomId}/members`, data);
}

export async function removeClassroomMember(
  client: ApiClient,
  classroomId: string,
  memberId: string,
): Promise<{ success: boolean }> {
  return client.delete<{ success: boolean }>(`/classrooms/${classroomId}/members/${memberId}`);
}
