export type QuestionStatus = 'PENDING' | 'HIGHLIGHTED' | 'ANSWERED' | 'DISMISSED';

export interface QuestionBoxItem {
  id: string;
  sessionId: string;
  participantId: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  status: QuestionStatus;
  createdAt: number;
  answeredAt?: number;
  dismissedAt?: number;
}

export interface ParticipantQuestionItem {
  id: string;
  content: string;
  status: QuestionStatus;
  isAnonymous: boolean;
  createdAt: number;
  answeredAt?: number;
}

export interface SharedQuestionItem {
  id: string;
  content: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: number;
}

export interface TeacherQuestionBoxSnapshot {
  questions: QuestionBoxItem[];
  highlightedQuestionId: string | null;
  pendingCount: number;
  answeredCount: number;
  totalCount: number;
}

export interface ParticipantQuestionBoxSnapshot {
  myQuestions: ParticipantQuestionItem[];
  highlightedQuestion: SharedQuestionItem | null;
}

// Client-to-server WebSocket payloads
export interface SubmitQuestionPayload {
  sessionId: string;
  content: string;
  isAnonymous?: boolean;
}

export interface HighlightQuestionPayload {
  sessionId: string;
  questionId: string;
}

export interface UnhighlightQuestionPayload {
  sessionId: string;
  questionId: string;
}

export interface AnswerQuestionPayload {
  sessionId: string;
  questionId: string;
}

export interface DismissQuestionPayload {
  sessionId: string;
  questionId: string;
}

// Server-to-client WebSocket event payloads
export interface QuestionSubmittedEvent {
  question: ParticipantQuestionItem;
}

export interface QuestionCreatedEvent {
  question: QuestionBoxItem;
}

export interface QuestionHighlightedEvent {
  question: SharedQuestionItem;
}

export interface QuestionUnhighlightedEvent {
  questionId: string;
}

export interface QuestionAnsweredEvent {
  questionId: string;
}

export interface QuestionDismissedEvent {
  questionId: string;
}

export interface QuestionCountUpdateEvent {
  pendingCount: number;
  answeredCount: number;
  totalCount: number;
}

export interface QuestionErrorEvent {
  code: string;
  message: string;
}
