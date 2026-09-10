export type SessionStatus = 'IDLE' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface Participant {
  id: string;
  sessionId: string;
  displayName: string;
  joinedAt: string;
  isOnline: boolean;
  lastSeenAt: string;
}

export interface SessionMetadata {
  id: string;
  code: string;
  title: string;
  teacherId: string;
  status: SessionStatus;
  currentActivityId?: string | null;
  participantCount: number;
  createdAt: string;
  endedAt?: string | null;
}
