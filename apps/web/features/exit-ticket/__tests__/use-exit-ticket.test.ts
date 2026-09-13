import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExitTicket } from '../use-exit-ticket';
import type { TeacherExitTicketSnapshot, ParticipantExitTicketSnapshot } from '@walikelas/types';

describe('useExitTicket Hook', () => {
  let mockSocket: any;
  let eventHandlers: Record<string, Function> = {};

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Teacher Mode', () => {
    it('initializes with snapshot from exit-ticket:state', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      const snapshot: TeacherExitTicketSnapshot = {
        activity: {
          id: 'et-1',
          sessionId: 'sess-123',
          title: 'Refleksi Akhir Pertemuan',
          status: 'DRAFT',
          isAnonymous: false,
          questions: [
            {
              id: 'q-1',
              type: 'SCALE',
              prompt: 'Seberapa paham materi hari ini?',
              required: true,
              order: 1,
              scale: { min: 1, max: 5, minLabel: 'Kurang', maxLabel: 'Sangat Paham' },
            },
          ],
          createdAt: 1000,
        },
        aggregates: {
          responseCount: 0,
          totalExpected: 25,
          completionRate: 0,
          questionAggregates: {},
        },
        responseCount: 0,
        totalExpected: 25,
        completionRate: 0,
      };

      act(() => {
        eventHandlers['exit-ticket:state']?.(snapshot);
      });

      expect(result.current.activity?.id).toBe('et-1');
      expect(result.current.activity?.title).toBe('Refleksi Akhir Pertemuan');
      expect(result.current.activity?.status).toBe('DRAFT');
      expect(result.current.totalExpected).toBe(25);
    });

    it('creates activity via createActivity and emits exit-ticket:create', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        result.current.createActivity('Refleksi Bab 1', true, [
          {
            type: 'SHORT_TEXT',
            prompt: 'Poin penting yang kamu pelajari?',
            required: true,
          },
        ]);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('exit-ticket:create', {
        sessionId: 'sess-123',
        title: 'Refleksi Bab 1',
        isAnonymous: true,
        questions: [
          {
            type: 'SHORT_TEXT',
            prompt: 'Poin penting yang kamu pelajari?',
            required: true,
          },
        ],
      });
    });

    it('handles openActivity and updates status on exit-ticket:opened', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['exit-ticket:state']?.({
          activity: {
            id: 'et-1',
            sessionId: 'sess-123',
            title: 'Refleksi',
            status: 'DRAFT',
            isAnonymous: false,
            questions: [],
            createdAt: 1000,
          },
        });
      });

      act(() => {
        result.current.openActivity();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('exit-ticket:open', {
        sessionId: 'sess-123',
      });

      act(() => {
        eventHandlers['exit-ticket:opened']?.({
          activityId: 'et-1',
          openedAt: 1500,
        });
      });

      expect(result.current.activity?.status).toBe('OPEN');
      expect(result.current.activity?.openedAt).toBe(1500);
    });

    it('handles closeActivity and updates status on exit-ticket:closed', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['exit-ticket:state']?.({
          activity: {
            id: 'et-1',
            sessionId: 'sess-123',
            title: 'Refleksi',
            status: 'OPEN',
            isAnonymous: false,
            questions: [],
            createdAt: 1000,
          },
        });
      });

      act(() => {
        result.current.closeActivity();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('exit-ticket:close', {
        sessionId: 'sess-123',
      });

      act(() => {
        eventHandlers['exit-ticket:closed']?.({
          activityId: 'et-1',
          closedAt: 2000,
        });
      });

      expect(result.current.activity?.status).toBe('CLOSED');
      expect(result.current.activity?.closedAt).toBe(2000);
    });

    it('updates aggregates on exit-ticket:results-updated', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: true,
        }),
      );

      act(() => {
        eventHandlers['exit-ticket:results-updated']?.({
          activityId: 'et-1',
          responseCount: 5,
          completionRate: 50,
          aggregates: {
            responseCount: 5,
            totalExpected: 10,
            completionRate: 50,
            questionAggregates: {
              'q-1': {
                questionId: 'q-1',
                type: 'SCALE',
                totalResponses: 5,
                scaleAverage: 4.2,
                scaleDistribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 },
              },
            },
          },
        });
      });

      expect(result.current.responseCount).toBe(5);
      expect(result.current.completionRate).toBe(50);
      expect(result.current.aggregates?.responseCount).toBe(5);
    });
  });

  describe('Participant Mode', () => {
    it('initializes with participant snapshot from exit-ticket:state', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      const snapshot: ParticipantExitTicketSnapshot = {
        activity: {
          id: 'et-1',
          title: 'Refleksi Siswa',
          status: 'OPEN',
          isAnonymous: true,
          questions: [
            {
              id: 'q-1',
              type: 'SHORT_TEXT',
              prompt: 'Tulis hal yang paling berkesan',
              required: true,
              order: 1,
            },
          ],
        },
        hasSubmitted: false,
      };

      act(() => {
        eventHandlers['exit-ticket:state']?.(snapshot);
      });

      expect(result.current.participantActivity?.id).toBe('et-1');
      expect(result.current.participantActivity?.isAnonymous).toBe(true);
      expect(result.current.hasSubmitted).toBe(false);
    });

    it('submits response and receives confirmation', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        result.current.submitResponse([
          {
            questionId: 'q-1',
            value: 'Saya sangat suka eksperimen praktikum tadi.',
          },
        ]);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('exit-ticket:submit', {
        sessionId: 'sess-123',
        answers: [
          {
            questionId: 'q-1',
            value: 'Saya sangat suka eksperimen praktikum tadi.',
          },
        ],
      });
      expect(result.current.isSubmitting).toBe(true);
      expect(result.current.cooldown).toBe(3);

      act(() => {
        eventHandlers['exit-ticket:response-submitted']?.({
          activityId: 'et-1',
          submittedAt: 12345,
        });
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.hasSubmitted).toBe(true);
      expect(result.current.submittedAt).toBe(12345);
      expect(result.current.successMessage).toBe('Refleksi Anda berhasil dikirim ke guru!');
    });

    it('blocks submission if already submitted', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['exit-ticket:state']?.({
          activity: null,
          hasSubmitted: true,
          submittedAt: 1000,
        });
      });

      act(() => {
        result.current.submitResponse([
          {
            questionId: 'q-1',
            value: 'Mencoba lagi',
          },
        ]);
      });

      expect(result.current.error).toBe('Anda sudah mengirimkan refleksi untuk sesi ini');
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('blocks submission if answers are empty', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        result.current.submitResponse([]);
      });

      expect(result.current.error).toBe('Jawaban tidak boleh kosong');
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('counts down cooldown timer correctly', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        result.current.submitResponse([
          {
            questionId: 'q-1',
            value: 'Jawaban saya',
          },
        ]);
      });

      expect(result.current.cooldown).toBe(3);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.cooldown).toBe(2);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.cooldown).toBe(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.cooldown).toBe(0);
    });

    it('handles exit-ticket:error and clears error message', () => {
      const { result } = renderHook(() =>
        useExitTicket({
          socket: mockSocket,
          sessionId: 'sess-123',
          isTeacher: false,
        }),
      );

      act(() => {
        eventHandlers['exit-ticket:error']?.({
          code: 'CLOSED',
          message: 'Exit ticket sudah ditutup oleh guru',
        });
      });

      expect(result.current.error).toBe('Exit ticket sudah ditutup oleh guru');
      expect(result.current.isSubmitting).toBe(false);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
