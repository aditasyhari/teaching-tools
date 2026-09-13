'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  RaisedHandItem,
  TeacherRaiseHandSnapshot,
  ParticipantRaiseHandSnapshot,
  HandRaisedEvent,
  HandAcknowledgedEvent,
  HandSpeakingEvent,
  HandLoweredEvent,
  HandQueueUpdateEvent,
  HandErrorEvent,
} from '@walikelas/types';

interface UseRaiseHandOptions {
  socket: Socket | null;
  sessionId?: string;
  isTeacher?: boolean;
  participantId?: string | null;
}

export function useRaiseHand({
  socket,
  sessionId,
  isTeacher = false,
  participantId,
}: UseRaiseHandOptions) {
  // Teacher state
  const [queue, setQueue] = useState<RaisedHandItem[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<RaisedHandItem | null>(null);
  const [raisedCount, setRaisedCount] = useState<number>(0);

  // Participant state
  const [myHand, setMyHand] = useState<RaisedHandItem | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [totalRaisedCount, setTotalRaisedCount] = useState<number>(0);
  const [participantCurrentSpeaker, setParticipantCurrentSpeaker] = useState<{
    displayName: string;
  } | null>(null);

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown countdown (3s)
  const [cooldown, setCooldown] = useState(0);

  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const participantIdRef = useRef(participantId);
  useEffect(() => {
    participantIdRef.current = participantId;
  }, [participantId]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!socket) return;

    // Snapshot on join or reconnect
    const onHandState = (state: TeacherRaiseHandSnapshot | ParticipantRaiseHandSnapshot) => {
      if (!state) return;

      if (isTeacher) {
        const tState = state as TeacherRaiseHandSnapshot;
        setQueue(tState.queue || []);
        setCurrentSpeaker(tState.currentSpeaker || null);
        setRaisedCount(tState.raisedCount || 0);
      } else {
        const pState = state as ParticipantRaiseHandSnapshot;
        setMyHand(pState.myHand || null);
        setQueuePosition(pState.queuePosition || null);
        setTotalRaisedCount(pState.totalRaisedCount || 0);
        setParticipantCurrentSpeaker(pState.currentSpeaker || null);
      }
      setIsLoading(false);
    };

    // Teacher & Session: A participant raised hand
    const onHandRaised = (payload: HandRaisedEvent) => {
      if (isTeacher) {
        setQueue((prev) => {
          if (prev.some((h) => h.id === payload.hand.id)) return prev;
          const next = [...prev, payload.hand];
          return next.sort((a, b) => a.raisedAt - b.raisedAt);
        });
        setRaisedCount(payload.queueCount);
      }
    };

    // All: Hand acknowledged by teacher
    const onHandAcknowledged = (payload: HandAcknowledgedEvent) => {
      if (isTeacher) {
        setQueue((prev) =>
          prev.map((h) => (h.id === payload.handId ? { ...h, status: 'ACKNOWLEDGED' } : h)),
        );
      } else {
        if (participantIdRef.current && payload.participantId === participantIdRef.current) {
          setMyHand((prev) => (prev ? { ...prev, status: 'ACKNOWLEDGED' } : null));
          setSuccessMessage('Guru telah melihat tangan Anda');
        }
      }
    };

    // All: Participant granted speaking turn
    const onHandSpeaking = (payload: HandSpeakingEvent) => {
      setParticipantCurrentSpeaker({ displayName: payload.displayName });

      if (isTeacher) {
        setQueue((prev) => {
          const target = prev.find((h) => h.id === payload.handId);
          if (target) {
            setCurrentSpeaker({ ...target, status: 'SPEAKING' });
          } else {
            setCurrentSpeaker({
              id: payload.handId,
              sessionId: sessionIdRef.current || '',
              participantId: payload.participantId,
              displayName: payload.displayName,
              status: 'SPEAKING',
              raisedAt: Date.now(),
            });
          }
          return prev.filter((h) => h.id !== payload.handId);
        });
        setRaisedCount((prev) => Math.max(0, prev - 1));
      } else {
        if (participantIdRef.current && payload.participantId === participantIdRef.current) {
          setMyHand((prev) => (prev ? { ...prev, status: 'SPEAKING' } : null));
          setQueuePosition(null);
          setSuccessMessage('Giliran Anda berbicara! Silakan berbicara sekarang.');
        }
      }
    };

    // All: Hand lowered (by teacher or self)
    const onHandLowered = (payload: HandLoweredEvent) => {
      if (isTeacher) {
        setQueue((prev) => prev.filter((h) => h.id !== payload.handId));
        setCurrentSpeaker((current) => (current?.id === payload.handId ? null : current));
        setRaisedCount((prev) => Math.max(0, prev - 1));
      } else {
        if (participantIdRef.current && payload.participantId === participantIdRef.current) {
          setMyHand(null);
          setQueuePosition(null);
        }
        setParticipantCurrentSpeaker((current) => {
          // If the lowered participant was current speaker, clear speaker
          if (current && payload.participantId === participantIdRef.current) {
            return null;
          }
          return current;
        });
      }
    };

    // All: Queue count updated
    const onQueueUpdate = (payload: HandQueueUpdateEvent) => {
      setRaisedCount(payload.queueCount);
      setTotalRaisedCount(payload.queueCount);
    };

    // All: All hands lowered by teacher
    const onAllHandsLowered = () => {
      if (isTeacher) {
        setQueue([]);
        setCurrentSpeaker(null);
        setRaisedCount(0);
      } else {
        setMyHand(null);
        setQueuePosition(null);
        setTotalRaisedCount(0);
        setParticipantCurrentSpeaker(null);
      }
      setSuccessMessage('Semua tangan telah diturunkan');
    };

    // Error event
    const onHandError = (payload: HandErrorEvent) => {
      setIsLoading(false);
      setError(payload.message || 'Terjadi kesalahan pada angkat tangan');
    };

    socket.on('hand:state', onHandState);
    socket.on('hand:raised', onHandRaised);
    socket.on('hand:acknowledged', onHandAcknowledged);
    socket.on('hand:speaking', onHandSpeaking);
    socket.on('hand:lowered', onHandLowered);
    socket.on('hand:queue-update', onQueueUpdate);
    socket.on('hand:all-lowered', onAllHandsLowered);
    socket.on('hand:error', onHandError);

    return () => {
      socket.off('hand:state', onHandState);
      socket.off('hand:raised', onHandRaised);
      socket.off('hand:acknowledged', onHandAcknowledged);
      socket.off('hand:speaking', onHandSpeaking);
      socket.off('hand:lowered', onHandLowered);
      socket.off('hand:queue-update', onQueueUpdate);
      socket.off('hand:all-lowered', onAllHandsLowered);
      socket.off('hand:error', onHandError);
    };
  }, [socket, isTeacher]);

  // Actions for Participant: Raise Hand
  const raiseHand = useCallback(() => {
    if (!socket || !sessionIdRef.current || cooldown > 0) return;
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setCooldown(3);

    socket.emit('hand:raise', {
      sessionId: sessionIdRef.current,
    });
  }, [socket, cooldown]);

  // Actions for Participant: Lower Hand (self-lower)
  const lowerHand = useCallback(() => {
    if (!socket || !sessionIdRef.current || cooldown > 0) return;
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setCooldown(3);

    socket.emit('hand:lower', {
      sessionId: sessionIdRef.current,
    });
  }, [socket, cooldown]);

  // Actions for Teacher: Acknowledge hand in queue
  const acknowledgeHand = useCallback(
    (handId: string) => {
      if (!socket || !sessionIdRef.current) return;
      socket.emit('hand:acknowledge', {
        sessionId: sessionIdRef.current,
        handId,
      });
    },
    [socket],
  );

  // Actions for Teacher: Grant speaking turn
  const startSpeaking = useCallback(
    (handId: string) => {
      if (!socket || !sessionIdRef.current) return;
      setError(null);
      socket.emit('hand:start-speaking', {
        sessionId: sessionIdRef.current,
        handId,
      });
    },
    [socket],
  );

  // Actions for Teacher: Lower specific participant hand / end speaking turn
  const lowerParticipantHand = useCallback(
    (handId: string) => {
      if (!socket || !sessionIdRef.current) return;
      socket.emit('hand:lower-participant', {
        sessionId: sessionIdRef.current,
        handId,
      });
    },
    [socket],
  );

  // Actions for Teacher: Lower all hands
  const lowerAllHands = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    socket.emit('hand:lower-all', {
      sessionId: sessionIdRef.current,
    });
  }, [socket]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  return {
    // Teacher data
    queue,
    currentSpeaker,
    raisedCount,

    // Participant data
    myHand,
    queuePosition,
    totalRaisedCount,
    participantCurrentSpeaker,

    // Shared state
    isLoading,
    error,
    successMessage,
    cooldown,

    // Actions
    raiseHand,
    lowerHand,
    acknowledgeHand,
    startSpeaking,
    lowerParticipantHand,
    lowerAllHands,
    clearError,
    clearSuccess,
  };
}
