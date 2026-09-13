import { Injectable, Logger } from '@nestjs/common';
import type {
  Quiz,
  QuizQuestion,
  ParticipantQuestionData,
  QuizLeaderboardEntry,
  TeacherLiveQuizSnapshot,
  ParticipantLiveQuizSnapshot,
  LiveQuizRuntimeStatus,
  SessionParticipant,
} from '@walikelas/types';

interface ActiveQuizQuestion {
  id: string;
  order: number;
  questionText: string;
  points: number;
  timeLimitSeconds: number;
  options: Array<{
    id: string;
    order: number;
    optionText: string;
    isCorrect: boolean;
  }>;
  correctOptionId: string;
}

interface QuestionSubmission {
  optionId: string;
  isCorrect: boolean;
  points: number;
  answeredAt: number;
}

interface ActiveQuizState {
  sessionId: string;
  quizId: string;
  title: string;
  settings: {
    timeLimitSeconds: number;
    showLeaderboard: boolean;
    showCorrectAnswer: boolean;
  };
  status: LiveQuizRuntimeStatus;
  currentQuestionIndex: number;
  questions: ActiveQuizQuestion[];
  questionStartedAt: number;
  questionDeadline: number;
  // questionId -> (participantId -> QuestionSubmission)
  submissions: Map<string, Map<string, QuestionSubmission>>;
  // participantId -> { score, correctCount }
  scores: Map<string, { score: number; correctCount: number }>;
}

@Injectable()
export class QuizRuntimeService {
  private readonly logger = new Logger(QuizRuntimeService.name);

  // sessionId -> ActiveQuizState
  private readonly activeQuizzes = new Map<string, ActiveQuizState>();

  /**
   * Initialize a live quiz for an active classroom session.
   */
  initQuiz(sessionId: string, quiz: Quiz): ActiveQuizState {
    const timeLimit = quiz.settings.timeLimitSeconds ?? 30;

    const questions: ActiveQuizQuestion[] = (quiz.questions || []).map((q) => {
      const correctOption = q.options.find((o) => o.isCorrect);
      return {
        id: q.id,
        order: q.order,
        questionText: q.questionText,
        points: q.points ?? 100,
        timeLimitSeconds: q.timeLimitSeconds ?? timeLimit,
        options: q.options.map((o) => ({
          id: o.id,
          order: o.order,
          optionText: o.optionText,
          isCorrect: o.isCorrect ?? false,
        })),
        correctOptionId: correctOption?.id || (q.options[0]?.id as string),
      };
    });

    const now = Date.now();
    const firstQTimeLimit = questions[0]?.timeLimitSeconds ?? timeLimit;

    const state: ActiveQuizState = {
      sessionId,
      quizId: quiz.id,
      title: quiz.title,
      settings: {
        timeLimitSeconds: timeLimit,
        showLeaderboard: quiz.settings.showLeaderboard ?? true,
        showCorrectAnswer: quiz.settings.showCorrectAnswer ?? true,
      },
      status: 'QUESTION_ACTIVE',
      currentQuestionIndex: 0,
      questions,
      questionStartedAt: now,
      questionDeadline: now + firstQTimeLimit * 1000,
      submissions: new Map<string, Map<string, QuestionSubmission>>(),
      scores: new Map<string, { score: number; correctCount: number }>(),
    };

    // Initialize submissions map for each question
    for (const q of questions) {
      state.submissions.set(q.id, new Map<string, QuestionSubmission>());
    }

    this.activeQuizzes.set(sessionId, state);

    this.logger.log(
      `Live Quiz [${quiz.title}] initialized on session ${sessionId} with ${questions.length} questions`,
    );

    return state;
  }

  getActiveQuiz(sessionId: string): ActiveQuizState | undefined {
    return this.activeQuizzes.get(sessionId);
  }

  isQuizActive(sessionId: string): boolean {
    const quiz = this.activeQuizzes.get(sessionId);
    return Boolean(quiz && quiz.status !== 'COMPLETED');
  }

  getCurrentParticipantQuestion(sessionId: string): ParticipantQuestionData | null {
    const quiz = this.activeQuizzes.get(sessionId);
    if (!quiz) return null;
    const currentQ = quiz.questions[quiz.currentQuestionIndex];
    if (!currentQ) return null;
    return {
      id: currentQ.id,
      order: currentQ.order,
      questionText: currentQ.questionText,
      points: currentQ.points,
      options: currentQ.options.map((o) => ({
        id: o.id,
        order: o.order,
        optionText: o.optionText,
      })),
    };
  }

