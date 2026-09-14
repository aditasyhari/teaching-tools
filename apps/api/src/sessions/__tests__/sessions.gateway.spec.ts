import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionsGateway } from '../sessions.gateway';

describe('SessionsGateway', () => {
  let gateway: SessionsGateway;
  let mockPrisma: any;
  let mockSessionsService: any;
  let mockMemory: any;
  let mockQuizzesService: any;
  let mockQuizRuntime: any;
  let mockPollsService: any;
  let mockPollRuntime: any;
  let mockQuestionBoxRuntime: any;
  let mockRaiseHandRuntime: any;
  let mockBrainstormRuntime: any;
  let mockExitTicketRuntime: any;
  let mockClassroomTimerRuntime: any;
  let mockServer: any;
  let mockSocket: any;

  beforeEach(() => {
    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    mockPrisma = {
      authSession: {
        findUnique: vi.fn(),
      },
      session: {
        findFirst: vi.fn(),
      },
    };

    mockSessionsService = {
      findOne: vi.fn(),
      verifyJoinCode: vi.fn(),
      getTeacherSnapshot: vi.fn(),
      getParticipantSnapshot: vi.fn(),
      startSession: vi.fn(),
      endSession: vi.fn(),
    };

    mockMemory = {
      registerTeacher: vi.fn(),
      addParticipant: vi.fn(),
      getOnlineParticipantCount: vi.fn().mockReturnValue(1),
      handleDisconnect: vi.fn(),
      touchParticipant: vi.fn(),
      getParticipants: vi.fn().mockReturnValue([]),
      getParticipant: vi.fn(),
      getSocketEntry: vi.fn(),
    };

    mockQuizzesService = {
      findOne: vi.fn(),
    };

    mockQuizRuntime = {
      initQuiz: vi.fn(),
      isQuizActive: vi.fn().mockReturnValue(false),
      getActiveQuiz: vi.fn(),
      recordAnswer: vi.fn(),
      endQuestion: vi.fn(),
      nextQuestion: vi.fn(),
      finishQuiz: vi.fn(),
      clearQuiz: vi.fn(),
      getTeacherSnapshot: vi.fn(),
      getParticipantSnapshot: vi.fn(),
      getCurrentParticipantQuestion: vi.fn(),
      getLeaderboard: vi.fn().mockReturnValue([]),
    };

    mockPollsService = {
      findOne: vi.fn(),
    };

    mockPollRuntime = {
      initPoll: vi.fn(),
      getActivePoll: vi.fn(),
      isPollActive: vi.fn().mockReturnValue(false),
      hasPoll: vi.fn().mockReturnValue(false),
      recordResponse: vi.fn(),
      closePoll: vi.fn(),
      getTeacherSnapshot: vi.fn(),
      getParticipantSnapshot: vi.fn(),
      clearPoll: vi.fn(),
    };

    mockQuestionBoxRuntime = {
      submitQuestion: vi.fn(),
      highlightQuestion: vi.fn(),
      unhighlightQuestion: vi.fn(),
      answerQuestion: vi.fn(),
      dismissQuestion: vi.fn(),
      getTeacherSnapshot: vi.fn().mockReturnValue({
        questions: [],
        highlightedQuestionId: null,
        pendingCount: 0,
        answeredCount: 0,
        totalCount: 0,
      }),
      getParticipantSnapshot: vi.fn().mockReturnValue({
        myQuestions: [],
        highlightedQuestion: null,
      }),
      clearSession: vi.fn(),
    };

    mockRaiseHandRuntime = {
      raiseHand: vi.fn(),
      lowerHand: vi.fn(),
      acknowledgeHand: vi.fn(),
      startSpeaking: vi.fn(),
      lowerParticipantHand: vi.fn(),
      lowerAllHands: vi.fn(),
      getTeacherSnapshot: vi.fn().mockReturnValue({
        queue: [],
        currentSpeaker: null,
        raisedCount: 0,
      }),
      getParticipantSnapshot: vi.fn().mockReturnValue({
        myHand: null,
        currentSpeaker: null,
        queuePosition: null,
        totalRaisedCount: 0,
      }),
      clearSession: vi.fn(),
    };

    mockBrainstormRuntime = {
      createActivity: vi.fn(),
      openActivity: vi.fn(),
      pauseActivity: vi.fn(),
      closeActivity: vi.fn(),
      submitIdea: vi.fn(),
      hideIdea: vi.fn(),
      restoreIdea: vi.fn(),
      getTeacherSnapshot: vi.fn().mockReturnValue({
        activity: null,
        ideas: [],
        totalIdeaCount: 0,
        visibleIdeaCount: 0,
      }),
      getParticipantSnapshot: vi.fn().mockReturnValue({
        activity: null,
        myIdeas: [],
        ideas: [],
      }),
      getActivity: vi.fn(),
      clearSession: vi.fn(),
    };

    mockExitTicketRuntime = {
      createActivity: vi.fn(),
      openActivity: vi.fn(),
      closeActivity: vi.fn(),
      submitResponse: vi.fn(),
      calculateAggregates: vi.fn().mockReturnValue({
        responseCount: 0,
        totalExpected: 0,
        completionRate: 0,
        questionAggregates: {},
      }),
      getTeacherSnapshot: vi.fn().mockReturnValue({
        activity: null,
        aggregates: null,
        responseCount: 0,
        totalExpected: 0,
        completionRate: 0,
      }),
      getParticipantSnapshot: vi.fn().mockReturnValue({
        activity: null,
        hasSubmitted: false,
      }),
      clearSession: vi.fn(),
    };

    mockClassroomTimerRuntime = {
      onCompleted: vi.fn(),
      setTimer: vi.fn().mockReturnValue({
        sessionId: 'sess-123',
        status: 'IDLE',
        duration: 300,
        remainingSeconds: 300,
        visibility: 'SHARED_TIMER',
        serverTime: 1000,
      }),
      startTimer: vi.fn().mockReturnValue({
        sessionId: 'sess-123',
        status: 'RUNNING',
        duration: 300,
        remainingSeconds: 300,
        visibility: 'SHARED_TIMER',
        endsAt: 301000,
        serverTime: 1000,
      }),
      pauseTimer: vi.fn().mockReturnValue({
        sessionId: 'sess-123',
        status: 'PAUSED',
        duration: 300,
        remainingSeconds: 250,
        visibility: 'SHARED_TIMER',
        serverTime: 2000,
      }),
      resumeTimer: vi.fn().mockReturnValue({
        sessionId: 'sess-123',
        status: 'RUNNING',
        duration: 300,
        remainingSeconds: 250,
        visibility: 'SHARED_TIMER',
        endsAt: 252000,
        serverTime: 2000,
      }),
      resetTimer: vi.fn().mockReturnValue({
        sessionId: 'sess-123',
        status: 'IDLE',
        duration: 300,
        remainingSeconds: 300,
        visibility: 'SHARED_TIMER',
        serverTime: 3000,
      }),
      getTeacherSnapshot: vi.fn().mockReturnValue({
        timer: null,
        serverTime: 1000,
      }),
      getParticipantSnapshot: vi.fn().mockReturnValue({
        timer: null,
        serverTime: 1000,
      }),
      clearSession: vi.fn(),
    };

    mockSocket = {
      id: 'socket-client-1',
      handshake: {
        auth: {},
        headers: {},
      },
      join: vi.fn(),
      leave: vi.fn(),
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
    };

    gateway = new SessionsGateway(
      mockPrisma,
      mockSessionsService,
      mockMemory,
      mockQuizRuntime,
      mockQuizzesService,
      mockPollRuntime,
      mockPollsService,
      mockQuestionBoxRuntime,
      mockRaiseHandRuntime,
      mockBrainstormRuntime,
      mockExitTicketRuntime,
      mockClassroomTimerRuntime,
    );
    gateway.server = mockServer as any;
  });

  describe('handleJoin (Participant)', () => {
    it('allows participant with valid joinCode and displayName to join', async () => {
      mockSessionsService.verifyJoinCode.mockResolvedValue({
        id: 'sess-123',
        title: 'Kuis IPA',
        joinCode: 'AB7K42',
        status: 'WAITING',
      });

      mockMemory.addParticipant.mockReturnValue({
        id: 'p-1',
        sessionId: 'sess-123',
        displayName: 'Ahmad Budi',
        isOnline: true,
      });

      mockSessionsService.getParticipantSnapshot.mockResolvedValue({
        id: 'sess-123',
        title: 'Kuis IPA',
        status: 'WAITING',
        participantCount: 1,
        currentParticipant: { id: 'p-1', displayName: 'Ahmad Budi' },
      });

      await gateway.handleJoin(mockSocket as any, {
        joinCode: 'AB7K42',
        displayName: 'Ahmad Budi',
      });

      expect(mockSocket.join).toHaveBeenCalledWith('session:sess-123');
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'session:state',
        expect.objectContaining({
          id: 'sess-123',
        }),
      );
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'session:participant-joined',
        expect.objectContaining({
          participant: { id: 'p-1', displayName: 'Ahmad Budi' },
          count: 1,
        }),
      );
    });

    it('rejects participant join if code or name is invalid', async () => {
      await gateway.handleJoin(mockSocket as any, {
        joinCode: 'AB',
        displayName: '',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'session:error',
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      );
    });
  });

  describe('handleStart & handleEnd (Security: Teacher Auth Enforcement)', () => {
    it('rejects session:start if connection is not an authenticated teacher', async () => {
      await gateway.handleStart(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'session:error',
        expect.objectContaining({
          code: 'UNAUTHORIZED',
        }),
      );
      expect(mockSessionsService.startSession).not.toHaveBeenCalled();
    });

    it('allows authenticated teacher to start session and broadcasts session:started', async () => {
      mockSocket.handshake.auth = { token: 'valid-session-token' };
      mockPrisma.authSession.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'teacher-1', email: 'teacher@walikelas.id', status: 'ACTIVE' },
      });

      mockSessionsService.startSession.mockResolvedValue({
        id: 'sess-123',
        status: 'ACTIVE',
        startedAt: new Date().toISOString(),
      });
      mockSessionsService.getTeacherSnapshot.mockResolvedValue({
        id: 'sess-123',
        status: 'ACTIVE',
      });

      await gateway.handleStart(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockSessionsService.startSession).toHaveBeenCalledWith('sess-123', 'teacher-1');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('session:started', expect.any(Object));
    });

    it('rejects session:end if connection is not an authenticated teacher', async () => {
      await gateway.handleEnd(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'session:error',
        expect.objectContaining({
          code: 'UNAUTHORIZED',
        }),
      );
      expect(mockSessionsService.endSession).not.toHaveBeenCalled();
    });

    it('allows authenticated teacher to end session and broadcasts session:ended', async () => {
      mockSocket.handshake.auth = { token: 'valid-session-token' };
      mockPrisma.authSession.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'teacher-1', email: 'teacher@walikelas.id', status: 'ACTIVE' },
      });

      mockSessionsService.endSession.mockResolvedValue({
        id: 'sess-123',
        status: 'ENDED',
        endedAt: new Date().toISOString(),
      });

      await gateway.handleEnd(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockSessionsService.endSession).toHaveBeenCalledWith('sess-123', 'teacher-1');
      expect(mockQuizRuntime.clearQuiz).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('session:ended', expect.any(Object));
    });
  });

  describe('Live Quiz Gateway Events', () => {
    beforeEach(() => {
      mockSocket.handshake.auth = { token: 'teacher-token' };
      mockPrisma.authSession.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'teacher-1', email: 'teacher@walikelas.id', status: 'ACTIVE' },
      });
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'sess-123',
        teacherId: 'teacher-1',
        status: 'ACTIVE',
      });
    });

    it('handles quiz:start from teacher and broadcasts question to room', async () => {
      mockQuizzesService.findOne.mockResolvedValue({
        id: 'quiz-1',
        teacherId: 'teacher-1',
        title: 'Kuis IPA',
        questions: [
          {
            id: 'q-1',
            order: 1,
            questionText: 'Pertanyaan 1',
            points: 100,
            timeLimitSeconds: 20,
            options: [
              { id: 'opt-1', order: 1, optionText: 'Jawaban A', isCorrect: true },
              { id: 'opt-2', order: 2, optionText: 'Jawaban B', isCorrect: false },
            ],
          },
        ],
      });

      mockQuizRuntime.initQuiz.mockReturnValue({
        quizId: 'quiz-1',
        title: 'Kuis IPA',
        status: 'QUESTION_ACTIVE',
        questions: [
          {
            id: 'q-1',
            order: 1,
            questionText: 'Pertanyaan 1',
            points: 100,
            timeLimitSeconds: 20,
            options: [
              { id: 'opt-1', order: 1, optionText: 'Jawaban A', isCorrect: true },
              { id: 'opt-2', order: 2, optionText: 'Jawaban B', isCorrect: false },
            ],
          },
        ],
        questionStartedAt: 1000,
        questionDeadline: 21000,
      });

      mockQuizRuntime.getCurrentParticipantQuestion.mockReturnValue({
        id: 'q-1',
        order: 1,
        questionText: 'Pertanyaan 1',
        points: 100,
        timeLimitSeconds: 20,
        options: [
          { id: 'opt-1', order: 1, optionText: 'Jawaban A' },
          { id: 'opt-2', order: 2, optionText: 'Jawaban B' },
        ],
      });

      mockQuizRuntime.getTeacherSnapshot.mockReturnValue({
        quizId: 'quiz-1',
        status: 'QUESTION_ACTIVE',
      });

      await gateway.handleQuizStart(mockSocket as any, {
        sessionId: 'sess-123',
        quizId: 'quiz-1',
      });

      expect(mockQuizRuntime.initQuiz).toHaveBeenCalled();
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('quiz:started', {
        quizId: 'quiz-1',
        title: 'Kuis IPA',
        totalQuestions: 1,
      });
      expect(mockServer.emit).toHaveBeenCalledWith(
        'quiz:question-started',
        expect.objectContaining({
          questionNumber: 1,
          totalQuestions: 1,
        }),
      );
    });

    it('handles quiz:answer from participant and sends individual ack', async () => {
      // Participant connection
      mockSocket.handshake.auth = { participantId: 'p-1' };
      mockSocket.data = { sessionId: 'sess-123', participantId: 'p-1' };
      mockPrisma.authSession.findUnique.mockResolvedValue(null);
      mockMemory.getSocketEntry.mockReturnValue({
        socketId: 'socket-client-1',
        sessionId: 'sess-123',
        participantId: 'p-1',
        role: 'PARTICIPANT',
      });

      mockQuizRuntime.recordAnswer.mockReturnValue({
        accepted: true,
        wasCorrect: true,
        pointsEarned: 100,
      });

      mockQuizRuntime.getTeacherSnapshot.mockReturnValue({
        quizId: 'quiz-1',
        status: 'QUESTION_ACTIVE',
        answeredCount: 1,
        totalParticipants: 1,
      });

      await gateway.handleQuizAnswer(mockSocket as any, {
        sessionId: 'sess-123',
        questionId: 'q-1',
        optionId: 'opt-1',
      });

      expect(mockQuizRuntime.recordAnswer).toHaveBeenCalledWith('sess-123', 'p-1', 'q-1', 'opt-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('quiz:answer-accepted', {
        questionId: 'q-1',
        optionId: 'opt-1',
      });
      // REAL-001: Distribution update must be scoped strictly to the teacher room
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123:teachers');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'quiz:distribution-update',
        expect.objectContaining({
          answeredCount: 1,
        }),
      );
    });

    it('SEC-001: rejects quiz:answer with FORBIDDEN when sessionId does not match socket session', async () => {
      mockMemory.getSocketEntry.mockReturnValue({
        socketId: 'socket-client-1',
        sessionId: 'sess-123',
        participantId: 'p-1',
        role: 'PARTICIPANT',
      });

      await gateway.handleQuizAnswer(mockSocket as any, {
        sessionId: 'other-session-456',
        questionId: 'q-1',
        optionId: 'opt-1',
      });

      expect(mockQuizRuntime.recordAnswer).not.toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith('quiz:error', {
        code: 'FORBIDDEN',
        message: 'Sesi tidak sesuai dengan koneksi aktif',
      });
    });

    it('handles quiz:end-question from teacher and reveals correct answer', async () => {
      mockQuizRuntime.endQuestion.mockReturnValue({
        correctOptionId: 'opt-1',
        distribution: { 'opt-1': 2, 'opt-2': 1 },
      });

      await gateway.handleQuizEndQuestion(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockQuizRuntime.endQuestion).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'quiz:question-ended',
        expect.objectContaining({
          correctOptionId: 'opt-1',
          distribution: { 'opt-1': 2, 'opt-2': 1 },
        }),
      );
    });
  });

  describe('Live Poll Gateway Events', () => {
    beforeEach(() => {
      mockSocket.handshake.auth = { token: 'teacher-token' };
      mockPrisma.authSession.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'teacher-1', email: 'teacher@walikelas.id', status: 'ACTIVE' },
      });
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'sess-123',
        teacherId: 'teacher-1',
        status: 'ACTIVE',
      });
    });

    it('handles poll:start from teacher and broadcasts poll:started', async () => {
      mockPollsService.findOne.mockResolvedValue({
        id: 'poll-1',
        teacherId: 'teacher-1',
        title: 'Cek Pemahaman',
        question: 'Paham materi?',
        type: 'SINGLE_CHOICE',
        settings: { allowMultiple: false, showResultsToParticipants: true },
        options: [
          { id: 'opt-1', optionText: 'Paham' },
          { id: 'opt-2', optionText: 'Belum' },
        ],
      });

      mockPollRuntime.initPoll.mockReturnValue({
        pollId: 'poll-1',
        title: 'Cek Pemahaman',
        question: 'Paham materi?',
        type: 'SINGLE_CHOICE',
        settings: { allowMultiple: false, showResultsToParticipants: true },
        options: [
          { id: 'opt-1', optionText: 'Paham' },
          { id: 'opt-2', optionText: 'Belum' },
        ],
      });

      mockPollRuntime.getTeacherSnapshot.mockReturnValue({
        pollId: 'poll-1',
        status: 'LIVE',
      });

      await gateway.handlePollStart(mockSocket as any, {
        sessionId: 'sess-123',
        pollId: 'poll-1',
      });

      expect(mockPollRuntime.initPoll).toHaveBeenCalled();
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'poll:started',
        expect.objectContaining({
          pollId: 'poll-1',
          title: 'Cek Pemahaman',
        }),
      );
    });

    it('handles poll:respond from participant and sends ack and stats update', async () => {
      mockSocket.handshake.auth = { participantId: 'p-1' };
      mockPrisma.authSession.findUnique.mockResolvedValue(null);
      mockMemory.getSocketEntry.mockReturnValue({
        socketId: 'socket-client-1',
        sessionId: 'sess-123',
        participantId: 'p-1',
        role: 'PARTICIPANT',
      });

      mockPollRuntime.recordResponse.mockReturnValue({
        accepted: true,
        selectedOptionIds: ['opt-1'],
      });

      mockPollRuntime.getTeacherSnapshot.mockReturnValue({
        pollId: 'poll-1',
        status: 'LIVE',
        responseCount: 1,
        totalParticipants: 1,
        responseRate: 100,
        distribution: { 'opt-1': 1, 'opt-2': 0 },
        percentages: { 'opt-1': 100, 'opt-2': 0 },
      });

      mockPollRuntime.getActivePoll.mockReturnValue({
        settings: { showResultsToParticipants: true },
      });

      gateway.handlePollRespond(mockSocket as any, {
        sessionId: 'sess-123',
        pollId: 'poll-1',
        optionId: 'opt-1',
      });

      expect(mockPollRuntime.recordResponse).toHaveBeenCalledWith(
        'sess-123',
        'p-1',
        'opt-1',
        undefined,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('poll:response-accepted', {
        pollId: 'poll-1',
        selectedOptionIds: ['opt-1'],
      });
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'poll:stats-update',
        expect.objectContaining({
          responseCount: 1,
          responseRate: 100,
        }),
      );
    });

    it('handles poll:close from teacher and broadcasts poll:closed', async () => {
      mockPollRuntime.closePoll.mockReturnValue({
        pollId: 'poll-1',
        distribution: { 'opt-1': 1, 'opt-2': 0 },
        percentages: { 'opt-1': 100, 'opt-2': 0 },
        totalResponses: 1,
      });

      mockPollRuntime.getTeacherSnapshot.mockReturnValue({
        pollId: 'poll-1',
        status: 'CLOSED',
      });

      await gateway.handlePollClose(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockPollRuntime.closePoll).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'poll:closed',
        expect.objectContaining({
          pollId: 'poll-1',
          totalResponses: 1,
        }),
      );
    });
  });

  describe('Question Box Gateway Events', () => {
    beforeEach(() => {
      mockSocket.handshake.auth = { token: 'teacher-token' };
      mockPrisma.authSession.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'teacher-1', email: 'teacher@walikelas.id', status: 'ACTIVE' },
      });
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'sess-123',
        teacherId: 'teacher-1',
        status: 'ACTIVE',
      });
    });

    it('handles question:submit from participant, sends ack to client and notifies teachers', () => {
      mockMemory.getSocketEntry.mockReturnValue({
        socketId: 'socket-client-1',
        sessionId: 'sess-123',
        participantId: 'p-1',
        role: 'PARTICIPANT',
      });
      mockMemory.getParticipant.mockReturnValue({
        id: 'p-1',
        displayName: 'Budi Santoso',
      });

      mockQuestionBoxRuntime.submitQuestion.mockReturnValue({
        accepted: true,
        question: {
          id: 'q-101',
          sessionId: 'sess-123',
          participantId: 'p-1',
          authorName: 'Budi Santoso',
          isAnonymous: false,
          content: 'Kapan materi bab 4 diujikan?',
          status: 'PENDING',
          createdAt: 1000,
        },
      });

      mockQuestionBoxRuntime.getTeacherSnapshot.mockReturnValue({
        questions: [],
        highlightedQuestionId: null,
        pendingCount: 1,
        answeredCount: 0,
        totalCount: 1,
      });

      gateway.handleQuestionSubmit(mockSocket as any, {
        sessionId: 'sess-123',
        content: 'Kapan materi bab 4 diujikan?',
        isAnonymous: false,
      });

      expect(mockQuestionBoxRuntime.submitQuestion).toHaveBeenCalledWith(
        'sess-123',
        'p-1',
        'Budi Santoso',
        'Kapan materi bab 4 diujikan?',
        false,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('question:submitted', {
        question: expect.objectContaining({
          id: 'q-101',
          content: 'Kapan materi bab 4 diujikan?',
          status: 'PENDING',
        }),
      });
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123:teachers');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'question:created',
        expect.objectContaining({
          question: expect.objectContaining({ id: 'q-101' }),
        }),
      );
      expect(mockServer.emit).toHaveBeenCalledWith('question:count-update', {
        pendingCount: 1,
        answeredCount: 0,
        totalCount: 1,
      });
    });

    it('handles question:highlight from teacher and broadcasts to session', async () => {
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });
      mockQuestionBoxRuntime.highlightQuestion.mockReturnValue({
        id: 'q-101',
        content: 'Pertanyaan disorot',
        authorName: 'Siti',
        isAnonymous: false,
        status: 'HIGHLIGHTED',
        createdAt: 1000,
      });

      await gateway.handleQuestionHighlight(mockSocket as any, {
        sessionId: 'sess-123',
        questionId: 'q-101',
      });

      expect(mockQuestionBoxRuntime.highlightQuestion).toHaveBeenCalledWith('sess-123', 'q-101');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('question:highlighted', {
        question: {
          id: 'q-101',
          content: 'Pertanyaan disorot',
          authorName: 'Siti',
          isAnonymous: false,
          createdAt: 1000,
        },
      });
    });

    it('handles question:unhighlight from teacher and broadcasts to session', async () => {
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });
      mockQuestionBoxRuntime.unhighlightQuestion.mockReturnValue({
        id: 'q-101',
        status: 'PENDING',
      });

      await gateway.handleQuestionUnhighlight(mockSocket as any, {
        sessionId: 'sess-123',
        questionId: 'q-101',
      });

      expect(mockQuestionBoxRuntime.unhighlightQuestion).toHaveBeenCalledWith('sess-123', 'q-101');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('question:unhighlighted', {
        questionId: 'q-101',
      });
    });

    it('handles question:answer from teacher and broadcasts to session', async () => {
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });
      mockQuestionBoxRuntime.answerQuestion.mockReturnValue({
        id: 'q-101',
        status: 'ANSWERED',
      });

      await gateway.handleQuestionAnswer(mockSocket as any, {
        sessionId: 'sess-123',
        questionId: 'q-101',
      });

      expect(mockQuestionBoxRuntime.answerQuestion).toHaveBeenCalledWith('sess-123', 'q-101');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('question:answered', {
        questionId: 'q-101',
      });
    });

    it('handles question:dismiss from teacher and broadcasts to session', async () => {
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });
      mockQuestionBoxRuntime.dismissQuestion.mockReturnValue({
        id: 'q-101',
        status: 'DISMISSED',
      });

      await gateway.handleQuestionDismiss(mockSocket as any, {
        sessionId: 'sess-123',
        questionId: 'q-101',
      });

      expect(mockQuestionBoxRuntime.dismissQuestion).toHaveBeenCalledWith('sess-123', 'q-101');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('question:dismissed', {
        questionId: 'q-101',
      });
    });
  });

  describe('Raise Hand / Request to Speak Events', () => {
    it('handles hand:raise from participant and notifies teacher & session', () => {
      mockMemory.getSocketEntry.mockReturnValue({
        socketId: 'socket-client-1',
        sessionId: 'sess-123',
        participantId: 'p-1',
        role: 'PARTICIPANT',
      });
      mockMemory.getParticipant.mockReturnValue({ id: 'p-1', displayName: 'Budi Santoso' });
      mockRaiseHandRuntime.raiseHand.mockReturnValue({
        accepted: true,
        hand: {
          id: 'hand-1',
          sessionId: 'sess-123',
          participantId: 'p-1',
          displayName: 'Budi Santoso',
          status: 'RAISED',
          raisedAt: 1000,
        },
      });
      mockRaiseHandRuntime.getTeacherSnapshot.mockReturnValue({
        queue: [{ id: 'hand-1', status: 'RAISED' }],
        currentSpeaker: null,
        raisedCount: 1,
      });

      gateway.handleHandRaise(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockRaiseHandRuntime.raiseHand).toHaveBeenCalledWith(
        'sess-123',
        'p-1',
        'Budi Santoso',
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('hand:state', expect.anything());
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123:teachers');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'hand:raised',
        expect.objectContaining({ queueCount: 1 }),
      );
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('hand:queue-update', { queueCount: 1 });
    });

    it('rejects hand:raise if unauthorized', () => {
      mockMemory.getSocketEntry.mockReturnValue(null);

      gateway.handleHandRaise(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockSocket.emit).toHaveBeenCalledWith('hand:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya peserta yang dapat mengangkat tangan',
      });
    });

    it('handles hand:lower from participant and broadcasts update', () => {
      mockMemory.getSocketEntry.mockReturnValue({
        socketId: 'socket-client-1',
        sessionId: 'sess-123',
        participantId: 'p-1',
        role: 'PARTICIPANT',
      });
      mockRaiseHandRuntime.lowerHand.mockReturnValue({
        accepted: true,
        hand: { id: 'hand-1', status: 'LOWERED' },
      });
      mockRaiseHandRuntime.getTeacherSnapshot.mockReturnValue({
        queue: [],
        currentSpeaker: null,
        raisedCount: 0,
      });

      gateway.handleHandLower(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockRaiseHandRuntime.lowerHand).toHaveBeenCalledWith('sess-123', 'p-1');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('hand:lowered', {
        handId: 'hand-1',
        participantId: 'p-1',
      });
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('hand:queue-update', { queueCount: 0 });
    });

    it('handles hand:acknowledge from teacher and broadcasts', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });
      mockRaiseHandRuntime.acknowledgeHand.mockReturnValue({
        id: 'hand-1',
        participantId: 'p-1',
        status: 'ACKNOWLEDGED',
      });

      await gateway.handleHandAcknowledge(mockSocket as any, {
        sessionId: 'sess-123',
        handId: 'hand-1',
      });

      expect(mockRaiseHandRuntime.acknowledgeHand).toHaveBeenCalledWith('sess-123', 'hand-1');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('hand:acknowledged', {
        handId: 'hand-1',
        participantId: 'p-1',
      });
    });

    it('handles hand:start-speaking from teacher and broadcasts to session', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });
      mockRaiseHandRuntime.startSpeaking.mockReturnValue({
        accepted: true,
        hand: {
          id: 'hand-1',
          participantId: 'p-1',
          displayName: 'Budi Santoso',
          status: 'SPEAKING',
        },
      });

      await gateway.handleHandStartSpeaking(mockSocket as any, {
        sessionId: 'sess-123',
        handId: 'hand-1',
      });

      expect(mockRaiseHandRuntime.startSpeaking).toHaveBeenCalledWith('sess-123', 'hand-1');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('hand:speaking', {
        handId: 'hand-1',
        participantId: 'p-1',
        displayName: 'Budi Santoso',
      });
    });

    it('handles hand:lower-participant from teacher', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });
      mockRaiseHandRuntime.lowerParticipantHand.mockReturnValue({
        id: 'hand-1',
        participantId: 'p-1',
        status: 'LOWERED',
      });

      await gateway.handleHandLowerParticipant(mockSocket as any, {
        sessionId: 'sess-123',
        handId: 'hand-1',
      });

      expect(mockRaiseHandRuntime.lowerParticipantHand).toHaveBeenCalledWith('sess-123', 'hand-1');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('hand:lowered', {
        handId: 'hand-1',
        participantId: 'p-1',
      });
    });

    it('handles hand:lower-all from teacher', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      await gateway.handleHandLowerAll(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockRaiseHandRuntime.lowerAllHands).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('hand:all-lowered', {});
      expect(mockServer.emit).toHaveBeenCalledWith('hand:queue-update', { queueCount: 0 });
    });
  });

  describe('Collaborative Brainstorm Board Events', () => {
    it('rejects brainstorm:create if not authenticated teacher', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue(null);
      mockSocket.handshake.auth = {};

      await gateway.handleBrainstormCreate(mockSocket as any, {
        sessionId: 'sess-123',
        prompt: 'Sebutkan 3 sifat benda cair!',
        isAnonymous: false,
        ideasVisibleToParticipants: true,
        submissionMode: 'MULTIPLE_PER_PARTICIPANT',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('brainstorm:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya guru pemilik sesi yang dapat membuat papan ide',
      });
    });

    it('handles brainstorm:create successfully from teacher', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockBrainstormRuntime.createActivity.mockReturnValue({
        accepted: true,
        activity: {
          id: 'activity-1',
          sessionId: 'sess-123',
          prompt: 'Sebutkan 3 sifat benda cair!',
          status: 'DRAFT',
          settings: {
            isAnonymous: false,
            ideasVisibleToParticipants: true,
            submissionMode: 'MULTIPLE_PER_PARTICIPANT',
          },
        },
      });

      await gateway.handleBrainstormCreate(mockSocket as any, {
        sessionId: 'sess-123',
        prompt: 'Sebutkan 3 sifat benda cair!',
        isAnonymous: false,
        ideasVisibleToParticipants: true,
        submissionMode: 'MULTIPLE_PER_PARTICIPANT',
      });

      expect(mockBrainstormRuntime.createActivity).toHaveBeenCalledWith(
        'sess-123',
        'Sebutkan 3 sifat benda cair!',
        {
          isAnonymous: false,
          ideasVisibleToParticipants: true,
          submissionMode: 'MULTIPLE_PER_PARTICIPANT',
        },
      );
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123:teachers');
      expect(mockServer.emit).toHaveBeenCalledWith('brainstorm:state', expect.any(Object));
    });

    it('handles brainstorm:open successfully and broadcasts', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockBrainstormRuntime.openActivity.mockReturnValue({
        accepted: true,
        activity: {
          id: 'activity-1',
          status: 'OPEN',
          openedAt: Date.now(),
        },
      });

      await gateway.handleBrainstormOpen(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockBrainstormRuntime.openActivity).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'brainstorm:opened',
        expect.objectContaining({ activityId: 'activity-1' }),
      );
    });

    it('handles brainstorm:pause successfully and broadcasts', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockBrainstormRuntime.pauseActivity.mockReturnValue({
        accepted: true,
        activity: {
          id: 'activity-1',
          status: 'PAUSED',
          pausedAt: Date.now(),
        },
      });

      await gateway.handleBrainstormPause(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockBrainstormRuntime.pauseActivity).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'brainstorm:paused',
        expect.objectContaining({ activityId: 'activity-1' }),
      );
    });

    it('handles brainstorm:close successfully and broadcasts', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockBrainstormRuntime.closeActivity.mockReturnValue({
        accepted: true,
        activity: {
          id: 'activity-1',
          status: 'CLOSED',
          closedAt: Date.now(),
        },
      });

      await gateway.handleBrainstormClose(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockBrainstormRuntime.closeActivity).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'brainstorm:closed',
        expect.objectContaining({ activityId: 'activity-1' }),
      );
    });

    it('handles brainstorm:submit from participant and broadcasts', () => {
      mockMemory.getSocketEntry.mockReturnValue({
        sessionId: 'sess-123',
        participantId: 'p-1',
        role: 'PARTICIPANT',
      });
      mockMemory.getParticipant.mockReturnValue({
        id: 'p-1',
        displayName: 'Budi Santoso',
      });
      mockBrainstormRuntime.getActivity.mockReturnValue({
        id: 'activity-1',
        settings: {
          ideasVisibleToParticipants: true,
          isAnonymous: false,
        },
      });
      mockBrainstormRuntime.submitIdea.mockReturnValue({
        accepted: true,
        idea: {
          id: 'idea-1',
          sessionId: 'sess-123',
          participantId: 'p-1',
          authorName: 'Budi Santoso',
          isAnonymous: false,
          content: 'Bentuknya mengikuti wadahnya',
          status: 'VISIBLE',
          createdAt: Date.now(),
        },
      });
      mockBrainstormRuntime.getTeacherSnapshot.mockReturnValue({
        totalCount: 1,
        visibleCount: 1,
      });

      gateway.handleBrainstormSubmit(mockSocket as any, {
        sessionId: 'sess-123',
        content: 'Bentuknya mengikuti wadahnya',
      });

      expect(mockBrainstormRuntime.submitIdea).toHaveBeenCalledWith(
        'sess-123',
        'p-1',
        'Budi Santoso',
        'Bentuknya mengikuti wadahnya',
      );
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'brainstorm:idea-submitted',
        expect.objectContaining({
          idea: expect.objectContaining({ id: 'idea-1' }),
        }),
      );
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123:teachers');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
    });

    it('handles brainstorm:hide from teacher and broadcasts', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockBrainstormRuntime.hideIdea.mockReturnValue({
        id: 'idea-1',
        status: 'HIDDEN',
      });
      mockBrainstormRuntime.getTeacherSnapshot.mockReturnValue({
        visibleCount: 0,
        totalCount: 1,
      });

      await gateway.handleBrainstormHide(mockSocket as any, {
        sessionId: 'sess-123',
        ideaId: 'idea-1',
      });

      expect(mockBrainstormRuntime.hideIdea).toHaveBeenCalledWith('sess-123', 'idea-1');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('brainstorm:idea-hidden', {
        ideaId: 'idea-1',
        totalCount: 0,
      });
    });

    it('handles brainstorm:restore from teacher and broadcasts', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockBrainstormRuntime.restoreIdea.mockReturnValue({
        id: 'idea-1',
        authorName: 'Budi Santoso',
        isAnonymous: false,
        content: 'Bentuknya mengikuti wadahnya',
        status: 'VISIBLE',
        createdAt: Date.now(),
      });
      mockBrainstormRuntime.getActivity.mockReturnValue({
        settings: { ideasVisibleToParticipants: true },
      });
      mockBrainstormRuntime.getTeacherSnapshot.mockReturnValue({
        visibleCount: 1,
        totalCount: 1,
      });

      await gateway.handleBrainstormRestore(mockSocket as any, {
        sessionId: 'sess-123',
        ideaId: 'idea-1',
      });

      expect(mockBrainstormRuntime.restoreIdea).toHaveBeenCalledWith('sess-123', 'idea-1');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'brainstorm:idea-restored',
        expect.objectContaining({
          idea: expect.objectContaining({ id: 'idea-1' }),
        }),
      );
    });
  });

  describe('Exit Ticket / Quick Reflection Events', () => {
    it('rejects exit-ticket:create if not authenticated teacher', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue(null);
      mockSocket.handshake.auth = {};

      await gateway.handleExitTicketCreate(mockSocket as any, {
        sessionId: 'sess-123',
        title: 'Refleksi Akhir',
        questions: [{ type: 'SCALE', prompt: 'Seberapa paham?' }],
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('exit-ticket:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya guru pemilik sesi yang dapat membuat Exit Ticket',
      });
    });

    it('handles exit-ticket:create successfully from teacher', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockExitTicketRuntime.createActivity.mockReturnValue({
        accepted: true,
        activity: {
          id: 'et-1',
          sessionId: 'sess-123',
          title: 'Refleksi Akhir',
          status: 'DRAFT',
          questions: [
            { id: 'q-1', order: 0, type: 'SCALE', prompt: 'Seberapa paham?', required: true },
          ],
        },
      });

      await gateway.handleExitTicketCreate(mockSocket as any, {
        sessionId: 'sess-123',
        title: 'Refleksi Akhir',
        questions: [{ type: 'SCALE', prompt: 'Seberapa paham?' }],
      });

      expect(mockExitTicketRuntime.createActivity).toHaveBeenCalledWith(
        'sess-123',
        'Refleksi Akhir',
        true,
        expect.any(Array),
      );
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123:teachers');
      expect(mockServer.emit).toHaveBeenCalledWith('exit-ticket:state', expect.any(Object));
    });

    it('handles exit-ticket:open successfully and broadcasts to session', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockExitTicketRuntime.openActivity.mockReturnValue({
        accepted: true,
        activity: {
          id: 'et-1',
          status: 'OPEN',
          openedAt: Date.now(),
        },
      });

      await gateway.handleExitTicketOpen(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockExitTicketRuntime.openActivity).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'exit-ticket:opened',
        expect.objectContaining({ activityId: 'et-1' }),
      );
    });

    it('handles exit-ticket:close successfully and broadcasts to session', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'teacher@test.com' },
      });
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123', teacherId: 'teacher-1' });

      mockExitTicketRuntime.closeActivity.mockReturnValue({
        accepted: true,
        activity: {
          id: 'et-1',
          status: 'CLOSED',
          closedAt: Date.now(),
        },
      });

      await gateway.handleExitTicketClose(mockSocket as any, { sessionId: 'sess-123' });

      expect(mockExitTicketRuntime.closeActivity).toHaveBeenCalledWith('sess-123');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'exit-ticket:closed',
        expect.objectContaining({ activityId: 'et-1' }),
      );
    });

    it('handles exit-ticket:submit from participant and updates teacher aggregates', () => {
      mockMemory.getSocketEntry.mockReturnValue({
        sessionId: 'sess-123',
        participantId: 'p-1',
        role: 'PARTICIPANT',
      });
      mockMemory.getParticipant.mockReturnValue({
        id: 'p-1',
        displayName: 'Budi Santoso',
      });
      mockExitTicketRuntime.submitResponse.mockReturnValue({
        accepted: true,
        response: {
          id: 'etr-1',
          submittedAt: Date.now(),
        },
      });

      gateway.handleExitTicketSubmit(mockSocket as any, {
        sessionId: 'sess-123',
        answers: [{ questionId: 'q-1', value: 5 }],
      });

      expect(mockExitTicketRuntime.submitResponse).toHaveBeenCalledWith(
        'sess-123',
        'p-1',
        'Budi Santoso',
        [{ questionId: 'q-1', value: 5 }],
      );
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'exit-ticket:response-submitted',
        expect.objectContaining({ success: true }),
      );
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123:teachers');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'exit-ticket:results-updated',
        expect.any(Object),
      );
    });
  });

  describe('handleDisconnect', () => {
    it('broadcasts session:participant-left when participant disconnects', () => {
      mockMemory.handleDisconnect.mockReturnValue({
        sessionId: 'sess-123',
        role: 'PARTICIPANT',
        participant: { id: 'p-1', displayName: 'Budi Santoso' },
      });
      mockMemory.getOnlineParticipantCount.mockReturnValue(0);

      gateway.handleDisconnect(mockSocket as any);

      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'session:participant-left',
        expect.objectContaining({
          participantId: 'p-1',
          displayName: 'Budi Santoso',
          count: 0,
        }),
      );
    });
  });

  describe('Classroom Timer Gateway Events (Phase 12)', () => {
    const setupTeacher = () => {
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'teacher-1', email: 'guru@sekolah.id' },
      });
      mockSessionsService.findOne.mockResolvedValue({ id: 'sess-123' });
    };

    it('handles timer:set and broadcasts state', async () => {
      setupTeacher();

      await gateway.handleTimerSet(mockSocket as any, {
        sessionId: 'sess-123',
        duration: 300,
        label: 'Diskusi Kelompok',
        visibility: 'SHARED_TIMER',
      });

      expect(mockClassroomTimerRuntime.setTimer).toHaveBeenCalledWith(
        'sess-123',
        300,
        'Diskusi Kelompok',
        'SHARED_TIMER',
      );
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'timer:state',
        expect.objectContaining({
          timer: expect.objectContaining({ sessionId: 'sess-123', duration: 300 }),
        }),
      );
    });

    it('handles timer:set with PRIVATE_TIMER and hides from participants', async () => {
      setupTeacher();
      mockClassroomTimerRuntime.setTimer.mockReturnValueOnce({
        sessionId: 'sess-123',
        status: 'IDLE',
        duration: 120,
        remainingSeconds: 120,
        visibility: 'PRIVATE_TIMER',
        serverTime: 1000,
      });

      await gateway.handleTimerSet(mockSocket as any, {
        sessionId: 'sess-123',
        duration: 120,
        visibility: 'PRIVATE_TIMER',
      });

      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123:teachers');
      expect(mockServer.to).toHaveBeenCalledWith('session:sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('timer:state', {
        timer: null,
        serverTime: expect.any(Number),
      });
    });

    it('handles timer:start and broadcasts timer:started and timer:state', async () => {
      setupTeacher();

      await gateway.handleTimerStart(mockSocket as any, {
        sessionId: 'sess-123',
        duration: 180,
      });

      expect(mockClassroomTimerRuntime.startTimer).toHaveBeenCalledWith('sess-123', {
        duration: 180,
        label: undefined,
        visibility: undefined,
      });
      expect(mockServer.emit).toHaveBeenCalledWith('timer:started', expect.any(Object));
      expect(mockServer.emit).toHaveBeenCalledWith('timer:state', expect.any(Object));
    });

    it('handles timer:pause and broadcasts timer:paused', async () => {
      setupTeacher();

      await gateway.handleTimerPause(mockSocket as any, {
        sessionId: 'sess-123',
      });

      expect(mockClassroomTimerRuntime.pauseTimer).toHaveBeenCalledWith('sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('timer:paused', expect.any(Object));
    });

    it('handles timer:resume and broadcasts timer:resumed', async () => {
      setupTeacher();

      await gateway.handleTimerResume(mockSocket as any, {
        sessionId: 'sess-123',
      });

      expect(mockClassroomTimerRuntime.resumeTimer).toHaveBeenCalledWith('sess-123');
      expect(mockServer.emit).toHaveBeenCalledWith('timer:resumed', expect.any(Object));
    });

    it('handles timer:reset and broadcasts timer:reset', async () => {
      setupTeacher();

      await gateway.handleTimerReset(mockSocket as any, {
        sessionId: 'sess-123',
        newDuration: 600,
      });

      expect(mockClassroomTimerRuntime.resetTimer).toHaveBeenCalledWith('sess-123', 600);
      expect(mockServer.emit).toHaveBeenCalledWith('timer:reset', expect.any(Object));
    });

    it('rejects unauthenticated user attempting timer:start', async () => {
      mockSocket.handshake.auth = {};
      mockPrisma.authSession.findUnique.mockResolvedValue(null);

      await gateway.handleTimerStart(mockSocket as any, {
        sessionId: 'sess-123',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('timer:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya guru yang dapat memulai timer kelas',
      });
      expect(mockClassroomTimerRuntime.startTimer).not.toHaveBeenCalled();
    });

    it('rejects non-owner teacher attempting timer:pause', async () => {
      mockSocket.handshake.auth = { token: 'valid-token' };
      mockPrisma.authSession.findUnique.mockResolvedValue({
        user: { id: 'impostor-teacher', email: 'impostor@sekolah.id' },
      });
      mockSessionsService.findOne.mockRejectedValue(new Error('Forbidden'));

      await gateway.handleTimerPause(mockSocket as any, {
        sessionId: 'sess-123',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('timer:error', {
        code: 'FORBIDDEN',
        message: 'Anda bukan pemilik sesi kelas ini',
      });
      expect(mockClassroomTimerRuntime.pauseTimer).not.toHaveBeenCalled();
    });
  });
});
