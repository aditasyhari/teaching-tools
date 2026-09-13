export type BrainstormActivityStatus = 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';

export type BrainstormIdeaStatus = 'VISIBLE' | 'HIDDEN';

export type BrainstormSubmissionMode = 'ONE_PER_PARTICIPANT' | 'MULTIPLE_PER_PARTICIPANT';

export interface BrainstormSettings {
  isAnonymous: boolean;
  ideasVisibleToParticipants: boolean;
  submissionMode: BrainstormSubmissionMode;
  maxIdeasPerParticipant: number;
}

export interface BrainstormActivity {
  id: string;
  sessionId: string;
  prompt: string;
  status: BrainstormActivityStatus;
  settings: BrainstormSettings;
  createdAt: number;
  openedAt?: number;
  pausedAt?: number;
  closedAt?: number;
}

export interface BrainstormIdea {
  id: string;
  sessionId: string;
  activityId: string;
  participantId: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  status: BrainstormIdeaStatus;
  createdAt: number;
  hiddenAt?: number;
}

export interface SharedBrainstormIdea {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  createdAt: number;
}

export interface ParticipantBrainstormIdea {
  id: string;
  content: string;
  status: BrainstormIdeaStatus;
  isAnonymous: boolean;
  createdAt: number;
}

export interface TeacherBrainstormSnapshot {
  activity: BrainstormActivity | null;
  ideas: BrainstormIdea[];
  visibleCount: number;
  hiddenCount: number;
  totalCount: number;
}

export interface ParticipantBrainstormSnapshot {
  activity: {
    id: string;
    prompt: string;
    status: BrainstormActivityStatus;
    settings: BrainstormSettings;
  } | null;
  myIdeas: ParticipantBrainstormIdea[];
  ideas: SharedBrainstormIdea[];
  canSubmit: boolean;
  totalIdeasCount: number;
}

// Client-to-server WebSocket payloads
export interface CreateBrainstormPayload {
  sessionId: string;
  prompt: string;
  isAnonymous?: boolean;
  ideasVisibleToParticipants?: boolean;
  submissionMode?: BrainstormSubmissionMode;
}

export interface OpenBrainstormPayload {
  sessionId: string;
}

export interface PauseBrainstormPayload {
  sessionId: string;
}

export interface CloseBrainstormPayload {
  sessionId: string;
}

export interface SubmitBrainstormIdeaPayload {
  sessionId: string;
  content: string;
}

export interface HideBrainstormIdeaPayload {
  sessionId: string;
  ideaId: string;
}

export interface RestoreBrainstormIdeaPayload {
  sessionId: string;
  ideaId: string;
}

// Server-to-client WebSocket event payloads
export interface BrainstormOpenedEvent {
  activityId: string;
  openedAt: number;
}

export interface BrainstormPausedEvent {
  activityId: string;
  pausedAt: number;
}

export interface BrainstormClosedEvent {
  activityId: string;
  closedAt: number;
}

export interface BrainstormIdeaCreatedEvent {
  idea: BrainstormIdea;
  visibleCount: number;
  totalCount: number;
}

export interface BrainstormIdeaSubmittedEvent {
  idea: ParticipantBrainstormIdea;
}

export interface BrainstormIdeaHiddenEvent {
  ideaId: string;
  totalCount: number;
}

export interface BrainstormIdeaRestoredEvent {
  idea: SharedBrainstormIdea;
  totalCount: number;
}

export interface BrainstormErrorEvent {
  code: string;
  message: string;
}