  /**
   * Record a participant's answer submission.
   * Server-authoritative: validates time, single submission, and scores points.
   */
  recordAnswer(
    sessionId: string,
    participantId: string,
    questionId: string,
    optionId: string,
  ): {
    accepted: boolean;
    wasCorrect?: boolean;
    pointsEarned?: number;
    error?: string;
  } {
    const quiz = this.activeQuizzes.get(sessionId);
    if (!quiz) {
      return { accepted: false, error: 'Kuis tidak aktif' };
    }

    if (quiz.status !== 'QUESTION_ACTIVE') {
      return { accepted: false, error: 'Pertanyaan tidak menerima jawaban saat ini' };
    }

    const currentQ = quiz.questions[quiz.currentQuestionIndex];
    if (!currentQ || currentQ.id !== questionId) {
      return { accepted: false, error: 'Pertanyaan tidak valid atau sudah berganti' };
    }

    // Check submission window: deadline + 1500ms grace period for network latency
    const gracePeriodMs = 1500;
    if (Date.now() > quiz.questionDeadline + gracePeriodMs) {
      return { accepted: false, error: 'Waktu menjawab telah habis' };
    }

    const qSubmissions = quiz.submissions.get(questionId)!;
    if (qSubmissions.has(participantId)) {
      return { accepted: false, error: 'Anda sudah menjawab pertanyaan ini' };
    }

    // Server-side scoring
    const isCorrect = optionId === currentQ.correctOptionId;
    const points = isCorrect ? currentQ.points : 0;

    const submission: QuestionSubmission = {
      optionId,
      isCorrect,
      points,
      answeredAt: Date.now(),
    };

    qSubmissions.set(participantId, submission);

    // Update aggregate participant score
    const currentScore = quiz.scores.get(participantId) || { score: 0, correctCount: 0 };
    quiz.scores.set(participantId, {
      score: currentScore.score + points,
      correctCount: currentScore.correctCount + (isCorrect ? 1 : 0),
    });

    this.logger.debug(
      `Answer recorded: Participant ${participantId} -> Q:${questionId} Opt:${optionId} (Correct: ${isCorrect}, Points: ${points})`,
    );

    return {
      accepted: true,
      wasCorrect: isCorrect,
      pointsEarned: points,
    };
  }

  /**
   * End current question submissions and reveal stats.
   */
  endQuestion(sessionId: string): {
    correctOptionId: string;
    distribution: Record<string, number>;
  } | null {
    const quiz = this.activeQuizzes.get(sessionId);
    if (!quiz) return null;

    quiz.status = 'QUESTION_ENDED';
    const currentQ = quiz.questions[quiz.currentQuestionIndex];
    if (!currentQ) return null;

    const qSubmissions = quiz.submissions.get(currentQ.id);
    const distribution: Record<string, number> = {};

    for (const opt of currentQ.options) {
      distribution[opt.id] = 0;
    }

    if (qSubmissions) {
      for (const sub of qSubmissions.values()) {
        if (distribution[sub.optionId] !== undefined) {
          distribution[sub.optionId]++;
        }
      }
    }

    this.logger.log(`Question ${currentQ.order} ended on session ${sessionId}`);

    return {
      correctOptionId: currentQ.correctOptionId,
      distribution,
    };
  }

  /**
   * Advance to the next question or complete quiz.
   */
  nextQuestion(sessionId: string): {
    isComplete: boolean;
    questionNumber?: number;
    totalQuestions?: number;
  } | null {
    const quiz = this.activeQuizzes.get(sessionId);
    if (!quiz) return null;

    quiz.currentQuestionIndex++;

    if (quiz.currentQuestionIndex >= quiz.questions.length) {
      quiz.status = 'COMPLETED';
      this.logger.log(`Quiz completed on session ${sessionId}`);
      return { isComplete: true };
    }

    const nextQ = quiz.questions[quiz.currentQuestionIndex]!;
    const now = Date.now();
    quiz.status = 'QUESTION_ACTIVE';
    quiz.questionStartedAt = now;
    quiz.questionDeadline = now + nextQ.timeLimitSeconds * 1000;

    this.logger.log(
      `Advancing to question ${nextQ.order}/${quiz.questions.length} on session ${sessionId}`,
    );

    return {
      isComplete: false,
      questionNumber: nextQ.order,
      totalQuestions: quiz.questions.length,
    };
  }

