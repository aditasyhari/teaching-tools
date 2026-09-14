export type SessionStatus = 'WAITING' | 'ACTIVE' | 'ENDED';

export interface TeachingSession {
  id: string;
  teacherId: string;
  classroomId?: string | null;
  title: string;
  joinCode: string;
  status: SessionStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  classroom?: {
    id: string;
    name: string;
  } | null;
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  displayName: string;
  joinedAt: string;
  lastSeenAt: string;
  isOnline: boolean;
  reconnectToken?: string;
}

export interface SessionSnapshot {
  id: string;
  title: string;
  joinCode: string;
  status: SessionStatus;
  teacherId: string;
  classroomId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  participantCount: number;
  participants: Array<{
    id: string;
    displayName: string;
    joinedAt: string;
    isOnline: boolean;
  }>;
  serverTime: string;
}

export interface ParticipantSessionSnapshot {
  id: string;
  title: string;
  status: SessionStatus;
  participantCount: number;
  currentParticipant: {
    id: string;
    displayName: string;
    reconnectToken?: string;
  };
  serverTime: string;
}

// Client to Server Events
export interface SessionJoinPayload {
  joinCode: string;
  displayName?: string;
  participantId?: string;
  reconnectToken?: string;
}

export interface SessionLeavePayload {
  sessionId: string;
  participantId?: string;
}

export interface SessionStartPayload {
  sessionId: string;
}

export interface SessionEndPayload {
  sessionId: string;
}

export interface SessionHeartbeatPayload {
  sessionId: string;
  participantId?: string;
}

// Server to Client Events
export interface SessionParticipantJoinedPayload {
  participant: {
    id: string;
    displayName: string;
  };
  count: number;
}

export interface SessionParticipantLeftPayload {
  participantId: string;
  displayName: string;
  count: number;
}

export interface SessionStartedPayload {
  startedAt: string;
}

export interface SessionEndedPayload {
  endedAt: string;
}

export interface SessionErrorPayload {
  code: string;
  message: string;
}
