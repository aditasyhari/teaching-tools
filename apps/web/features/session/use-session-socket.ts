'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  SessionStatus,
  SessionSnapshot,
  ParticipantSessionSnapshot,
  ProjectorSessionSnapshot,
  SessionParticipantJoinedPayload,
  SessionParticipantLeftPayload,
  SessionStartedPayload,
  SessionEndedPayload,
  SessionErrorPayload,
} from '@walikelas/types';
import { SESSION_HEARTBEAT_INTERVAL_MS } from '@walikelas/config';

export type SocketConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';

interface UseSessionSocketOptions {
  isTeacher?: boolean;
  isProjector?: boolean;
  sessionId?: string;
  joinCode?: string;
  displayName?: string;
  onParticipantJoined?: (payload: SessionParticipantJoinedPayload) => void;
  onParticipantLeft?: (payload: SessionParticipantLeftPayload) => void;
  onSessionStarted?: (payload: SessionStartedPayload) => void;
  onSessionEnded?: (payload: SessionEndedPayload) => void;
  onError?: (payload: SessionErrorPayload) => void;
}

export function useSessionSocket(options: UseSessionSocketOptions) {
  const {
    isTeacher = false,
    isProjector = false,
    sessionId,
    joinCode,
    displayName,
    onParticipantJoined,
    onParticipantLeft,
    onSessionStarted,
    onSessionEnded,
    onError,
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>('DISCONNECTED');
  const [snapshot, setSnapshot] = useState<
    SessionSnapshot | ParticipantSessionSnapshot | ProjectorSessionSnapshot | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const participantIdRef = useRef<string | null>(null);
  const reconnectTokenRef = useRef<string | null>(null);

  // Initialize participant ID and reconnect token from sessionStorage for participants
  useEffect(() => {
    if (!isTeacher && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('wk_participant_id');
      if (stored) {
        participantIdRef.current = stored;
      }
      const storedToken = sessionStorage.getItem('wk_reconnect_token');
      if (storedToken) {
        reconnectTokenRef.current = storedToken;
      }
    }
  }, [isTeacher]);

  const callbacksRef = useRef({
    onParticipantJoined,
    onParticipantLeft,
    onSessionStarted,
    onSessionEnded,
    onError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onParticipantJoined,
      onParticipantLeft,
      onSessionStarted,
      onSessionEnded,
      onError,
    };
  });

  const joinSession = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    if (isTeacher) {
      if (!sessionId && !joinCode) return;
      socket.emit('session:join', {
        sessionId,
        joinCode,
        isTeacher: true,
      });
    } else if (isProjector) {
      if (!joinCode) return;
      socket.emit('session:join', {
        joinCode: joinCode.trim().toUpperCase(),
        isProjector: true,
      });
    } else {
      if (!joinCode || !displayName) return;
      const activeParticipantId =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('wk_participant_id')
          : participantIdRef.current;
      const activeReconnectToken =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('wk_reconnect_token')
          : reconnectTokenRef.current;

      socket.emit('session:join', {
        joinCode: joinCode.trim().toUpperCase(),
        displayName: displayName.trim(),
        participantId: activeParticipantId || undefined,
        reconnectToken: activeReconnectToken || undefined,
      });
    }
  }, [isTeacher, isProjector, sessionId, joinCode, displayName]);

  useEffect(() => {
    if (isTeacher && !sessionId && !joinCode) return;
    if (isProjector && !joinCode) return;
    if (!isTeacher && !isProjector && (!joinCode || !displayName)) return;

    // Robust origin resolution: safe against /api/v1 suffix and trailing slashes
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006';
    let socketUrl: string;
    try {
      const parsed = new URL(apiUrl);
      socketUrl = `${parsed.origin}/sessions`;
    } catch {
      const clean = apiUrl.replace(/\/api(\/v\d+)?\/?$/, '').replace(/\/+$/, '');
      socketUrl = clean.endsWith('/sessions') ? clean : `${clean}/sessions`;
    }

    const socket: Socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;
    setSocketInstance(socket);
    setConnectionStatus('CONNECTING');

    socket.on('connect', () => {
      setConnectionStatus('CONNECTED');
      setError(null);
      joinSession();
    });

    socket.on('reconnect_attempt', () => {
      setConnectionStatus('RECONNECTING');
    });

    socket.on('disconnect', (reason) => {
      setConnectionStatus('DISCONNECTED');
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      setConnectionStatus('DISCONNECTED');
      setError(err.message || 'Gagal terhubung ke server');
    });

    // Event: session:state
    socket.on(
      'session:state',
      (data: SessionSnapshot | ParticipantSessionSnapshot | ProjectorSessionSnapshot) => {
        setSnapshot(data);

        // Store participantId and reconnectToken in sessionStorage for reconnect
        if (!isTeacher && !isProjector && 'currentParticipant' in data) {
          participantIdRef.current = data.currentParticipant.id;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('wk_participant_id', data.currentParticipant.id);
            if (data.currentParticipant.reconnectToken) {
              reconnectTokenRef.current = data.currentParticipant.reconnectToken;
              sessionStorage.setItem('wk_reconnect_token', data.currentParticipant.reconnectToken);
            }
          }
        }
      },
    );

    // Event: session:participant-joined
    socket.on('session:participant-joined', (payload: SessionParticipantJoinedPayload) => {
      setSnapshot((prev) => {
        if (!prev) return prev;
        if ('participants' in prev) {
          const exists = prev.participants.some((p) => p.id === payload.participant.id);
          const updatedList = exists
            ? prev.participants.map((p) =>
                p.id === payload.participant.id
                  ? {
                      ...p,
                      isOnline: true,
                      displayName: payload.participant.displayName || p.displayName,
                    }
                  : p,
              )
            : [
                ...prev.participants,
                {
                  id: payload.participant.id,
                  displayName: payload.participant.displayName,
                  joinedAt: new Date().toISOString(),
                  isOnline: true,
                },
              ];
          return {
            ...prev,
            participantCount: payload.count,
            participants: updatedList,
          };
        }
        return {
          ...prev,
          participantCount: payload.count,
        };
      });
      callbacksRef.current.onParticipantJoined?.(payload);
    });

    // Event: session:participant-left
    socket.on('session:participant-left', (payload: SessionParticipantLeftPayload) => {
      setSnapshot((prev) => {
        if (!prev) return prev;
        if ('participants' in prev) {
          return {
            ...prev,
            participantCount: payload.count,
            participants: prev.participants.map((p) =>
              p.id === payload.participantId ? { ...p, isOnline: false } : p,
            ),
          };
        }
        return {
          ...prev,
          participantCount: payload.count,
        };
      });
      callbacksRef.current.onParticipantLeft?.(payload);
    });

    // Event: session:started
    socket.on('session:started', (payload: SessionStartedPayload) => {
      setSnapshot((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'ACTIVE' as SessionStatus,
          startedAt: payload.startedAt,
        };
      });
      callbacksRef.current.onSessionStarted?.(payload);
    });

    // Event: session:ended
    socket.on('session:ended', (payload: SessionEndedPayload) => {
      setSnapshot((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'ENDED' as SessionStatus,
          endedAt: payload.endedAt,
        };
      });
      callbacksRef.current.onSessionEnded?.(payload);
    });

    // Event: session:error
    socket.on('session:error', (payload: SessionErrorPayload) => {
      setError(payload.message);
      callbacksRef.current.onError?.(payload);
    });

    // Heartbeat Interval
    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('session:heartbeat', {
          sessionId: sessionId || snapshot?.id,
          participantId: participantIdRef.current || undefined,
        });
      }
    }, SESSION_HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      socket.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
    };
  }, [
    isTeacher,
    isProjector,
    sessionId,
    joinCode,
    displayName,
    joinSession,
  ]);

  const startSession = useCallback(() => {
    if (!socketRef.current || !sessionId) return;
    // Optimistic update for 0ms button reaction
    setSnapshot((prev) =>
      prev ? { ...prev, status: 'ACTIVE', startedAt: new Date().toISOString() } : prev,
    );
    socketRef.current.emit('session:start', { sessionId });
  }, [sessionId]);

  const endSession = useCallback(() => {
    if (!socketRef.current || !sessionId) return;
    // Optimistic update for 0ms button reaction
    setSnapshot((prev) =>
      prev ? { ...prev, status: 'ENDED', endedAt: new Date().toISOString() } : prev,
    );
    socketRef.current.emit('session:end', { sessionId });
  }, [sessionId]);

  const leaveSession = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('session:leave', {
        sessionId: sessionId || snapshot?.id,
        participantId: participantIdRef.current || undefined,
      });
      socketRef.current.disconnect();
    }
    participantIdRef.current = null;
    reconnectTokenRef.current = null;
    setConnectionStatus('DISCONNECTED');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('wk_participant_id');
      sessionStorage.removeItem('wk_reconnect_token');
      sessionStorage.removeItem('wk_participant_session');
    }
  }, [sessionId, snapshot?.id]);

  return {
    connectionStatus,
    snapshot,
    error,
    startSession,
    endSession,
    leaveSession,
    participantId: participantIdRef.current,
    socket: socketInstance || socketRef.current,
  };
}
