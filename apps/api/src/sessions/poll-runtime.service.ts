import { Injectable, Logger } from '@nestjs/common';
import type {
  Poll,
  PollOption,
  TeacherLivePollSnapshot,
  ParticipantLivePollSnapshot,
  LivePollRuntimeStatus,
  SessionParticipant,
  PollSettings,
} from '@walikelas/types';

interface ParticipantResponse {
  optionIds: string[];
  answeredAt: number;
}

interface ActivePollState {
  sessionId: string;
  pollId: string;
  title: string;
  question: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  status: LivePollRuntimeStatus;
  options: PollOption[];
  settings: PollSettings;
  startedAt: number;
  closedAt?: number;
  // participantId -> ParticipantResponse
  responses: Map<string, ParticipantResponse>;
  // optionId -> count
  distribution: Record<string, number>;
}

@Injectable()
export class PollRuntimeService {
  private readonly logger = new Logger(PollRuntimeService.name);

  // sessionId -> ActivePollState
  private readonly activePolls = new Map<string, ActivePollState>();

  /**
   * Initialize and start a live poll in a session.
   */
  initPoll(sessionId: string, poll: Poll): ActivePollState {
    const distribution: Record<string, number> = {};
    for (const opt of poll.options) {
      distribution[opt.id] = 0;
    }

    const state: ActivePollState = {
      sessionId,
      pollId: poll.id,
      title: poll.title,
      question: poll.question,
      type: poll.type || 'SINGLE_CHOICE',
      status: 'LIVE',
      options: poll.options.map((o) => ({
        id: o.id,
        pollId: o.pollId,
        order: o.order,
        optionText: o.optionText,
      })),
      settings: {
        allowMultiple: poll.settings?.allowMultiple ?? poll.type === 'MULTIPLE_CHOICE',
        showResultsToParticipants: poll.settings?.showResultsToParticipants ?? true,
        isAnonymous: poll.settings?.isAnonymous ?? true,
      },
      startedAt: Date.now(),
      responses: new Map<string, ParticipantResponse>(),
      distribution,
    };

    this.activePolls.set(sessionId, state);

    this.logger.log(
      `Live Poll [${poll.title}] started on session ${sessionId} with ${poll.options.length} options`,
    );

    return state;
  }

  getActivePoll(sessionId: string): ActivePollState | undefined {
    return this.activePolls.get(sessionId);
  }

  isPollActive(sessionId: string): boolean {
    const poll = this.activePolls.get(sessionId);
    return Boolean(poll && poll.status === 'LIVE');
  }

  hasPoll(sessionId: string): boolean {
    return this.activePolls.has(sessionId);
  }

  /**
   * Helper: Calculate percentage distribution.
   */
  private computePercentages(
    distribution: Record<string, number>,
    totalResponses: number,
  ): Record<string, number> {
    const percentages: Record<string, number> = {};
    for (const [optId, count] of Object.entries(distribution)) {
      percentages[optId] = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
    }
    return percentages;
  }

