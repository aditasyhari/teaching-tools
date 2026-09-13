import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRaiseHand } from '../use-raise-hand';

describe('useRaiseHand Hook', () => {
  let mockSocket: any;
  let eventHandlers: Record<string, Function> = {};

  beforeEach(() => {
    eventHandlers = {};
    mockSocket = {
      connected: true,
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
      off: vi.fn((event: string) => {
        delete eventHandlers[event];
      }),
      emit: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Teacher Mode', () => {
    it('initializes with snapshot from hand:state', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['hand:state']?.({
          queue: [
            {
              id: 'h-1',
              sessionId: 'sess-123',
              participantId: 'p-1',
              displayName: 'Budi',
              status: 'RAISED',
              raisedAt: 1000,
            },
          ],
          currentSpeaker: null,
          raisedCount: 1,
        });
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.raisedCount).toBe(1);
      expect(result.current.queue[0]?.displayName).toBe('Budi');
      expect(result.current.currentSpeaker).toBeNull();
    });

    it('receives new hand from hand:raised and sorts by raisedAt', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['hand:state']?.({
          queue: [
            {
              id: 'h-2',
              sessionId: 'sess-123',
              participantId: 'p-2',
              displayName: 'Siti',
              status: 'RAISED',
              raisedAt: 2000,
            },
          ],
          currentSpeaker: null,
          raisedCount: 1,
        });
      });

      act(() => {
        eventHandlers['hand:raised']?.({
          hand: {
            id: 'h-1',
            sessionId: 'sess-123',
            participantId: 'p-1',
            displayName: 'Ahmad',
            status: 'RAISED',
            raisedAt: 1000, // Earlier than Siti
          },
          queueCount: 2,
        });
      });

      expect(result.current.queue).toHaveLength(2);
      expect(result.current.queue[0]?.id).toBe('h-1'); // Earlier item first
      expect(result.current.queue[1]?.id).toBe('h-2');
      expect(result.current.raisedCount).toBe(2);
    });

    it('handles hand:acknowledged event in queue', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['hand:state']?.({
          queue: [
            {
              id: 'h-1',
              sessionId: 'sess-123',
              participantId: 'p-1',
              displayName: 'Budi',
              status: 'RAISED',
              raisedAt: 1000,
            },
          ],
          currentSpeaker: null,
          raisedCount: 1,
        });
      });

      act(() => {
        eventHandlers['hand:acknowledged']?.({
          handId: 'h-1',
          participantId: 'p-1',
        });
      });

      expect(result.current.queue[0]?.status).toBe('ACKNOWLEDGED');
    });

    it('handles hand:speaking event and updates currentSpeaker', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['hand:state']?.({
          queue: [
            {
              id: 'h-1',
              sessionId: 'sess-123',
              participantId: 'p-1',
              displayName: 'Budi',
              status: 'RAISED',
              raisedAt: 1000,
            },
          ],
          currentSpeaker: null,
          raisedCount: 1,
        });
      });

      act(() => {
        eventHandlers['hand:speaking']?.({
          handId: 'h-1',
          participantId: 'p-1',
          displayName: 'Budi',
        });
      });

      expect(result.current.queue).toHaveLength(0);
      expect(result.current.currentSpeaker).not.toBeNull();
      expect(result.current.currentSpeaker?.displayName).toBe('Budi');
      expect(result.current.currentSpeaker?.status).toBe('SPEAKING');
    });

    it('triggers teacher actions: acknowledgeHand, startSpeaking, lowerParticipantHand, lowerAllHands', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.acknowledgeHand('h-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('hand:acknowledge', {
        sessionId: 'sess-123',
        handId: 'h-1',
      });

      act(() => {
        result.current.startSpeaking('h-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('hand:start-speaking', {
        sessionId: 'sess-123',
        handId: 'h-1',
      });

      act(() => {
        result.current.lowerParticipantHand('h-1');
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('hand:lower-participant', {
        sessionId: 'sess-123',
        handId: 'h-1',
      });

      act(() => {
        result.current.lowerAllHands();
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('hand:lower-all', {
        sessionId: 'sess-123',
      });
    });
  });

  describe('Participant Mode', () => {
    it('initializes with participant snapshot from hand:state', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
          participantId: 'p-1',
        }),
      );

      act(() => {
        eventHandlers['hand:state']?.({
          myHand: {
            id: 'h-1',
            sessionId: 'sess-123',
            participantId: 'p-1',
            displayName: 'Budi',
            status: 'RAISED',
            raisedAt: 1000,
          },
          currentSpeaker: null,
          queuePosition: 1,
          totalRaisedCount: 1,
        });
      });

      expect(result.current.myHand).not.toBeNull();
      expect(result.current.queuePosition).toBe(1);
      expect(result.current.totalRaisedCount).toBe(1);
    });

    it('triggers raiseHand and lowerHand actions with cooldown', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
          participantId: 'p-1',
        }),
      );

      act(() => {
        result.current.raiseHand();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('hand:raise', {
        sessionId: 'sess-123',
      });
      expect(result.current.cooldown).toBe(3);

      // Subsequent call while on cooldown should be ignored
      act(() => {
        result.current.raiseHand();
      });
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });

    it('updates own hand state when receiving hand:speaking and hand:lowered', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
          participantId: 'p-1',
        }),
      );

      act(() => {
        eventHandlers['hand:state']?.({
          myHand: {
            id: 'h-1',
            sessionId: 'sess-123',
            participantId: 'p-1',
            displayName: 'Budi',
            status: 'RAISED',
            raisedAt: 1000,
          },
          currentSpeaker: null,
          queuePosition: 1,
          totalRaisedCount: 1,
        });
      });

      act(() => {
        eventHandlers['hand:speaking']?.({
          handId: 'h-1',
          participantId: 'p-1',
          displayName: 'Budi',
        });
      });

      expect(result.current.myHand?.status).toBe('SPEAKING');
      expect(result.current.queuePosition).toBeNull();

      act(() => {
        eventHandlers['hand:lowered']?.({
          handId: 'h-1',
          participantId: 'p-1',
        });
      });

      expect(result.current.myHand).toBeNull();
    });

    it('handles hand:error event', () => {
      const { result } = renderHook(() =>
        useRaiseHand({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
          participantId: 'p-1',
        }),
      );

      act(() => {
        eventHandlers['hand:error']?.({
          code: 'RAISE_REJECTED',
          message: 'Anda sudah mengangkat tangan',
        });
      });

      expect(result.current.error).toBe('Anda sudah mengangkat tangan');
    });
  });
});
