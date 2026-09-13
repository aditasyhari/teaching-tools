export type ExitTicketStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export type ExitTicketQuestionType = 'SCALE' | 'SHORT_TEXT' | 'MULTIPLE_CHOICE';

export interface ExitTicketScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface ExitTicketOption {
  id: string;
  text: string;
}

export interface ExitTicketQuestion {
  id: string;
  order: number;
  type: ExitTicketQuestionType;
  prompt: string;
  required: boolean;
  scale?: ExitTicketScaleConfig;
  options?: ExitTicketOption[];
}

export interface ExitTicketActivity {
  id: string;
  sessionId: string;
  title: string;
  status: ExitTicketStatus;
  isAnonymous: boolean;
  questions: ExitTicketQuestion[];
  createdAt: number;
  openedAt?: number;
  closedAt?: number;
}

export interface ExitTicketAnswer {
  questionId: string;
  value: number | string;
}

export interface ExitTicketResponse {
  id: string;
  sessionId: string;
  activityId: string;
  participantId: string;
  authorName: string;
  isAnonymous: boolean;
  answers: ExitTicketAnswer[];
  submittedAt: number;
}

export interface ExitTicketTextResponseItem {
  id: string;
  content: string;
  authorName: string;
  submittedAt: number;
}

export interface ExitTicketQuestionAggregates {
  questionId: string;
  type: ExitTicketQuestionType;
  totalResponses: number;
  scaleAverage?: number;
  scaleDistribution?: Record<number, number>;
  choiceDistribution?: Record<string, { count: number; percentage: number }>;
  textResponses?: ExitTicketTextResponseItem[];
}

export interface ExitTicketAggregates {
  responseCount: number;
  totalExpected: number;
  completionRate: number;
  questionAggregates: Record<string, ExitTicketQuestionAggregates>;
}

export interface TeacherExitTicketSnapshot {
  activity: ExitTicketActivity | null;
  aggregates: ExitTicketAggregates | null;
  responseCount: number;
  totalExpected: number;
  completionRate: number;
}

export interface ParticipantExitTicketSnapshot {
  activity: {
    id: string;
    title: string;
    status: ExitTicketStatus;
    isAnonymous: boolean;
    questions: ExitTicketQuestion[];
  } | null;
  hasSubmitted: boolean;
  submittedAt?: number;
}

// Client-to-server WebSocket payloads
export interface CreateExitTicketPayload {
  sessionId: string;
  title?: string;
  isAnonymous?: boolean;
  questions: Array<{
    type: ExitTicketQuestionType;
    prompt: string;
    required?: boolean;
    scale?: ExitTicketScaleConfig;
    options?: ExitTicketOption[];
  }>;
}

export interface OpenExitTicketPayload {
  sessionId: string;
}

export interface CloseExitTicketPayload {
  sessionId: string;
}

export interface SubmitExitTicketPayload {
  sessionId: string;
  answers: ExitTicketAnswer[];
}

// Server-to-client WebSocket event payloads
export interface ExitTicketOpenedEvent {
  activityId: string;
  openedAt: number;
}

export interface ExitTicketClosedEvent {
  activityId: string;
  closedAt: number;
}

export interface ExitTicketResponseSubmittedEvent {
  success: boolean;
  submittedAt: number;
}

export interface ExitTicketResultsUpdatedEvent {
  responseCount: number;
  completionRate: number;
  aggregates: ExitTicketAggregates;
}

export interface ExitTicketErrorEvent {
  code: string;
  message: string;
}
