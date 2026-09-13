export type ClassroomTimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export type ClassroomTimerVisibility = 'SHARED_TIMER' | 'PRIVATE_TIMER';

export interface ClassroomTimerState {
  sessionId: string;
  status: ClassroomTimerStatus;
  duration: number; // Total configured duration in seconds (5 - 3600)
  remainingSeconds: number; // Current authoritative remaining seconds
  label?: string; // Optional label (e.g. "Diskusi Kelompok")
  visibility: ClassroomTimerVisibility;
  startedAt?: number; // Timestamp ms when timer started/resumed
  pausedAt?: number; // Timestamp ms when timer was paused
  endsAt?: number; // Authoritative target completion timestamp ms
  serverTime: number; // Timestamp ms from server for drift reconciliation
}

export interface TeacherClassroomTimerSnapshot {
  timer: ClassroomTimerState | null;
  serverTime: number;
}

export interface ParticipantClassroomTimerSnapshot {
  timer: ClassroomTimerState | null;
  serverTime: number;
}

// Client-to-server payloads
export interface SetClassroomTimerPayload {
  sessionId: string;
  duration: number;
  label?: string;
  visibility?: ClassroomTimerVisibility;
}

export interface StartClassroomTimerPayload {
  sessionId: string;
  duration?: number;
  label?: string;
  visibility?: ClassroomTimerVisibility;
}

export interface PauseClassroomTimerPayload {
  sessionId: string;
}

export interface ResumeClassroomTimerPayload {
  sessionId: string;
}

export interface ResetClassroomTimerPayload {
  sessionId: string;
  newDuration?: number;
}

// Server-to-client events
export interface ClassroomTimerErrorEvent {
  code: string;
  message: string;
}

