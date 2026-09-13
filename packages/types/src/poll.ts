export type PollType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';

export type PollStatus = 'DRAFT' | 'PUBLISHED';

export interface PollSettings {
  allowMultiple?: boolean;
  showResultsToParticipants?: boolean;
  isAnonymous?: boolean;
}

export interface PollOption {
  id: string;
  pollId?: string;
  order: number;
  optionText: string;
}

export interface Poll {
  id: string;
  teacherId: string;
  title: string;
  question: string;
  type: PollType;
  settings: PollSettings;
  status: PollStatus;
  options: PollOption[];
  createdAt: string;
  updatedAt: string;
}

export interface PollSummary {
  id: string;
  teacherId: string;
  title: string;
  question: string;
  type: PollType;
  status: PollStatus;
  optionCount: number;
  createdAt: string;
  updatedAt: string;
}

export type LivePollRuntimeStatus = 'PREPARING' | 'LIVE' | 'CLOSED';

export interface TeacherLivePollSnapshot {
  pollId: string;
  title: string;
  question: string;
  type: PollType;
  status: LivePollRuntimeStatus;
  options: PollOption[];
  responseCount: number;
  totalParticipants: number;
  responseRate: number;
  distribution: Record<string, number>;
  percentages: Record<string, number>;
  settings: PollSettings;
}

export interface ParticipantLivePollSnapshot {
  pollId: string;
  title: string;
  question: string;
  type: PollType;
  status: LivePollRuntimeStatus;
  options: PollOption[];
  hasResponded: boolean;
  selectedOptionIds: string[];
  distribution?: Record<string, number>;
  percentages?: Record<string, number>;
  settings: PollSettings;
}

// Client-to-server WebSocket payloads
export interface PollStartPayload {
  sessionId: string;
  pollId: string;
}

export interface PollRespondPayload {
  sessionId: string;
  pollId: string;
  optionId?: string;
  optionIds?: string[];
}

export interface PollClosePayload {
  sessionId: string;
}

// Server-to-client WebSocket event payloads
export interface PollStartedEvent {
  pollId: string;
  title: string;
  question: string;
  type: PollType;
  options: PollOption[];
  settings: PollSettings;
}

export interface PollResponseAcceptedEvent {
  pollId: string;
  selectedOptionIds: string[];
}

export interface PollStatsUpdateEvent {
  responseCount: number;
  totalParticipants: number;
  responseRate: number;
  distribution?: Record<string, number>;
  percentages?: Record<string, number>;
}

export interface PollClosedEvent {
  pollId: string;
  distribution: Record<string, number>;
  percentages: Record<string, number>;
  totalResponses: number;
}

export interface PollErrorEvent {
  code: string;
  message: string;
}
