import { Injectable, Logger } from '@nestjs/common';
import type {
  ClassroomTimerState,
  ClassroomTimerStatus,
  ClassroomTimerVisibility,
  TeacherClassroomTimerSnapshot,
  ParticipantClassroomTimerSnapshot,
} from '@walikelas/types';

interface ClassroomTimerInternalState {
  sessionId: string;
  status: ClassroomTimerStatus;
  duration: number; // in seconds
  remainingSeconds: number; // in seconds
  label?: string;
  visibility: ClassroomTimerVisibility;
  startedAt?: number;
  pausedAt?: number;
  endsAt?: number;
  completionTimeout?: NodeJS.Timeout;
}

export type TimerCompletedListener = (sessionId: string, state: ClassroomTimerState) => void;

@Injectable()
export class ClassroomTimerRuntimeService {
  private readonly logger = new Logger(ClassroomTimerRuntimeService.name);

  // In-memory session timer storage: sessionId -> state
  private readonly timers = new Map<string, ClassroomTimerInternalState>();

  // Completion listeners registered by gateway
  private readonly completedListeners: TimerCompletedListener[] = [];

  /**
   * Register a callback when any timer finishes.
   */
  onCompleted(listener: TimerCompletedListener): void {
    this.completedListeners.push(listener);
  }

  /**
   * Get or initialize default timer state for a session.
   */
  private getOrCreate(sessionId: string): ClassroomTimerInternalState {
    let state = this.timers.get(sessionId);
    if (!state) {
      state = {
        sessionId,
        status: 'IDLE',
        duration: 300, // 5 minutes default
        remainingSeconds: 300,
        visibility: 'SHARED_TIMER',
      };
      this.timers.set(sessionId, state);
    }
    return state;
  }

  /**
   * Configure/set timer parameters (duration, label, visibility).
   */
  setTimer(
    sessionId: string,
    duration: number,
    label?: string,
    visibility: ClassroomTimerVisibility = 'SHARED_TIMER',
  ): ClassroomTimerState {
    const state = this.getOrCreate(sessionId);

    // Cancel any active completion timeout
    if (state.completionTimeout) {
      clearTimeout(state.completionTimeout);
      state.completionTimeout = undefined;
    }

    const clampedDuration = Math.min(3600, Math.max(5, Math.floor(duration)));

    state.duration = clampedDuration;
    state.remainingSeconds = clampedDuration;
    state.label = label?.trim() || undefined;
    state.visibility = visibility;
    state.status = 'IDLE';
    state.startedAt = undefined;
    state.pausedAt = undefined;
    state.endsAt = undefined;

    this.logger.log(`Session ${sessionId} timer set: ${clampedDuration}s (${visibility})`);
    return this.toPublicState(state);
  }

  /**
   * Start or start new timer with optional parameters.
   */
  startTimer(
    sessionId: string,
    options?: {
      duration?: number;
      label?: string;
      visibility?: ClassroomTimerVisibility;
    },
  ): ClassroomTimerState {
    const state = this.getOrCreate(sessionId);

    // Cancel any previous completion timeout
    if (state.completionTimeout) {
      clearTimeout(state.completionTimeout);
      state.completionTimeout = undefined;
    }

    if (options?.duration !== undefined) {
      const clamped = Math.min(3600, Math.max(5, Math.floor(options.duration)));
      state.duration = clamped;
      state.remainingSeconds = clamped;
    }
    if (options?.label !== undefined) {
      state.label = options.label.trim() || undefined;
    }
    if (options?.visibility !== undefined) {
      state.visibility = options.visibility;
    }

    // If already COMPLETED or 0 remaining, reset remainingSeconds to duration
    if (state.status === 'COMPLETED' || state.remainingSeconds <= 0) {
      state.remainingSeconds = state.duration;
    }

    const now = Date.now();
    const durationMs = state.remainingSeconds * 1000;
    state.startedAt = now;
    state.pausedAt = undefined;
    state.endsAt = now + durationMs;
    state.status = 'RUNNING';

    // Schedule completion timeout
    state.completionTimeout = setTimeout(() => {
      this.handleTimeoutCompletion(sessionId);
    }, durationMs);

    this.logger.log(`Session ${sessionId} timer started: ${state.remainingSeconds}s remaining`);
    return this.toPublicState(state);
  }

  /**
   * Pause a running timer.
   */
  pauseTimer(sessionId: string): ClassroomTimerState {
    const state = this.getOrCreate(sessionId);

    if (state.status !== 'RUNNING') {
      return this.toPublicState(state);
    }

    if (state.completionTimeout) {
      clearTimeout(state.completionTimeout);
      state.completionTimeout = undefined;
    }

    const now = Date.now();
    const msRemaining = Math.max(0, (state.endsAt ?? now) - now);
    const secsRemaining = Math.max(0, Math.ceil(msRemaining / 1000));

    state.remainingSeconds = secsRemaining;
    state.pausedAt = now;
    state.endsAt = undefined;

    if (secsRemaining <= 0) {
      state.status = 'COMPLETED';
    } else {
      state.status = 'PAUSED';
    }

    this.logger.log(`Session ${sessionId} timer paused with ${secsRemaining}s remaining`);
    return this.toPublicState(state);
  }

