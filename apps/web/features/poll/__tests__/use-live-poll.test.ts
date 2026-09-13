import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLivePoll } from '../use-live-poll';

describe('useLivePoll Hook', () => {
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
    it('allows teacher to start poll', () => {
      const { result } = renderHook(() =>
        useLivePoll({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.startPoll('poll-1');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('poll:start', {
        sessionId: 'sess-123',
        pollId: 'poll-1',
      });
    });

    it('updates state when poll:started is received', () => {
      const { result } = renderHook(() =>
        useLivePoll({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['poll:started']?.({
          pollId: 'poll-1',
          title: 'Cek Pemahaman',
          question: 'Paham pecahan desimal?',
          type: 'SINGLE_CHOICE',
          options: [
            { id: 'opt-1', optionText: 'Paham' },
            { id: 'opt-2', optionText: 'Belum' },
          ],
          settings: { allowMultiple: false, showResultsToParticipants: true },
        });
      });

      expect(result.current.isPollActive).toBe(true);
      expect(result.current.title).toBe('Cek Pemahaman');
      expect(result.current.options).toHaveLength(2);
    });

    it('allows teacher to close poll and updates state on poll:closed', () => {
      const { result } = renderHook(() =>
        useLivePoll({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.closePoll();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('poll:close', {
        sessionId: 'sess-123',
      });

      act(() => {
        eventHandlers['poll:closed']?.({
          pollId: 'poll-1',
          distribution: { 'opt-1': 10, 'opt-2': 2 },
          percentages: { 'opt-1': 83, 'opt-2': 17 },
          totalResponses: 12,
        });
      });

      expect(result.current.isPollActive).toBe(false);
      expect(result.current.isPollClosed).toBe(true);
      expect(result.current.distribution['opt-1']).toBe(10);
      expect(result.current.percentages['opt-1']).toBe(83);
      expect(result.current.responseCount).toBe(12);
    });
  });

  describe('Participant Mode', () => {
    it('participant submits response and locks state upon acceptance', () => {
      const { result } = renderHook(() =>
        useLivePoll({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['poll:started']?.({
          pollId: 'poll-1',
          title: 'Cek Pemahaman',
          question: 'Paham pecahan desimal?',
          type: 'SINGLE_CHOICE',
          options: [
            { id: 'opt-1', optionText: 'Paham' },
            { id: 'opt-2', optionText: 'Belum' },
          ],
          settings: { allowMultiple: false, showResultsToParticipants: true },
        });
      });

      expect(result.current.hasResponded).toBe(false);

      act(() => {
        result.current.submitResponse('poll-1', 'opt-1');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('poll:respond', {
        sessionId: 'sess-123',
        pollId: 'poll-1',
        optionId: 'opt-1',
        optionIds: undefined,
      });
      expect(result.current.hasResponded).toBe(true);
      expect(result.current.selectedOptionIds).toEqual(['opt-1']);

      // Server confirmation
      act(() => {
        eventHandlers['poll:response-accepted']?.({
          pollId: 'poll-1',
          selectedOptionIds: ['opt-1'],
        });
      });

      expect(result.current.hasResponded).toBe(true);
      expect(result.current.selectedOptionIds).toEqual(['opt-1']);
    });
  });
});
