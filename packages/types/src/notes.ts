export interface TeacherNote {
  id: string;
  teacherId: string;
  classroomId: string | null;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherNoteFilter {
  classroomId?: string;
  search?: string;
  pinned?: boolean;
}
