'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  TeacherLivePollSnapshot,
  ParticipantLivePollSnapshot,
  PollOption,
  PollSettings,
  PollStartedEvent,
  PollResponseAcceptedEvent,
  PollStatsUpdateEvent,
  PollClosedEvent,
  PollErrorEvent,
} from '@walikelas/types';

interface UseLivePollOptions {
  socket: Socket | null;
  sessionId?: string;
  isTeacher?: boolean;
}

export function useLivePoll({ socket, sessionId, isTeacher = false }: UseLivePollOptions) {
  // Common states
  const [isPollActive, setIsPollActive] = useState(false);
  const [isPollClosed, setIsPollClosed] = useState(false);
  const [pollError, setQuizError] = useState<string | null>(null);

  // Poll metadata
  const [pollId, setPollId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<PollOption[]>([]);
  const [settings, setSettings] = useState<PollSettings>({
    allowMultiple: false,
    showResultsToParticipants: true,
    isAnonymous: true,
  });

  // Response statistics (Teacher & Participant if allowed)
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [responseCount, setResponseCount] = useState<number>(0);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [responseRate, setResponseRate] = useState<number>(0);

  // Teacher specific state
  const [teacherSnapshot, setTeacherSnapshot] = useState<TeacherLivePollSnapshot | null>(null);

  // Participant specific state
  const [hasResponded, setHasResponded] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  // Keep ref to avoid stale state in callbacks
  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (!socket) return;

    // Event: poll:started
    const onPollStarted = (payload: PollStartedEvent) => {
      setIsPollActive(true);
      setIsPollClosed(false);
      setPollId(payload.pollId);
      setTitle(payload.title);
      setQuestion(payload.question);
      setOptions(payload.options);
      setSettings(payload.settings);
      setDistribution({});
      setPercentages({});
      setResponseCount(0);
      setQuizError(null);

      if (!isTeacher) {
        setHasResponded(false);
        setSelectedOptionIds([]);
      }
    };

    // Event: poll:state (authoritative snapshot on join / reconnect)
    const onPollState = (state: TeacherLivePollSnapshot | ParticipantLivePollSnapshot | null) => {
      if (!state) {
        setIsPollActive(false);
        setIsPollClosed(false);
        return;
      }

      setPollId(state.pollId);
      setTitle(state.title);
      setQuestion(state.question);
      setOptions(state.options);
      setSettings(state.settings);
      setIsPollActive(state.status === 'LIVE');
      setIsPollClosed(state.status === 'CLOSED');

      if (state.distribution) {
        setDistribution(state.distribution);
      }
      if (state.percentages) {
        setPercentages(state.percentages);
      }

      if (isTeacher) {
        const tState = state as TeacherLivePollSnapshot;
        setTeacherSnapshot(tState);
        setResponseCount(tState.responseCount || 0);
        setTotalParticipants(tState.totalParticipants || 0);
        setResponseRate(tState.responseRate || 0);
      } else {
        const pState = state as ParticipantLivePollSnapshot;
        setHasResponded(pState.hasResponded);
        setSelectedOptionIds(pState.selectedOptionIds || []);
      }
    };

    // Event: poll:response-accepted (sent to participant)
    const onResponseAccepted = (payload: PollResponseAcceptedEvent) => {
      setHasResponded(true);
      setSelectedOptionIds(payload.selectedOptionIds);
    };

    // Event: poll:stats-update (sent to room)
    const onStatsUpdate = (payload: PollStatsUpdateEvent) => {
      setResponseCount(payload.responseCount);
      setTotalParticipants(payload.totalParticipants);
      setResponseRate(payload.responseRate);
      if (payload.distribution) {
        setDistribution(payload.distribution);
      }
      if (payload.percentages) {
        setPercentages(payload.percentages);
      }
    };

    // Event: poll:closed (reveals final results to room)
    const onPollClosed = (payload: PollClosedEvent) => {
      setIsPollActive(false);
      setIsPollClosed(true);
      setDistribution(payload.distribution);
      setPercentages(payload.percentages);
      setResponseCount(payload.totalResponses);
    };

    // Event: poll:error
    const onPollError = (payload: PollErrorEvent) => {
      setQuizError(payload.message || 'Terjadi kesalahan pada polling');
    };

    socket.on('poll:started', onPollStarted);
    socket.on('poll:state', onPollState);
    socket.on('poll:response-accepted', onResponseAccepted);
    socket.on('poll:stats-update', onStatsUpdate);
    socket.on('poll:closed', onPollClosed);
    socket.on('poll:error', onPollError);

    return () => {
      socket.off('poll:started', onPollStarted);
      socket.off('poll:state', onPollState);
      socket.off('poll:response-accepted', onResponseAccepted);
      socket.off('poll:stats-update', onStatsUpdate);
      socket.off('poll:closed', onPollClosed);
      socket.off('poll:error', onPollError);
    };
  }, [socket, isTeacher]);

  // Actions for Teacher
  const startPoll = useCallback(
    (targetPollId: string) => {
      if (!socket || !sessionIdRef.current) return;
      socket.emit('poll:start', {
        sessionId: sessionIdRef.current,
        pollId: targetPollId,
      });
    },
    [socket],
  );

  const closePoll = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    socket.emit('poll:close', {
      sessionId: sessionIdRef.current,
    });
  }, [socket]);

  // Action for Participant
  const submitResponse = useCallback(
    (targetPollId: string, optionId?: string, optionIds?: string[]) => {
      if (!socket || !sessionIdRef.current || hasResponded) return;
      socket.emit('poll:respond', {
        sessionId: sessionIdRef.current,
        pollId: targetPollId,
        optionId,
        optionIds,
      });

      // Optimistic update
      const chosen = optionIds || (optionId ? [optionId] : []);
      setSelectedOptionIds(chosen);
      setHasResponded(true);
    },
    [socket, hasResponded],
  );

  return {
    isPollActive,
    isPollClosed,
    pollError,
    pollId,
    title,
    question,
    options,
    settings,
    distribution,
    percentages,
    responseCount,
    totalParticipants,
    responseRate,
    teacherSnapshot,
    hasResponded,
    selectedOptionIds,
    startPoll,
    closePoll,
    submitResponse,
  };
}
