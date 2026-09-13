import { Injectable, Logger } from '@nestjs/common';
import type {
  QuestionBoxItem,
  ParticipantQuestionItem,
  SharedQuestionItem,
  TeacherQuestionBoxSnapshot,
  ParticipantQuestionBoxSnapshot,
} from '@walikelas/types';

interface ParticipantRateLimit {
  lastSubmittedAt: number;
  count: number;
}

interface ActiveQuestionBoxState {
  sessionId: string;
  questions: Map<string, QuestionBoxItem>;
  highlightedQuestionId: string | null;
  rateLimits: Map<string, ParticipantRateLimit>;
}

@Injectable()
export class QuestionBoxRuntimeService {
  private readonly logger = new Logger(QuestionBoxRuntimeService.name);

  // sessionId -> ActiveQuestionBoxState
  private readonly sessions = new Map<string, ActiveQuestionBoxState>();

  private getOrCreateSession(sessionId: string): ActiveQuestionBoxState {
    let state = this.sessions.get(sessionId);
    if (!state) {
      state = {
        sessionId,
        questions: new Map<string, QuestionBoxItem>(),
        highlightedQuestionId: null,
        rateLimits: new Map<string, ParticipantRateLimit>(),
      };
      this.sessions.set(sessionId, state);
    }
    return state;
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Submit a question from a participant.
   * Server-authoritative: enforces length, cooldown, duplicate check, capacity, and anonymous masking.
   */
  submitQuestion(
    sessionId: string,
    participantId: string,
    authorName: string,
    content: string,
    isAnonymous: boolean = false,
  ): {
    accepted: boolean;
    question?: QuestionBoxItem;
    error?: string;
  } {
    const trimmed = (content || '').trim();
    if (!trimmed || trimmed.length < 1) {
      return { accepted: false, error: 'Pertanyaan tidak boleh kosong' };
    }
    if (trimmed.length > 500) {
      return { accepted: false, error: 'Pertanyaan maksimal 500 karakter' };
    }

    const sessionState = this.getOrCreateSession(sessionId);

    // Total session question capacity limit
    if (sessionState.questions.size >= 100) {
      return { accepted: false, error: 'Kotak pertanyaan kelas telah mencapai batas maksimal' };
    }

    const now = Date.now();
    const rateLimit = sessionState.rateLimits.get(participantId);

    // Submission cooldown: max 1 per 5 seconds
    if (rateLimit && now - rateLimit.lastSubmittedAt < 5000) {
      const waitSeconds = Math.ceil((5000 - (now - rateLimit.lastSubmittedAt)) / 1000);
      return {
        accepted: false,
        error: `Mohon tunggu ${waitSeconds} detik sebelum mengirim pertanyaan lagi`,
      };
    }

    // Check active pending limit per participant (max 5)
    let activeParticipantQuestions = 0;
    for (const q of sessionState.questions.values()) {
      if (
        q.participantId === participantId &&
        (q.status === 'PENDING' || q.status === 'HIGHLIGHTED')
      ) {
        activeParticipantQuestions++;
        // Duplicate check within 30 seconds
        if (q.content.toLowerCase() === trimmed.toLowerCase() && now - q.createdAt < 30000) {
          return { accepted: false, error: 'Pertanyaan yang sama sudah diajukan sebelumnya' };
        }
      }
    }

    if (activeParticipantQuestions >= 5) {
      return {
        accepted: false,
        error: 'Anda memiliki 5 pertanyaan aktif yang menunggu dibahas oleh guru',
      };
    }

    const id = `q_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const questionItem: QuestionBoxItem = {
      id,
      sessionId,
      participantId,
      authorName: isAnonymous ? 'Anonim' : authorName || 'Peserta',
      isAnonymous,
      content: trimmed,
      status: 'PENDING',
      createdAt: now,
    };

    sessionState.questions.set(id, questionItem);
    sessionState.rateLimits.set(participantId, {
      lastSubmittedAt: now,
      count: (rateLimit?.count || 0) + 1,
    });

    this.logger.log(
      `Question submitted in session ${sessionId} by ${questionItem.authorName} (ID: ${id})`,
    );

    return {
      accepted: true,
      question: questionItem,
    };
  }

  /**
   * Highlight a question to feature on screen/projector.
   * Single highlight rule: automatically unhighlights previous question.
   */
  highlightQuestion(sessionId: string, questionId: string): QuestionBoxItem | null {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) return null;

    const question = sessionState.questions.get(questionId);
    if (!question || question.status === 'ANSWERED' || question.status === 'DISMISSED') {
      return null;
    }

    // Unhighlight previously highlighted question if different
    if (sessionState.highlightedQuestionId && sessionState.highlightedQuestionId !== questionId) {
      const prev = sessionState.questions.get(sessionState.highlightedQuestionId);
      if (prev && prev.status === 'HIGHLIGHTED') {
        prev.status = 'PENDING';
      }
    }

    question.status = 'HIGHLIGHTED';
    sessionState.highlightedQuestionId = questionId;

    this.logger.log(`Question [${questionId}] highlighted in session ${sessionId}`);
    return question;
  }

  /**
   * Unhighlight a question back to PENDING.
   */
  unhighlightQuestion(sessionId: string, questionId: string): QuestionBoxItem | null {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) return null;

    const question = sessionState.questions.get(questionId);
    if (!question || question.status !== 'HIGHLIGHTED') return null;

    question.status = 'PENDING';
    sessionState.highlightedQuestionId = null;

    this.logger.log(`Question [${questionId}] unhighlighted in session ${sessionId}`);
    return question;
  }

  /**
   * Mark a question as answered.
   */
  answerQuestion(sessionId: string, questionId: string): QuestionBoxItem | null {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) return null;

    const question = sessionState.questions.get(questionId);
    if (!question) return null;

    if (sessionState.highlightedQuestionId === questionId) {
      sessionState.highlightedQuestionId = null;
    }

    question.status = 'ANSWERED';
    question.answeredAt = Date.now();

    this.logger.log(`Question [${questionId}] marked as answered in session ${sessionId}`);
    return question;
  }

  /**
   * Dismiss a question (duplicate, irrelevant, inappropriate).
   */
  dismissQuestion(sessionId: string, questionId: string): QuestionBoxItem | null {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) return null;

    const question = sessionState.questions.get(questionId);
    if (!question) return null;

    if (sessionState.highlightedQuestionId === questionId) {
      sessionState.highlightedQuestionId = null;
    }

    question.status = 'DISMISSED';
    question.dismissedAt = Date.now();

    this.logger.log(`Question [${questionId}] dismissed in session ${sessionId}`);
    return question;
  }

  /**
   * Build authoritative teacher snapshot with queue order:
   * 1. Highlighted question
   * 2. Pending questions (newest first)
   * 3. Answered questions (newest answered first)
   * 4. Dismissed questions
   */
  getTeacherSnapshot(sessionId: string): TeacherQuestionBoxSnapshot {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) {
      return {
        questions: [],
        highlightedQuestionId: null,
        pendingCount: 0,
        answeredCount: 0,
        totalCount: 0,
      };
    }

    const all = Array.from(sessionState.questions.values());

    let pendingCount = 0;
    let answeredCount = 0;

    const highlighted: QuestionBoxItem[] = [];
    const pending: QuestionBoxItem[] = [];
    const answered: QuestionBoxItem[] = [];
    const dismissed: QuestionBoxItem[] = [];

    for (const q of all) {
      if (q.status === 'HIGHLIGHTED') {
        highlighted.push(q);
        pendingCount++;
      } else if (q.status === 'PENDING') {
        pending.push(q);
        pendingCount++;
      } else if (q.status === 'ANSWERED') {
        answered.push(q);
        answeredCount++;
      } else if (q.status === 'DISMISSED') {
        dismissed.push(q);
      }
    }

    // Sort pending newest first
    pending.sort((a, b) => b.createdAt - a.createdAt);
    // Sort answered newest answered first
    answered.sort((a, b) => (b.answeredAt || 0) - (a.answeredAt || 0));
    // Sort dismissed newest dismissed first
    dismissed.sort((a, b) => (b.dismissedAt || 0) - (a.dismissedAt || 0));

    const sortedQuestions = [...highlighted, ...pending, ...answered, ...dismissed];

    return {
      questions: sortedQuestions,
      highlightedQuestionId: sessionState.highlightedQuestionId,
      pendingCount,
      answeredCount,
      totalCount: all.length,
    };
  }

  /**
   * Build participant snapshot:
   * - Only own questions (privacy protection; other participants' questions are not exposed)
   * - Currently highlighted question (if any)
   */
  getParticipantSnapshot(sessionId: string, participantId: string): ParticipantQuestionBoxSnapshot {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) {
      return {
        myQuestions: [],
        highlightedQuestion: null,
      };
    }

    const myQuestions: ParticipantQuestionItem[] = [];
    for (const q of sessionState.questions.values()) {
      if (q.participantId === participantId) {
        myQuestions.push({
          id: q.id,
          content: q.content,
          status: q.status,
          isAnonymous: q.isAnonymous,
          createdAt: q.createdAt,
          answeredAt: q.answeredAt,
        });
      }
    }
    myQuestions.sort((a, b) => b.createdAt - a.createdAt);

    let highlightedQuestion: SharedQuestionItem | null = null;
    if (sessionState.highlightedQuestionId) {
      const hq = sessionState.questions.get(sessionState.highlightedQuestionId);
      if (hq && hq.status === 'HIGHLIGHTED') {
        highlightedQuestion = {
          id: hq.id,
          content: hq.content,
          authorName: hq.authorName,
          isAnonymous: hq.isAnonymous,
          createdAt: hq.createdAt,
        };
      }
    }

    return {
      myQuestions,
      highlightedQuestion,
    };
  }

  /**
   * Clear session state when session ends.
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.log(`Cleared Question Box state for session ${sessionId}`);
  }
}