  /**
   * Record a participant's poll response.
   * Server-authoritative: single submission lock, option existence check, distribution update.
   */
  recordResponse(
    sessionId: string,
    participantId: string,
    optionId?: string,
    optionIds?: string[],
  ): {
    accepted: boolean;
    error?: string;
    selectedOptionIds?: string[];
  } {
    const poll = this.activePolls.get(sessionId);
    if (!poll) {
      return { accepted: false, error: 'Polling tidak ditemukan dalam sesi ini' };
    }

    if (poll.status !== 'LIVE') {
      return { accepted: false, error: 'Polling sudah ditutup atau tidak aktif' };
    }

    if (poll.responses.has(participantId)) {
      return { accepted: false, error: 'Anda sudah mengirim respon untuk polling ini' };
    }

    // Determine chosen option IDs
    let selected: string[] = [];
    if (optionIds && Array.isArray(optionIds) && optionIds.length > 0) {
      selected = optionIds;
    } else if (optionId) {
      selected = [optionId];
    }

    if (selected.length === 0) {
      return { accepted: false, error: 'Minimal satu opsi harus dipilih' };
    }

    // If single choice or allowMultiple is false, enforce single selection
    if (!poll.settings.allowMultiple && selected.length > 1) {
      selected = [selected[0]!];
    }

    // Validate each selected option ID belongs to the poll
    const validOptionIds = new Set(poll.options.map((o) => o.id));
    for (const id of selected) {
      if (!validOptionIds.has(id)) {
        return { accepted: false, error: 'Pilihan opsi tidak valid' };
      }
    }

    // Record response
    poll.responses.set(participantId, {
      optionIds: selected,
      answeredAt: Date.now(),
    });

    // Increment distribution counts
    for (const id of selected) {
      poll.distribution[id] = (poll.distribution[id] || 0) + 1;
    }

    this.logger.debug(
      `Poll response recorded: Participant ${participantId} -> Poll:${poll.pollId} Options:[${selected.join(', ')}]`,
    );

    return {
      accepted: true,
      selectedOptionIds: selected,
    };
  }

  /**
   * Close the active poll.
   */
  closePoll(sessionId: string): {
    pollId: string;
    distribution: Record<string, number>;
    percentages: Record<string, number>;
    totalResponses: number;
  } | null {
    const poll = this.activePolls.get(sessionId);
    if (!poll) return null;

    poll.status = 'CLOSED';
    poll.closedAt = Date.now();

    const totalResponses = poll.responses.size;
    const percentages = this.computePercentages(poll.distribution, totalResponses);

    this.logger.log(
      `Poll [${poll.title}] closed on session ${sessionId}. Total responses: ${totalResponses}`,
    );

    return {
      pollId: poll.pollId,
      distribution: { ...poll.distribution },
      percentages,
      totalResponses,
    };
  }

  /**
   * Get teacher live poll snapshot.
   */
  getTeacherSnapshot(
    sessionId: string,
    participants: SessionParticipant[],
  ): TeacherLivePollSnapshot | null {
    const poll = this.activePolls.get(sessionId);
    if (!poll) return null;

    const responseCount = poll.responses.size;
    const totalParticipants = participants.length;
    const responseRate =
      totalParticipants > 0 ? Math.round((responseCount / totalParticipants) * 100) : 0;
    const percentages = this.computePercentages(poll.distribution, responseCount);

    return {
      pollId: poll.pollId,
      title: poll.title,
      question: poll.question,
      type: poll.type,
      status: poll.status,
      options: poll.options,
      responseCount,
      totalParticipants,
      responseRate,
      distribution: { ...poll.distribution },
      percentages,
      settings: poll.settings,
    };
  }

  /**
   * Get participant live poll snapshot.
   */
  getParticipantSnapshot(
    sessionId: string,
    participantId: string,
  ): ParticipantLivePollSnapshot | null {
    const poll = this.activePolls.get(sessionId);
    if (!poll) return null;

    const submission = poll.responses.get(participantId);
    const hasResponded = Boolean(submission);

    const showResults = Boolean(
      poll.settings.showResultsToParticipants || poll.status === 'CLOSED',
    );

    let distribution: Record<string, number> | undefined;
    let percentages: Record<string, number> | undefined;

    if (showResults) {
      distribution = { ...poll.distribution };
      percentages = this.computePercentages(poll.distribution, poll.responses.size);
    }

    return {
      pollId: poll.pollId,
      title: poll.title,
      question: poll.question,
      type: poll.type,
      status: poll.status,
      options: poll.options,
      hasResponded,
      selectedOptionIds: submission?.optionIds || [],
      distribution,
      percentages,
      settings: poll.settings,
    };
  }

  /**
   * Clear poll state when session ends.
   */
  clearPoll(sessionId: string): void {
    this.activePolls.delete(sessionId);
    this.logger.log(`Cleared poll runtime state for session ${sessionId}`);
  }
}
