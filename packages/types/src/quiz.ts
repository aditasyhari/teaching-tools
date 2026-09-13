export type QuizStatus = 'DRAFT' | 'PUBLISHED';

export interface QuizSettings {
  timeLimitSeconds?: number;
  showLeaderboard?: boolean;
  showCorrectAnswer?: boolean;
}

export interface QuizOption {
  id: string;
  questionId?: string;
  order: number;
  optionText: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId?: string;
  order: number;
  questionText: string;
  points: number;
  timeLimitSeconds?: number | null;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  teacherId: string;
  title: string;
  description?: string | null;
  settings: QuizSettings;
  status: QuizStatus;
  questions?: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizSummary {
  id: string;
  teacherId: string;
  title: string;
  description?: string | null;
  status: QuizStatus;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

// Client-safe question data (isCorrect stripped)
export interface ParticipantQuestionData {
  id: string;
  order: number;
  questionText: string;
  points: number;
  options: Array<{
    id: string;
    order: number;
    optionText: string;
  }>;
}

export interface QuizLeaderboardEntry {
  participantId: string;
  displayName: string;
  score: number;
  correctCount: number;
  rank: number;
}

export type LiveQuizRuntimeStatus =
  'PREPARING' | 'QUESTION_ACTIVE' | 'QUESTION_ENDED' | 'COMPLETED';

export interface TeacherLiveQuizSnapshot {
  quizId: string;
  title: string;
  status: LiveQuizRuntimeStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion?: QuizQuestion;
  answeredCount: number;
  totalParticipants: number;
  distribution?: Record<string, number>;
  deadline?: number;
  leaderboard?: QuizLeaderboardEntry[];
}

export interface ParticipantLiveQuizSnapshot {
  quizId: string;
  title: string;
  status: LiveQuizRuntimeStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion?: ParticipantQuestionData;
  hasAnswered: boolean;
  selectedOptionId?: string;
  wasCorrect?: boolean;
  pointsEarned?: number;
  totalScore: number;
  deadline?: number;
}

// Realtime Event Payloads
export interface QuizStartPayload {
  sessionId: string;
  quizId: string;
}

export interface QuizAnswerPayload {
  sessionId: string;
  questionId: string;
  optionId: string;
}

export interface QuizEndQuestionPayload {
  sessionId: string;
}

export interface QuizNextQuestionPayload {
  sessionId: string;
}

export interface QuizFinishPayload {
  sessionId: string;
}

export interface QuizStartedEvent {
  quizId: string;
  title: string;
  totalQuestions: number;
}

export interface QuizQuestionStartedEvent {
  questionNumber: number;
  totalQuestions: number;
  question: ParticipantQuestionData;
  deadline: number;
}

export interface QuizAnswerAcceptedEvent {
  questionId: string;
  optionId: string;
}

export interface QuizQuestionEndedEvent {
  correctOptionId?: string;
  distribution?: Record<string, number>;
  result?: {
    isCorrect: boolean;
    points: number;
  };
}

export interface QuizCompletedEvent {
  leaderboard: QuizLeaderboardEntry[];
  finalScore?: number;
}

export interface QuizStatsUpdateEvent {
  answeredCount: number;
  totalParticipants: number;
}
