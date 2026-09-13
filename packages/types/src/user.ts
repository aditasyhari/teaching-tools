export type UserRole = 'TEACHER' | 'STUDENT' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  googleId?: string | null;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  displayName: string;
  schoolName?: string | null;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Classroom {
  id: string;
  teacherId: string;
  name: string;
  subject?: string | null;
  grade?: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  members?: ClassroomMember[];
}

export interface ClassroomMember {
  id: string;
  classroomId: string;
  displayName: string;
  studentIdentifier?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthMeResponse {
  user: User;
  profile: TeacherProfile | null;
  classrooms: Classroom[];
}