  /**
   * Finish the quiz.
   */
  finishQuiz(sessionId: string): void {
    const quiz = this.activeQuizzes.get(sessionId);
    if (!quiz) return;
    quiz.status = 'COMPLETED';
    this.logger.log(`Quiz explicitly finished on session ${sessionId}`);
  }

  /**
   * Compute the leaderboard from current scores and session participant display names.
   */
  getLeaderboard(sessionId: string, participants: SessionParticipant[]): QuizLeaderboardEntry[] {
    const quiz = this.activeQuizzes.get(sessionId);
    if (!quiz) return [];

    const participantMap = new Map(participants.map((p) => [p.id, p.displayName]));

    const entries: QuizLeaderboardEntry[] = [];

    for (const [pId, scoreData] of quiz.scores.entries()) {
      const displayName = participantMap.get(pId) || 'Peserta';
      entries.push({
        participantId: pId,
        displayName,
        score: scoreData.score,
        correctCount: scoreData.correctCount,
        rank: 0,
      });
    }

    // Sort by score descending, then by correctCount descending
    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.correctCount - a.correctCount;
    });

    // Assign 1-indexed ranks (handles ties consistently)
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }

  /**
   * Build authoritative teacher snapshot.
   */
  getTeacherSnapshot(
    sessionId: string,
    participants: SessionParticipant[],
  ): TeacherLiveQuizSnapshot | null {
    const quiz = this.activeQuizzes.get(sessionId);
    if (!quiz) return null;

    const currentQ = quiz.questions[quiz.currentQuestionIndex];
    const qSubmissions = currentQ ? quiz.submissions.get(currentQ.id) : null;
    const answeredCount = qSubmissions ? qSubmissions.size : 0;

    const distribution: Record<string, number> = {};
    if (currentQ) {
      for (const opt of currentQ.options) {
        distribution[opt.id] = 0;
      }
      if (qSubmissions) {
        for (const sub of qSubmissions.values()) {
          if (distribution[sub.optionId] !== undefined) {
            distribution[sub.optionId]++;
          }
        }
      }
    }

    return {
      quizId: quiz.quizId,
      title: quiz.title,
      status: quiz.status,
      currentQuestionIndex: quiz.currentQuestionIndex,
      totalQuestions: quiz.questions.length,
      currentQuestion: currentQ
        ? {
            id: currentQ.id,
            order: currentQ.order,
            questionText: currentQ.questionText,
            points: currentQ.points,
            timeLimitSeconds: currentQ.timeLimitSeconds,
            options: currentQ.options,
          }
        : undefined,
      answeredCount,
      totalParticipants: participants.length,
      distribution,
      deadline: quiz.questionDeadline,
      leaderboard: this.getLeaderboard(sessionId, participants),
    };
  }

  /**
   * Build participant snapshot.
   * SECURITY: Strips `isCorrect` from options to prevent cheating!
   */
  getParticipantSnapshot(
    sessionId: string,
    participantId: string,
  ): ParticipantLiveQuizSnapshot | null {
    const quiz = this.activeQuizzes.get(sessionId);
    if (!quiz) return null;

    const currentQ = quiz.questions[quiz.currentQuestionIndex];
    const qSubmissions = currentQ ? quiz.submissions.get(currentQ.id) : null;
    const submission = qSubmissions?.get(participantId);

    const hasAnswered = Boolean(submission);
    const scoreData = quiz.scores.get(participantId) || { score: 0, correctCount: 0 };

    let participantQ: ParticipantQuestionData | undefined;
    if (currentQ) {
      participantQ = {
        id: currentQ.id,
        order: currentQ.order,
        questionText: currentQ.questionText,
        points: currentQ.points,
        options: currentQ.options.map((o) => ({
          id: o.id,
          order: o.order,
          optionText: o.optionText,
        })),
      };
    }

    return {
      quizId: quiz.quizId,
      title: quiz.title,
      status: quiz.status,
      currentQuestionIndex: quiz.currentQuestionIndex,
      totalQuestions: quiz.questions.length,
      currentQuestion: participantQ,
      hasAnswered,
      selectedOptionId: submission?.optionId,
      wasCorrect: quiz.status === 'QUESTION_ENDED' ? submission?.isCorrect : undefined,
      pointsEarned: quiz.status === 'QUESTION_ENDED' ? submission?.points : undefined,
      totalScore: scoreData.score,
      deadline: quiz.questionDeadline,
    };
  }

  /**
   * Clear quiz runtime state when session ends.
   */
  clearQuiz(sessionId: string): void {
    this.activeQuizzes.delete(sessionId);
    this.logger.log(`Cleared quiz runtime state for session ${sessionId}`);
  }
}
