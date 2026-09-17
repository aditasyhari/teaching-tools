'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  ExitTicketActivity,
  ExitTicketAggregates,
  TeacherExitTicketSnapshot,
  ParticipantExitTicketSnapshot,
  ExitTicketAnswer,
  ExitTicketQuestionType,
  ExitTicketScaleConfig,
  ExitTicketOption,
  ExitTicketOpenedEvent,
  ExitTicketClosedEvent,
  ExitTicketResponseSubmittedEvent,
  ExitTicketResultsUpdatedEvent,
  ExitTicketErrorEvent,
  ExitTicketStatus,
  ExitTicketQuestion,
} from '@walikelas/types';

interface UseExitTicketOptions {
  socket: Socket | null;
  sessionId?: string;
  isTeacher?: boolean;
}

export function useExitTicket({ socket, sessionId, isTeacher = false }: UseExitTicketOptions) {
  // Teacher state
  const [activity, setActivity] = useState<ExitTicketActivity | null>(null);
  const [aggregates, setAggregates] = useState<ExitTicketAggregates | null>(null);
  const [responseCount, setResponseCount] = useState<number>(0);
  const [totalExpected, setTotalExpected] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);

  // Participant state
  const [participantActivity, setParticipantActivity] = useState<{
    id: string;
    title: string;
    status: ExitTicketStatus;
    isAnonymous: boolean;
    questions: ExitTicketQuestion[];
  } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [submittedAt, setSubmittedAt] = useState<number | undefined>(undefined);

  // Common UI states
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

    const onExitTicketState = (
      state: TeacherExitTicketSnapshot | ParticipantExitTicketSnapshot,
    ) => {
      if (!state) return;

      if (isTeacher) {
        const tState = state as TeacherExitTicketSnapshot;
        setActivity(tState.activity || null);
        setAggregates(tState.aggregates || null);
        setResponseCount(tState.responseCount || 0);
        setTotalExpected(tState.totalExpected || 0);
        setCompletionRate(tState.completionRate || 0);
      } else {
        const pState = state as ParticipantExitTicketSnapshot;
        setParticipantActivity(pState.activity || null);
        setHasSubmitted(pState.hasSubmitted || false);
        setSubmittedAt(pState.submittedAt);
      }
    };

    const onExitTicketOpened = (payload: ExitTicketOpenedEvent) => {
      if (isTeacher) {
        setActivity((prev) =>
          prev ? { ...prev, status: 'OPEN', openedAt: payload.openedAt } : null,
        );
      } else {
        setParticipantActivity((prev) => (prev ? { ...prev, status: 'OPEN' } : null));
      }
    };

    const onExitTicketClosed = (payload: ExitTicketClosedEvent) => {
      if (isTeacher) {
        setActivity((prev) =>
          prev ? { ...prev, status: 'CLOSED', closedAt: payload.closedAt } : null,
        );
      } else {
        setParticipantActivity((prev) => (prev ? { ...prev, status: 'CLOSED' } : null));
      }
    };

    const onExitTicketResponseSubmitted = (payload: ExitTicketResponseSubmittedEvent) => {
      setIsSubmitting(false);
      setHasSubmitted(true);
      setSubmittedAt(payload.submittedAt);
      setSuccessMessage('Refleksi Anda berhasil dikirim ke guru!');
    };

    const onExitTicketResultsUpdated = (payload: ExitTicketResultsUpdatedEvent) => {
      if (isTeacher) {
        setResponseCount(payload.responseCount);
        setCompletionRate(payload.completionRate);
        setAggregates(payload.aggregates);
      }
    };

    const onExitTicketError = (payload: ExitTicketErrorEvent) => {
      setIsSubmitting(false);
      setError(payload.message || 'Terjadi kesalahan pada Exit Ticket');
    };

    socket.on('exit-ticket:state', onExitTicketState);
    socket.on('exit-ticket:opened', onExitTicketOpened);
    socket.on('exit-ticket:closed', onExitTicketClosed);
    socket.on('exit-ticket:response-submitted', onExitTicketResponseSubmitted);
    socket.on('exit-ticket:results-updated', onExitTicketResultsUpdated);
    socket.on('exit-ticket:error', onExitTicketError);

    return () => {
      socket.off('exit-ticket:state', onExitTicketState);
      socket.off('exit-ticket:opened', onExitTicketOpened);
      socket.off('exit-ticket:closed', onExitTicketClosed);
      socket.off('exit-ticket:response-submitted', onExitTicketResponseSubmitted);
      socket.off('exit-ticket:results-updated', onExitTicketResultsUpdated);
      socket.off('exit-ticket:error', onExitTicketError);
    };
  }, [socket, isTeacher]);

  // Teacher actions
  const createActivity = useCallback(
    (
      title: string,
      isAnonymous: boolean,
      questions: Array<{
        type: ExitTicketQuestionType;
        prompt: string;
        required?: boolean;
        scale?: ExitTicketScaleConfig;
        options?: ExitTicketOption[];
      }>,
    ) => {
      if (!socket || !sessionIdRef.current) return;
      setError(null);
      socket.emit('exit-ticket:create', {
        sessionId: sessionIdRef.current,
        title: title.trim() || 'Exit Ticket',
        isAnonymous,
        questions,
      });
    },
    [socket],
  );

  const openActivity = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    setError(null);
    // Optimistic 0ms update
    setActivity((prev) => (prev ? { ...prev, status: 'OPEN' } : prev));
    socket.emit('exit-ticket:open', { sessionId: sessionIdRef.current });
  }, [socket]);

  const closeActivity = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    setError(null);
    // Optimistic 0ms update
    setActivity((prev) => (prev ? { ...prev, status: 'CLOSED' } : prev));
    socket.emit('exit-ticket:close', { sessionId: sessionIdRef.current });
  }, [socket]);

  // Participant action
  const submitResponse = useCallback(
    (answers: ExitTicketAnswer[]) => {
      if (!socket || !sessionIdRef.current) return;
      if (hasSubmitted) {
        setError('Anda sudah mengirimkan refleksi untuk sesi ini');
        return;
      }
      if (cooldown > 0) {
        setError(`Mohon tunggu ${cooldown} detik sebelum mencoba lagi`);
        return;
      }
      if (!answers || answers.length === 0) {
        setError('Jawaban tidak boleh kosong');
        return;
      }

      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);
      setCooldown(3);

      socket.emit('exit-ticket:submit', {
        sessionId: sessionIdRef.current,
        answers,
      });
    },
    [socket, hasSubmitted, cooldown],
  );

  const clearError = useCallback(() => setError(null), []);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

  return {
    // Teacher state & actions
    activity,
    aggregates,
    responseCount,
    totalExpected,
    completionRate,
    createActivity,
    openActivity,
    closeActivity,

    // Participant state & actions
    participantActivity,
    hasSubmitted,
    submittedAt,
    submitResponse,

    // UI helpers
    isSubmitting,
    cooldown,
    error,
    successMessage,
    clearError,
    clearSuccessMessage,
  };
}
