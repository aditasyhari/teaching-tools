export type UserRole = 'TEACHER' | 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
}
