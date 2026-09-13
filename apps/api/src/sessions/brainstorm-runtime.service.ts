import { Injectable, Logger } from '@nestjs/common';
import type {
  BrainstormActivity,
  BrainstormIdea,
  BrainstormSettings,
  TeacherBrainstormSnapshot,
  ParticipantBrainstormSnapshot,
  SharedBrainstormIdea,
  ParticipantBrainstormIdea,
} from '@walikelas/types';

interface ActiveBrainstormState {
  sessionId: string;
  activity: BrainstormActivity | null;
  ideas: Map<string, BrainstormIdea>; // ideaId -> BrainstormIdea
  participantIdeas: Map<string, string[]>; // participantId -> ideaIds[]
  rateLimits: Map<string, number>; // participantId -> lastSubmittedAt timestamp
  recentSubmissions: Map<string, { content: string; at: number }>; // participantId -> last submission
}

@Injectable()
export class BrainstormRuntimeService {
  private readonly logger = new Logger(BrainstormRuntimeService.name);

  // sessionId -> ActiveBrainstormState
  private readonly sessions = new Map<string, ActiveBrainstormState>();

  private getOrCreateSession(sessionId: string): ActiveBrainstormState {
    let state = this.sessions.get(sessionId);
    if (!state) {
      state = {
        sessionId,
        activity: null,
        ideas: new Map<string, BrainstormIdea>(),
        participantIdeas: new Map<string, string[]>(),
        rateLimits: new Map<string, number>(),
        recentSubmissions: new Map<string, { content: string; at: number }>(),
      };
      this.sessions.set(sessionId, state);
    }
    return state;
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  getActivity(sessionId: string): BrainstormActivity | null {
    const session = this.sessions.get(sessionId);
    return session?.activity || null;
  }

  /**
   * Create a new brainstorm activity for a session.
   * Resets existing ideas for the session when a new activity is initialized.
   */
  createActivity(
    sessionId: string,
    prompt: string,
    settings?: Partial<BrainstormSettings>,
  ): {
    accepted: boolean;
    activity?: BrainstormActivity;
    error?: string;
  } {
    const trimmedPrompt = (prompt || '').trim();
    if (!trimmedPrompt || trimmedPrompt.length < 1) {
      return { accepted: false, error: 'Topik atau pertanyaan papan ide wajib diisi' };
    }
    if (trimmedPrompt.length > 300) {
      return { accepted: false, error: 'Topik atau pertanyaan maksimal 300 karakter' };
    }

    const state = this.getOrCreateSession(sessionId);
    const now = Date.now();
    const id = `bs_${now}_${Math.random().toString(36).slice(2, 7)}`;

    const submissionMode = settings?.submissionMode || 'ONE_PER_PARTICIPANT';
    const resolvedSettings: BrainstormSettings = {
      isAnonymous: settings?.isAnonymous ?? false,
      ideasVisibleToParticipants: settings?.ideasVisibleToParticipants ?? false,
      submissionMode,
      maxIdeasPerParticipant:
        settings?.maxIdeasPerParticipant ?? (submissionMode === 'MULTIPLE_PER_PARTICIPANT' ? 5 : 1),
    };

    const activity: BrainstormActivity = {
      id,
      sessionId,
      prompt: trimmedPrompt,
      status: 'DRAFT',
      settings: resolvedSettings,
      createdAt: now,
    };

    state.activity = activity;
    state.ideas.clear();
    state.participantIdeas.clear();
    state.rateLimits.clear();
    state.recentSubmissions.clear();

    this.logger.log(`Created brainstorm activity [${id}] in session ${sessionId}`);
    return { accepted: true, activity };
  }

  /**
   * Open the brainstorm activity to accept submissions.
   * Allowed from DRAFT or PAUSED. Reopening CLOSED is prohibited.
   */
  openActivity(sessionId: string): {
    accepted: boolean;
    activity?: BrainstormActivity;
    error?: string;
  } {
    const state = this.sessions.get(sessionId);
    if (!state || !state.activity) {
      return { accepted: false, error: 'Aktivitas papan ide tidak ditemukan' };
    }

    if (state.activity.status === 'CLOSED') {
      return { accepted: false, error: 'Aktivitas yang sudah ditutup tidak dapat dibuka kembali' };
    }

    state.activity.status = 'OPEN';
    state.activity.openedAt = Date.now();

    this.logger.log(`Opened brainstorm activity [${state.activity.id}] in session ${sessionId}`);
    return { accepted: true, activity: state.activity };
  }

  /**
   * Pause the brainstorm activity. Submissions are temporarily blocked.
   * Allowed only when OPEN.
   */
  pauseActivity(sessionId: string): {
    accepted: boolean;
    activity?: BrainstormActivity;
    error?: string;
  } {
    const state = this.sessions.get(sessionId);
    if (!state || !state.activity) {
      return { accepted: false, error: 'Aktivitas papan ide tidak ditemukan' };
    }

    if (state.activity.status !== 'OPEN') {
      return { accepted: false, error: 'Hanya aktivitas yang sedang buka yang dapat dijeda' };
    }

    state.activity.status = 'PAUSED';
    state.activity.pausedAt = Date.now();

    this.logger.log(`Paused brainstorm activity [${state.activity.id}] in session ${sessionId}`);
    return { accepted: true, activity: state.activity };
  }

  /**
   * Close the brainstorm activity. Submissions are permanently closed.
   * Terminal state.
   */
  closeActivity(sessionId: string): {
    accepted: boolean;
    activity?: BrainstormActivity;
    error?: string;
  } {
    const state = this.sessions.get(sessionId);
    if (!state || !state.activity) {
      return { accepted: false, error: 'Aktivitas papan ide tidak ditemukan' };
    }

    if (state.activity.status === 'CLOSED') {
      return { accepted: false, error: 'Aktivitas sudah ditutup sebelumnya' };
    }

    state.activity.status = 'CLOSED';
    state.activity.closedAt = Date.now();

    this.logger.log(`Closed brainstorm activity [${state.activity.id}] in session ${sessionId}`);
    return { accepted: true, activity: state.activity };
  }

  /**
   * Submit an idea from a participant.
   * Server-authoritative:
   * - Enforces OPEN status
   * - Validates content length (1-300)
   * - 3-second cooldown rate limit
   * - Duplicate submission protection (within 15s)
   * - Submission limit per participant (1 or 5)
   * - Anonymous name masking
   */
  submitIdea(
    sessionId: string,
    participantId: string,
    authorName: string,
    content: string,
  ): {
    accepted: boolean;
    idea?: BrainstormIdea;
    error?: string;
  } {
    const state = this.sessions.get(sessionId);
    if (!state || !state.activity) {
      return { accepted: false, error: 'Aktivitas papan ide tidak ditemukan' };
    }

    if (state.activity.status !== 'OPEN') {
      return { accepted: false, error: 'Aktivitas papan ide sedang tidak menerima kiriman' };
    }

    const trimmed = (content || '').trim();
    if (!trimmed || trimmed.length < 1) {
      return { accepted: false, error: 'Ide tidak boleh kosong' };
    }
    if (trimmed.length > 300) {
      return { accepted: false, error: 'Ide maksimal 300 karakter' };
    }

    // Capacity limit
    if (state.ideas.size >= 200) {
      return {
        accepted: false,
        error: 'Papan ide telah mencapai batas kapasitas maksimal (200 ide)',
      };
    }

    const now = Date.now();

    // 3-second cooldown per participant
    const lastSubmittedAt = state.rateLimits.get(participantId);
    if (lastSubmittedAt && now - lastSubmittedAt < 3000) {
      const waitSeconds = Math.ceil((3000 - (now - lastSubmittedAt)) / 1000);
      return {
        accepted: false,
        error: `Mohon tunggu ${waitSeconds} detik sebelum mengirim ide lagi`,
      };
    }

    // Duplicate check: same content within 15 seconds
    const recent = state.recentSubmissions.get(participantId);
    if (
      recent &&
      recent.content.toLowerCase() === trimmed.toLowerCase() &&
      now - recent.at < 15000
    ) {
      return { accepted: false, error: 'Ide yang sama sudah Anda kirimkan sebelumnya' };
    }

    // Check submission count for this participant
    const existingIdeaIds = state.participantIdeas.get(participantId) || [];
    const maxAllowed = state.activity.settings.maxIdeasPerParticipant;
    if (existingIdeaIds.length >= maxAllowed) {
      if (state.activity.settings.submissionMode === 'ONE_PER_PARTICIPANT') {
        return { accepted: false, error: 'Anda sudah mengirimkan ide untuk sesi ini' };
      }
      return { accepted: false, error: `Anda telah mencapai batas maksimal ${maxAllowed} ide` };
    }

    const id = `idea_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const isAnonymous = state.activity.settings.isAnonymous;

    const idea: BrainstormIdea = {
      id,
      sessionId,
      activityId: state.activity.id,
      participantId,
      authorName: isAnonymous ? 'Anonim' : authorName?.trim() || 'Peserta',
      isAnonymous,
      content: trimmed,
      status: 'VISIBLE',
      createdAt: now,
    };

    state.ideas.set(id, idea);
    state.participantIdeas.set(participantId, [...existingIdeaIds, id]);
    state.rateLimits.set(participantId, now);
    state.recentSubmissions.set(participantId, { content: trimmed, at: now });

    this.logger.log(`Idea [${id}] submitted in session ${sessionId} by ${idea.authorName}`);
    return { accepted: true, idea };
  }

  /**
   * Teacher hides an inappropriate or duplicate idea.
   */
  hideIdea(sessionId: string, ideaId: string): BrainstormIdea | null {
    const state = this.sessions.get(sessionId);
    if (!state) return null;

    const idea = state.ideas.get(ideaId);
    if (!idea || idea.status === 'HIDDEN') return null;

    idea.status = 'HIDDEN';
    idea.hiddenAt = Date.now();

    this.logger.log(`Idea [${ideaId}] hidden by teacher in session ${sessionId}`);
    return idea;
  }

  /**
   * Teacher restores a previously hidden idea.
   */
  restoreIdea(sessionId: string, ideaId: string): BrainstormIdea | null {
    const state = this.sessions.get(sessionId);
    if (!state) return null;

    const idea = state.ideas.get(ideaId);
    if (!idea || idea.status !== 'HIDDEN') return null;

    idea.status = 'VISIBLE';
    idea.hiddenAt = undefined;

    this.logger.log(`Idea [${ideaId}] restored by teacher in session ${sessionId}`);
    return idea;
  }

  /**
   * Build authoritative teacher snapshot.
   * Teacher receives all ideas (visible and hidden), sorted newest first.
   */
  getTeacherSnapshot(sessionId: string): TeacherBrainstormSnapshot {
    const state = this.sessions.get(sessionId);
    if (!state || !state.activity) {
      return {
        activity: null,
        ideas: [],
        visibleCount: 0,
        hiddenCount: 0,
        totalCount: 0,
      };
    }

    const all = Array.from(state.ideas.values());
    let visibleCount = 0;
    let hiddenCount = 0;

    for (const idea of all) {
      if (idea.status === 'VISIBLE') {
        visibleCount++;
      } else if (idea.status === 'HIDDEN') {
        hiddenCount++;
      }
    }

    // Sort newest first
    all.sort((a, b) => b.createdAt - a.createdAt);

    return {
      activity: state.activity,
      ideas: all,
      visibleCount,
      hiddenCount,
      totalCount: all.length,
    };
  }

  /**
   * Build authoritative participant snapshot.
   * - Only sanitized activity info.
   * - Participant's own submitted ideas.
   * - If ideasVisibleToParticipants: true, sends only VISIBLE ideas (sanitized, no participantId).
   * - If ideasVisibleToParticipants: false, sends empty ideas array.
   */
  getParticipantSnapshot(sessionId: string, participantId: string): ParticipantBrainstormSnapshot {
    const state = this.sessions.get(sessionId);
    if (!state || !state.activity) {
      return {
        activity: null,
        myIdeas: [],
        ideas: [],
        canSubmit: false,
        totalIdeasCount: 0,
      };
    }

    // Collect participant's own ideas
    const myIdeas: ParticipantBrainstormIdea[] = [];
    for (const idea of state.ideas.values()) {
      if (idea.participantId === participantId) {
        myIdeas.push({
          id: idea.id,
          content: idea.content,
          status: idea.status,
          isAnonymous: idea.isAnonymous,
          createdAt: idea.createdAt,
        });
      }
    }
    myIdeas.sort((a, b) => b.createdAt - a.createdAt);

    // Collect visible peer ideas if permitted
    const ideas: SharedBrainstormIdea[] = [];
    let totalIdeasCount = 0;

    for (const idea of state.ideas.values()) {
      if (idea.status === 'VISIBLE') {
        totalIdeasCount++;
        if (state.activity.settings.ideasVisibleToParticipants) {
          ideas.push({
            id: idea.id,
            authorName: idea.authorName,
            isAnonymous: idea.isAnonymous,
            content: idea.content,
            createdAt: idea.createdAt,
          });
        }
      }
    }

    if (state.activity.settings.ideasVisibleToParticipants) {
      ideas.sort((a, b) => b.createdAt - a.createdAt);
    }

    const canSubmit =
      state.activity.status === 'OPEN' &&
      myIdeas.length < state.activity.settings.maxIdeasPerParticipant;

    return {
      activity: {
        id: state.activity.id,
        prompt: state.activity.prompt,
        status: state.activity.status,
        settings: state.activity.settings,
      },
      myIdeas,
      ideas,
      canSubmit,
      totalIdeasCount,
    };
  }

  /**
   * Clear session state when session ends.
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.log(`Cleared Brainstorm Board state for session ${sessionId}`);
  }
}
