import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionSocket } from '../use-session-socket';

// Mock socket.io-client
const mockSocket = {
  connected: false,
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('useSessionSocket Hook', () => {
  let eventHandlers: Record<string, Function> = {};

  beforeEach(() => {
    eventHandlers = {};
    mockSocket.on.mockImplementation((event: string, handler: Function) => {
      eventHandlers[event] = handler;
    });
    mockSocket.emit.mockClear();
    mockSocket.disconnect.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes socket and joins as teacher', () => {
    const { result } = renderHook(() =>
      useSessionSocket({
        isTeacher: true,
        sessionId: 'sess-123',
      }),
    );

    expect(result.current.connectionStatus).toBe('CONNECTING');

    // Simulate connect event
    act(() => {
      mockSocket.connected = true;
      eventHandlers['connect']?.();
    });

    expect(result.current.connectionStatus).toBe('CONNECTED');
    expect(mockSocket.emit).toHaveBeenCalledWith('session:join', {
      sessionId: 'sess-123',
      joinCode: undefined,
      isTeacher: true,
    });
  });

  it('updates state when session:state event is received', () => {
    const { result } = renderHook(() =>
      useSessionSocket({
        isTeacher: true,
        sessionId: 'sess-123',
      }),
    );

    act(() => {
      mockSocket.connected = true;
      eventHandlers['connect']?.();
      eventHandlers['session:state']?.({
        id: 'sess-123',
        title: 'Kuis IPA',
        joinCode: 'AB7K42',
        status: 'WAITING',
        teacherId: 'teacher-1',
        createdAt: '2026-09-13T03:00:00Z',
        participantCount: 0,
        participants: [],
        serverTime: '2026-09-13T03:00:00Z',
      });
    });

    expect(result.current.snapshot?.id).toBe('sess-123');
    expect(result.current.snapshot?.status).toBe('WAITING');
  });

  it('updates participant roster when session:participant-joined is received', () => {
    const { result } = renderHook(() =>
      useSessionSocket({
        isTeacher: true,
        sessionId: 'sess-123',
      }),
    );

    act(() => {
      mockSocket.connected = true;
      eventHandlers['connect']?.();
      eventHandlers['session:state']?.({
        id: 'sess-123',
        title: 'Kuis IPA',
        joinCode: 'AB7K42',
        status: 'WAITING',
        teacherId: 'teacher-1',
        createdAt: '2026-09-13T03:00:00Z',
        participantCount: 0,
        participants: [],
        serverTime: '2026-09-13T03:00:00Z',
      });
    });

    act(() => {
      eventHandlers['session:participant-joined']?.({
        participant: { id: 'p-1', displayName: 'Budi' },
        count: 1,
      });
    });

    const snapshot = result.current.snapshot as any;
    expect(snapshot.participantCount).toBe(1);
    expect(snapshot.participants).toHaveLength(1);
    expect(snapshot.participants[0]?.displayName).toBe('Budi');
  });

  it('transitions status to ACTIVE on session:started', () => {
    const onStarted = vi.fn();
    const { result } = renderHook(() =>
      useSessionSocket({
        isTeacher: true,
        sessionId: 'sess-123',
        onSessionStarted: onStarted,
      }),
    );

    act(() => {
      mockSocket.connected = true;
      eventHandlers['connect']?.();
      eventHandlers['session:state']?.({
        id: 'sess-123',
        title: 'Kuis IPA',
        joinCode: 'AB7K42',
        status: 'WAITING',
        teacherId: 'teacher-1',
        createdAt: '2026-09-13T03:00:00Z',
        participantCount: 1,
        participants: [],
        serverTime: '2026-09-13T03:00:00Z',
      });
    });

    act(() => {
      eventHandlers['session:started']?.({
        startedAt: '2026-09-13T03:05:00Z',
      });
    });

    expect(result.current.snapshot?.status).toBe('ACTIVE');
    expect(onStarted).toHaveBeenCalled();
  });

  it('transitions status to ENDED on session:ended', () => {
    const onEnded = vi.fn();
    const { result } = renderHook(() =>
      useSessionSocket({
        isTeacher: true,
        sessionId: 'sess-123',
        onSessionEnded: onEnded,
      }),
    );

    act(() => {
      mockSocket.connected = true;
      eventHandlers['connect']?.();
      eventHandlers['session:state']?.({
        id: 'sess-123',
        title: 'Kuis IPA',
        joinCode: 'AB7K42',
        status: 'ACTIVE',
        teacherId: 'teacher-1',
        createdAt: '2026-09-13T03:00:00Z',
        participantCount: 1,
        participants: [],
        serverTime: '2026-09-13T03:00:00Z',
      });
    });

    act(() => {
      eventHandlers['session:ended']?.({
        endedAt: '2026-09-13T03:10:00Z',
      });
    });

    expect(result.current.snapshot?.status).toBe('ENDED');
    expect(onEnded).toHaveBeenCalled();
  });

  it('emits session:start and session:end from hook actions', () => {
    const { result } = renderHook(() =>
      useSessionSocket({
        isTeacher: true,
        sessionId: 'sess-123',
      }),
    );

    act(() => {
      result.current.startSession();
    });
    expect(mockSocket.emit).toHaveBeenCalledWith('session:start', { sessionId: 'sess-123' });

    act(() => {
      result.current.endSession();
    });
    expect(mockSocket.emit).toHaveBeenCalledWith('session:end', { sessionId: 'sess-123' });
  });
});
