'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  BrainstormActivity,
  BrainstormIdea,
  SharedBrainstormIdea,
  ParticipantBrainstormIdea,
  TeacherBrainstormSnapshot,
  ParticipantBrainstormSnapshot,
  BrainstormSubmissionMode,
  BrainstormOpenedEvent,
  BrainstormPausedEvent,
  BrainstormClosedEvent,
  BrainstormIdeaHiddenEvent,
  BrainstormIdeaRestoredEvent,
  BrainstormErrorEvent,
  BrainstormActivityStatus,
  BrainstormSettings,
} from '@walikelas/types';

interface UseBrainstormOptions {
  socket: Socket | null;
  sessionId?: string;
  isTeacher?: boolean;
}

export function useBrainstorm({ socket, sessionId, isTeacher = false }: UseBrainstormOptions) {
  // Teacher state
  const [activity, setActivity] = useState<BrainstormActivity | null>(null);
  const [ideas, setIdeas] = useState<BrainstormIdea[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [hiddenCount, setHiddenCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Participant state
  const [participantActivity, setParticipantActivity] = useState<{
    id: string;
    prompt: string;
    status: BrainstormActivityStatus;
    settings: BrainstormSettings;
  } | null>(null);
  const [myIdeas, setMyIdeas] = useState<ParticipantBrainstormIdea[]>([]);
  const [sharedIdeas, setSharedIdeas] = useState<SharedBrainstormIdea[]>([]);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [totalIdeasCount, setTotalIdeasCount] = useState<number>(0);

  // Common UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onBrainstormState = (
      state: TeacherBrainstormSnapshot | ParticipantBrainstormSnapshot,
    ) => {
      if (!state) return;

      if (isTeacher) {
        const tState = state as TeacherBrainstormSnapshot;
        setActivity(tState.activity || null);
        setIdeas(tState.ideas || []);
        setVisibleCount(tState.visibleCount || 0);
        setHiddenCount(tState.hiddenCount || 0);
        setTotalCount(tState.totalCount || 0);
      } else {
        const pState = state as ParticipantBrainstormSnapshot;
        setParticipantActivity(pState.activity || null);
        setMyIdeas(pState.myIdeas || []);
        setSharedIdeas(pState.ideas || []);
        setCanSubmit(pState.canSubmit ?? pState.activity?.status === 'OPEN');
        setTotalIdeasCount(pState.totalIdeasCount || 0);
      }
    };

    const onBrainstormOpened = (payload: BrainstormOpenedEvent) => {
      if (isTeacher) {
        setActivity((prev) =>
          prev ? { ...prev, status: 'OPEN', openedAt: payload.openedAt } : null,
        );
      } else {
        setParticipantActivity((prev) => (prev ? { ...prev, status: 'OPEN' } : null));
        setCanSubmit(true);
      }
    };

    const onBrainstormPaused = (payload: BrainstormPausedEvent) => {
      if (isTeacher) {
        setActivity((prev) =>
          prev ? { ...prev, status: 'PAUSED', pausedAt: payload.pausedAt } : null,
        );
      } else {
        setParticipantActivity((prev) => (prev ? { ...prev, status: 'PAUSED' } : null));
        setCanSubmit(false);
      }
    };

    const onBrainstormClosed = (payload: BrainstormClosedEvent) => {
      if (isTeacher) {
        setActivity((prev) =>
          prev ? { ...prev, status: 'CLOSED', closedAt: payload.closedAt } : null,
        );
      } else {
        setParticipantActivity((prev) => (prev ? { ...prev, status: 'CLOSED' } : null));
        setCanSubmit(false);
      }
    };

    const onBrainstormIdeaCreated = (payload: any) => {
      if (isTeacher && payload.idea) {
        setIdeas((prev) => {
          if (prev.some((i) => i.id === payload.idea.id)) return prev;
          return [payload.idea, ...prev];
        });
        if (payload.visibleCount !== undefined) setVisibleCount(payload.visibleCount);
        if (payload.totalCount !== undefined) setTotalCount(payload.totalCount);
      } else if (!isTeacher && payload.idea) {
        setSharedIdeas((prev) => {
          if (prev.some((i) => i.id === payload.idea.id)) return prev;
          return [payload.idea, ...prev];
        });
        if (payload.totalCount !== undefined) setTotalIdeasCount(payload.totalCount);
      }
    };

    const onBrainstormIdeaSubmitted = (payload: { idea: ParticipantBrainstormIdea }) => {
      setIsSubmitting(false);
      setCooldown(3);
      setSuccessMessage('Ide Anda berhasil dikirim ke papan!');
      setMyIdeas((prev) => {
        if (prev.some((i) => i.id === payload.idea.id)) return prev;
        return [payload.idea, ...prev];
      });
    };

    const onBrainstormIdeaHidden = (payload: BrainstormIdeaHiddenEvent) => {
      if (isTeacher) {
        setIdeas((prev) =>
          prev.map((i) => (i.id === payload.ideaId ? { ...i, status: 'HIDDEN' } : i)),
        );
        setVisibleCount(payload.totalCount);
        setHiddenCount((prev) => prev + 1);
      } else {
        setSharedIdeas((prev) => prev.filter((i) => i.id !== payload.ideaId));
        setTotalIdeasCount(payload.totalCount);
      }
    };

    const onBrainstormIdeaRestored = (payload: BrainstormIdeaRestoredEvent) => {
      if (isTeacher) {
        setIdeas((prev) =>
          prev.map((i) => (i.id === payload.idea.id ? { ...i, status: 'VISIBLE' } : i)),
        );
        setVisibleCount(payload.totalCount);
        setHiddenCount((prev) => Math.max(0, prev - 1));
      } else {
        setSharedIdeas((prev) => {
          if (prev.some((i) => i.id === payload.idea.id)) return prev;
          return [payload.idea, ...prev];
        });
        setTotalIdeasCount(payload.totalCount);
      }
    };

    const onBrainstormError = (payload: BrainstormErrorEvent) => {
      setIsSubmitting(false);
      setError(payload.message || 'Terjadi kesalahan pada papan ide');
    };

    socket.on('brainstorm:state', onBrainstormState);
    socket.on('brainstorm:opened', onBrainstormOpened);
    socket.on('brainstorm:paused', onBrainstormPaused);
    socket.on('brainstorm:closed', onBrainstormClosed);
    socket.on('brainstorm:idea-created', onBrainstormIdeaCreated);
    socket.on('brainstorm:idea-submitted', onBrainstormIdeaSubmitted);
    socket.on('brainstorm:idea-hidden', onBrainstormIdeaHidden);
    socket.on('brainstorm:idea-restored', onBrainstormIdeaRestored);
    socket.on('brainstorm:error', onBrainstormError);

    return () => {
      socket.off('brainstorm:state', onBrainstormState);
      socket.off('brainstorm:opened', onBrainstormOpened);
      socket.off('brainstorm:paused', onBrainstormPaused);
      socket.off('brainstorm:closed', onBrainstormClosed);
      socket.off('brainstorm:idea-created', onBrainstormIdeaCreated);
      socket.off('brainstorm:idea-submitted', onBrainstormIdeaSubmitted);
      socket.off('brainstorm:idea-hidden', onBrainstormIdeaHidden);
      socket.off('brainstorm:idea-restored', onBrainstormIdeaRestored);
      socket.off('brainstorm:error', onBrainstormError);
    };
  }, [socket, isTeacher]);

  // Teacher actions
  const createActivity = useCallback(
    (
      prompt: string,
      options?: {
        isAnonymous?: boolean;
        ideasVisibleToParticipants?: boolean;
        submissionMode?: BrainstormSubmissionMode;
      },
    ) => {
      if (!socket || !sessionIdRef.current) return;
      setError(null);
      socket.emit('brainstorm:create', {
        sessionId: sessionIdRef.current,
        prompt: prompt.trim(),
        isAnonymous: options?.isAnonymous ?? false,
        ideasVisibleToParticipants: options?.ideasVisibleToParticipants ?? false,
        submissionMode: options?.submissionMode ?? 'MULTIPLE_PER_PARTICIPANT',
      });
    },
    [socket],
  );

  const openActivity = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    setError(null);
    socket.emit('brainstorm:open', { sessionId: sessionIdRef.current });
  }, [socket]);

  const pauseActivity = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    setError(null);
    socket.emit('brainstorm:pause', { sessionId: sessionIdRef.current });
  }, [socket]);

  const closeActivity = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    setError(null);
    socket.emit('brainstorm:close', { sessionId: sessionIdRef.current });
  }, [socket]);

  const hideIdea = useCallback(
    (ideaId: string) => {
      if (!socket || !sessionIdRef.current) return;
      setError(null);
      socket.emit('brainstorm:hide', {
        sessionId: sessionIdRef.current,
        ideaId,
      });
    },
    [socket],
  );

  const restoreIdea = useCallback(
    (ideaId: string) => {
      if (!socket || !sessionIdRef.current) return;
      setError(null);
      socket.emit('brainstorm:restore', {
        sessionId: sessionIdRef.current,
        ideaId,
      });
    },
    [socket],
  );

  // Participant actions
  const submitIdea = useCallback(
    (content: string) => {
      if (!socket || !sessionIdRef.current) return;
      if (cooldown > 0) {
        setError(`Mohon tunggu ${cooldown} detik sebelum mengirim ide lagi`);
        return;
      }
      const trimmed = content.trim();
      if (!trimmed) {
        setError('Ide tidak boleh kosong');
        return;
      }
      if (trimmed.length > 300) {
        setError('Ide maksimal 300 karakter');
        return;
      }

      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);
      socket.emit('brainstorm:submit', {
        sessionId: sessionIdRef.current,
        content: trimmed,
      });
    },
    [socket, cooldown],
  );

  const clearError = useCallback(() => setError(null), []);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

  return {
    // Teacher state & actions
    activity,
    ideas,
    visibleCount,
    hiddenCount,
    totalCount,
    createActivity,
    openActivity,
    pauseActivity,
    closeActivity,
    hideIdea,
    restoreIdea,

    // Participant state & actions
    participantActivity,
    myIdeas,
    sharedIdeas,
    canSubmit,
    totalIdeasCount,
    submitIdea,

    // UI helper states
    isSubmitting,
    cooldown,
    error,
    successMessage,
    clearError,
    clearSuccessMessage,
  };
}
