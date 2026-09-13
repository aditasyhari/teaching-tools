import { Injectable, Logger } from '@nestjs/common';
import type {
  ExitTicketActivity,
  ExitTicketQuestion,
  ExitTicketResponse,
  ExitTicketAnswer,
  ExitTicketAggregates,
  ExitTicketQuestionAggregates,
  ExitTicketTextResponseItem,
  TeacherExitTicketSnapshot,
  ParticipantExitTicketSnapshot,
  ExitTicketQuestionType,
  ExitTicketScaleConfig,
  ExitTicketOption,
} from '@walikelas/types';

interface ActiveExitTicketState {
  sessionId: string;
  activity: ExitTicketActivity | null;
  responses: Map<string, ExitTicketResponse>; // participantId -> response
  rateLimits: Map<string, number>; // participantId -> lastAttemptAt
}

function sanitizeText(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

@Injectable()
export class ExitTicketRuntimeService {
  private readonly logger = new Logger(ExitTicketRuntimeService.name);

  // sessionId -> ActiveExitTicketState
  private readonly sessions = new Map<string, ActiveExitTicketState>();

  private getOrCreateSession(sessionId: string): ActiveExitTicketState {
    let state = this.sessions.get(sessionId);
    if (!state) {
      state = {
        sessionId,
        activity: null,
        responses: new Map<string, ExitTicketResponse>(),
        rateLimits: new Map<string, number>(),
      };
      this.sessions.set(sessionId, state);
    }
    return state;
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  getActivity(sessionId: string): ExitTicketActivity | null {
    const session = this.sessions.get(sessionId);
    return session?.activity || null;
  }

  /**
   * Create a new Exit Ticket activity for a session.
   * Resets any previous Exit Ticket responses for this session.
   */
  createActivity(
    sessionId: string,
    title: string = 'Exit Ticket',
    isAnonymous: boolean = true,
    questions: Array<{
      type: ExitTicketQuestionType;
      prompt: string;
      required?: boolean;
      scale?: ExitTicketScaleConfig;
      options?: ExitTicketOption[];
    }>,
  ): { accepted: boolean; activity?: ExitTicketActivity; error?: string } {
    if (!questions || questions.length === 0) {
      return { accepted: false, error: 'Exit Ticket minimal memiliki 1 pertanyaan' };
    }
    if (questions.length > 3) {
      return { accepted: false, error: 'Exit Ticket maksimal memiliki 3 pertanyaan' };
    }

    const session = this.getOrCreateSession(sessionId);

    // Format questions with explicit ordering and unique IDs
    const formattedQuestions: ExitTicketQuestion[] = questions.map((q, idx) => ({
      id: `q_${idx + 1}_${Math.random().toString(36).substring(2, 6)}`,
      order: idx,
      type: q.type,
      prompt: q.prompt.trim(),
      required: q.required ?? true,
      scale: q.type === 'SCALE' ? q.scale || { min: 1, max: 5 } : undefined,
      options:
        q.type === 'MULTIPLE_CHOICE'
          ? (q.options || []).map((opt, optIdx) => ({
              id: opt.id || `opt_${optIdx + 1}`,
              text: opt.text.trim(),
            }))
          : undefined,
    }));

    const activityId = `et_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const activity: ExitTicketActivity = {
      id: activityId,
      sessionId,
      title: title.trim() || 'Exit Ticket',
      status: 'DRAFT',
      isAnonymous,
      questions: formattedQuestions,
      createdAt: Date.now(),
    };

    session.activity = activity;
    session.responses.clear();
    session.rateLimits.clear();

    this.logger.log(`Created Exit Ticket [${activityId}] in session ${sessionId}`);
    return { accepted: true, activity };
  }

  /**
   * Open Exit Ticket for participant submissions.
   */
  openActivity(sessionId: string): {
    accepted: boolean;
    activity?: ExitTicketActivity;
    error?: string;
  } {
    const session = this.sessions.get(sessionId);
    if (!session || !session.activity) {
      return { accepted: false, error: 'Aktivitas Exit Ticket tidak ditemukan' };
    }

    if (session.activity.status === 'CLOSED') {
      return {
        accepted: false,
        error: 'Aktivitas Exit Ticket yang sudah ditutup tidak dapat dibuka kembali',
      };
    }

    session.activity.status = 'OPEN';
    session.activity.openedAt = Date.now();

    this.logger.log(`Opened Exit Ticket [${session.activity.id}] in session ${sessionId}`);
    return { accepted: true, activity: session.activity };
  }

  /**
   * Close Exit Ticket permanently (terminal state).
   */
  closeActivity(sessionId: string): {
    accepted: boolean;
    activity?: ExitTicketActivity;
    error?: string;
  } {
    const session = this.sessions.get(sessionId);
    if (!session || !session.activity) {
      return { accepted: false, error: 'Aktivitas Exit Ticket tidak ditemukan' };
    }

    if (session.activity.status === 'CLOSED') {
      return { accepted: true, activity: session.activity };
    }

    session.activity.status = 'CLOSED';
    session.activity.closedAt = Date.now();

    this.logger.log(`Closed Exit Ticket [${session.activity.id}] in session ${sessionId}`);
    return { accepted: true, activity: session.activity };
  }

  /**
   * Submit participant response.
   * Server-authoritative validation:
   * - Must be OPEN.
   * - Cooldown 3s.
   * - One response per participant.
   * - Validates all required questions.
   * - Validates values per question type.
   */
  submitResponse(
    sessionId: string,
    participantId: string,
    authorName: string,
    answers: ExitTicketAnswer[],
  ): { accepted: boolean; response?: ExitTicketResponse; error?: string } {
    const session = this.sessions.get(sessionId);
    if (!session || !session.activity) {
      return { accepted: false, error: 'Tidak ada aktivitas Exit Ticket aktif' };
    }

    const activity = session.activity;
    if (activity.status !== 'OPEN') {
      return { accepted: false, error: 'Exit Ticket belum dibuka atau sudah ditutup' };
    }

    // One response per participant invariant
    if (session.responses.has(participantId)) {
      return {
        accepted: false,
        error: 'Anda sudah mengirimkan refleksi untuk sesi ini',
      };
    }

    // Cooldown check (3s)
    const now = Date.now();
    const lastAttempt = session.rateLimits.get(participantId);
    if (lastAttempt && now - lastAttempt < 3000) {
      return {
        accepted: false,
        error: 'Mohon tunggu beberapa detik sebelum mencoba mengirim lagi',
      };
    }
    session.rateLimits.set(participantId, now);

    // Map provided answers by questionId
    const answersMap = new Map<string, number | string>();
    for (const a of answers) {
      answersMap.set(a.questionId, a.value);
    }

    const validatedAnswers: ExitTicketAnswer[] = [];

    // Validate against each question in the activity
    for (const question of activity.questions) {
      const value = answersMap.get(question.id);

      if (question.required && (value === undefined || value === null || value === '')) {
        return {
          accepted: false,
          error: `Pertanyaan "${question.prompt}" wajib dijawab`,
        };
      }

      if (value !== undefined && value !== null && value !== '') {
        if (question.type === 'SCALE') {
          const numVal = Number(value);
          if (!Number.isInteger(numVal) || numVal < 1 || numVal > 5) {
            return {
              accepted: false,
              error: `Nilai skala untuk "${question.prompt}" harus berupa angka 1 sampai 5`,
            };
          }
          validatedAnswers.push({ questionId: question.id, value: numVal });
        } else if (question.type === 'MULTIPLE_CHOICE') {
          const optStr = String(value).trim();
          const validOpt = (question.options || []).some((opt) => opt.id === optStr);
          if (!validOpt) {
            return {
              accepted: false,
              error: `Pilihan tidak valid untuk pertanyaan "${question.prompt}"`,
            };
          }
          validatedAnswers.push({ questionId: question.id, value: optStr });
        } else if (question.type === 'SHORT_TEXT') {
          const textStr = sanitizeText(String(value));
          if (question.required && textStr.length === 0) {
            return {
              accepted: false,
              error: `Jawaban untuk "${question.prompt}" tidak boleh kosong`,
            };
          }
          if (textStr.length > 300) {
            return {
              accepted: false,
              error: `Jawaban untuk "${question.prompt}" maksimal 300 karakter`,
            };
          }
          validatedAnswers.push({ questionId: question.id, value: textStr });
        }
      }
    }

    const responseId = `etr_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const finalAuthor = activity.isAnonymous ? 'Anonim' : authorName || 'Peserta';

    const response: ExitTicketResponse = {
      id: responseId,
      sessionId,
      activityId: activity.id,
      participantId,
      authorName: finalAuthor,
      isAnonymous: activity.isAnonymous,
      answers: validatedAnswers,
      submittedAt: now,
    };

    session.responses.set(participantId, response);
    this.logger.log(
      `Exit ticket response recorded: [${responseId}] from participant [${participantId}] in session ${sessionId}`,
    );

    return { accepted: true, response };
  }

  /**
   * Calculate server-authoritative aggregates for teacher view.
   */
  calculateAggregates(sessionId: string, totalExpected: number = 0): ExitTicketAggregates {
    const session = this.sessions.get(sessionId);
    if (!session || !session.activity) {
      return {
        responseCount: 0,
        totalExpected: totalExpected || 0,
        completionRate: 0,
        questionAggregates: {},
      };
    }

    const activity = session.activity;
    const allResponses = Array.from(session.responses.values());
    const responseCount = allResponses.length;
    const completionRate =
      totalExpected > 0
        ? Math.min(100, Math.round((responseCount / totalExpected) * 1000) / 10)
        : 0;

    const questionAggregates: Record<string, ExitTicketQuestionAggregates> = {};

    for (const question of activity.questions) {
      const qAnswers = allResponses
        .map((r) => r.answers.find((a) => a.questionId === question.id))
        .filter((a): a is ExitTicketAnswer => a !== undefined && a.value !== undefined);

      if (question.type === 'SCALE') {
        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        let count = 0;

        for (const ans of qAnswers) {
          const val = Number(ans.value);
          if (val >= 1 && val <= 5) {
            distribution[val] = (distribution[val] || 0) + 1;
            sum += val;
            count++;
          }
        }

        const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

        questionAggregates[question.id] = {
          questionId: question.id,
          type: 'SCALE',
          totalResponses: count,
          scaleAverage: average,
          scaleDistribution: distribution,
        };
      } else if (question.type === 'MULTIPLE_CHOICE') {
        const choiceDistribution: Record<string, { count: number; percentage: number }> = {};
        const totalAnswers = qAnswers.length;

        // Initialize all defined options with 0
        for (const opt of question.options || []) {
          choiceDistribution[opt.id] = { count: 0, percentage: 0 };
        }

        // Count occurrences
        for (const ans of qAnswers) {
          const optId = String(ans.value);
          if (choiceDistribution[optId]) {
            choiceDistribution[optId].count++;
          }
        }

        // Calculate percentages
        for (const optId in choiceDistribution) {
          const count = choiceDistribution[optId]?.count || 0;
          const pct = totalAnswers > 0 ? Math.round((count / totalAnswers) * 1000) / 10 : 0;
          choiceDistribution[optId] = { count, percentage: pct };
        }

        questionAggregates[question.id] = {
          questionId: question.id,
          type: 'MULTIPLE_CHOICE',
          totalResponses: totalAnswers,
          choiceDistribution,
        };
      } else if (question.type === 'SHORT_TEXT') {
        const textResponses: ExitTicketTextResponseItem[] = [];

        for (const r of allResponses) {
          const ans = r.answers.find((a) => a.questionId === question.id);
          if (ans && typeof ans.value === 'string' && ans.value.length > 0) {
            textResponses.push({
              id: `${r.id}_${question.id}`,
              content: ans.value,
              authorName: r.authorName,
              submittedAt: r.submittedAt,
            });
          }
        }

        // Sort newest first
        textResponses.sort((a, b) => b.submittedAt - a.submittedAt);

        questionAggregates[question.id] = {
          questionId: question.id,
          type: 'SHORT_TEXT',
          totalResponses: textResponses.length,
          textResponses,
        };
      }
    }

    return {
      responseCount,
      totalExpected,
      completionRate,
      questionAggregates,
    };
  }

  /**
   * Complete authoritative teacher snapshot.
   */
  getTeacherSnapshot(sessionId: string, totalExpected: number = 0): TeacherExitTicketSnapshot {
    const session = this.sessions.get(sessionId);
    if (!session || !session.activity) {
      return {
        activity: null,
        aggregates: null,
        responseCount: 0,
        totalExpected: totalExpected || 0,
        completionRate: 0,
      };
    }

    const aggregates = this.calculateAggregates(sessionId, totalExpected);

    return {
      activity: session.activity,
      aggregates,
      responseCount: aggregates.responseCount,
      totalExpected,
      completionRate: aggregates.completionRate,
    };
  }

  /**
   * Sanitized participant snapshot.
   * Does NOT leak any other participant's responses, IDs, or aggregate stats.
   */
  getParticipantSnapshot(sessionId: string, participantId: string): ParticipantExitTicketSnapshot {
    const session = this.sessions.get(sessionId);
    if (!session || !session.activity) {
      return {
        activity: null,
        hasSubmitted: false,
      };
    }

    const existingResponse = session.responses.get(participantId);

    return {
      activity: {
        id: session.activity.id,
        title: session.activity.title,
        status: session.activity.status,
        isAnonymous: session.activity.isAnonymous,
        questions: session.activity.questions,
      },
      hasSubmitted: Boolean(existingResponse),
      submittedAt: existingResponse?.submittedAt,
    };
  }

  /**
   * Clean up session resources on session termination.
   */
  clearSession(sessionId: string): void {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      this.logger.log(`Cleared Exit Ticket state for session ${sessionId}`);
    }
  }
}