  /**
   * Resume a paused timer.
   */
  resumeTimer(sessionId: string): ClassroomTimerState {
    const state = this.getOrCreate(sessionId);

    if (state.status !== 'PAUSED') {
      return this.toPublicState(state);
    }

    if (state.completionTimeout) {
      clearTimeout(state.completionTimeout);
      state.completionTimeout = undefined;
    }

    if (state.remainingSeconds <= 0) {
      state.status = 'COMPLETED';
      return this.toPublicState(state);
    }

    const now = Date.now();
    const durationMs = state.remainingSeconds * 1000;
    state.startedAt = now;
    state.pausedAt = undefined;
    state.endsAt = now + durationMs;
    state.status = 'RUNNING';

    state.completionTimeout = setTimeout(() => {
      this.handleTimeoutCompletion(sessionId);
    }, durationMs);

    this.logger.log(`Session ${sessionId} timer resumed with ${state.remainingSeconds}s remaining`);
    return this.toPublicState(state);
  }

  /**
   * Reset timer to configured duration in IDLE state.
   */
  resetTimer(sessionId: string, newDuration?: number): ClassroomTimerState {
    const state = this.getOrCreate(sessionId);

    if (state.completionTimeout) {
      clearTimeout(state.completionTimeout);
      state.completionTimeout = undefined;
    }

    if (newDuration !== undefined) {
      state.duration = Math.min(3600, Math.max(5, Math.floor(newDuration)));
    }

    state.remainingSeconds = state.duration;
    state.status = 'IDLE';
    state.startedAt = undefined;
    state.pausedAt = undefined;
    state.endsAt = undefined;

    this.logger.log(`Session ${sessionId} timer reset to ${state.duration}s`);
    return this.toPublicState(state);
  }

  /**
   * Internal timeout handler when remaining time expires.
   */
  private handleTimeoutCompletion(sessionId: string): void {
    const state = this.timers.get(sessionId);
    if (!state || state.status !== 'RUNNING') return;

    state.completionTimeout = undefined;
    state.remainingSeconds = 0;
    state.status = 'COMPLETED';
    state.endsAt = undefined;

    this.logger.log(`Session ${sessionId} timer completed (00:00)`);
    const publicState = this.toPublicState(state);

    for (const listener of this.completedListeners) {
      try {
        listener(sessionId, publicState);
      } catch (err) {
        this.logger.error(`Error in timer completed listener for ${sessionId}: ${err}`);
      }
    }
  }

  /**
   * Convert internal state to authoritative public state, reconciling dynamic remaining time.
   */
  private toPublicState(state: ClassroomTimerInternalState): ClassroomTimerState {
    const now = Date.now();
    let currentRemaining = state.remainingSeconds;

    if (state.status === 'RUNNING' && state.endsAt) {
      const msLeft = Math.max(0, state.endsAt - now);
      currentRemaining = Math.max(0, Math.ceil(msLeft / 1000));

      if (currentRemaining <= 0) {
        state.status = 'COMPLETED';
        state.remainingSeconds = 0;
        state.endsAt = undefined;
        if (state.completionTimeout) {
          clearTimeout(state.completionTimeout);
          state.completionTimeout = undefined;
        }
      }
    }

    return {
      sessionId: state.sessionId,
      status: state.status,
      duration: state.duration,
      remainingSeconds: currentRemaining,
      label: state.label,
      visibility: state.visibility,
      startedAt: state.startedAt,
      pausedAt: state.pausedAt,
      endsAt: state.endsAt,
      serverTime: now,
    };
  }

  /**
   * Get authoritative snapshot for teacher.
   */
  getTeacherSnapshot(sessionId: string): TeacherClassroomTimerSnapshot {
    const state = this.timers.get(sessionId);
    return {
      timer: state ? this.toPublicState(state) : null,
      serverTime: Date.now(),
    };
  }

  /**
   * Get authoritative snapshot for participant.
   * Returns null if no timer or if timer is PRIVATE_TIMER.
   */
  getParticipantSnapshot(sessionId: string): ParticipantClassroomTimerSnapshot {
    const state = this.timers.get(sessionId);
    if (!state || state.visibility === 'PRIVATE_TIMER') {
      return {
        timer: null,
        serverTime: Date.now(),
      };
    }

    return {
      timer: this.toPublicState(state),
      serverTime: Date.now(),
    };
  }

  /**
   * Clean up timer resources for an ended session.
   */
  clearSession(sessionId: string): void {
    const state = this.timers.get(sessionId);
    if (state?.completionTimeout) {
      clearTimeout(state.completionTimeout);
    }
    this.timers.delete(sessionId);
    this.logger.log(`Cleared timer state for session ${sessionId}`);
  }
}

