import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from './sessions.service';
import { SessionMemoryService } from './session-memory.service';
import { QuizRuntimeService } from './quiz-runtime.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { PollRuntimeService } from './poll-runtime.service';
import { PollsService } from '../polls/polls.service';
import { QuestionBoxRuntimeService } from './question-box-runtime.service';
import { RaiseHandRuntimeService } from './raise-hand-runtime.service';
import { BrainstormRuntimeService } from './brainstorm-runtime.service';
import { ExitTicketRuntimeService } from './exit-ticket-runtime.service';
import { ClassroomTimerRuntimeService } from './classroom-timer-runtime.service';
import { JoinCodeRateLimitGuard } from './guards/join-code-rate-limit.guard';
import {
  joinCodeSchema,
  joinSessionSchema,
  sessionActionSchema,
  sessionHeartbeatSchema,
  quizAnswerSubmissionSchema,
  pollResponseSubmissionSchema,
  submitQuestionSchema,
  moderateQuestionSchema,
  raiseHandActionSchema,
  moderateHandActionSchema,
  createBrainstormSchema,
  brainstormActionSchema,
  submitBrainstormIdeaSchema,
  moderateBrainstormIdeaSchema,
  createExitTicketSchema,
  exitTicketActionSchema,
  submitExitTicketSchema,
  setClassroomTimerSchema,
  startClassroomTimerSchema,
  resetClassroomTimerSchema,
  timerActionSchema,
} from '@walikelas/validation';
import type {
  SessionJoinPayload,
  SessionStartPayload,
  SessionEndPayload,
  SessionHeartbeatPayload,
  QuizStartPayload,
  QuizAnswerPayload,
  QuizNextQuestionPayload,
  QuizEndQuestionPayload,
  QuizFinishPayload,
  PollStartPayload,
  PollRespondPayload,
  PollClosePayload,
  SubmitQuestionPayload,
  HighlightQuestionPayload,
  UnhighlightQuestionPayload,
  AnswerQuestionPayload,
  DismissQuestionPayload,
  RaiseHandPayload,
  LowerHandPayload,
  AcknowledgeHandPayload,
  StartSpeakingPayload,
  LowerParticipantHandPayload,
  LowerAllHandsPayload,
  CreateBrainstormPayload,
  OpenBrainstormPayload,
  PauseBrainstormPayload,
  CloseBrainstormPayload,
  SubmitBrainstormIdeaPayload,
  HideBrainstormIdeaPayload,
  RestoreBrainstormIdeaPayload,
  CreateExitTicketPayload,
  OpenExitTicketPayload,
  CloseExitTicketPayload,
  SubmitExitTicketPayload,
  SetClassroomTimerPayload,
  StartClassroomTimerPayload,
  PauseClassroomTimerPayload,
  ResumeClassroomTimerPayload,
  ResetClassroomTimerPayload,
  ClassroomTimerState,
} from '@walikelas/types';

@WebSocketGateway({
  cors: {
    origin: (
      process.env.CORS_ALLOWED_ORIGINS ||
      'http://localhost:3006,http://127.0.0.1:3006,http://localhost:3000,http://127.0.0.1:3000'
    )
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  },
  namespace: '/sessions',
})
export class SessionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SessionsGateway.name);

  // REAL-001: 500ms trailing debounce timer map per session for room-wide quiz stats broadcasts
  private quizStatsDebounceTimers = new Map<string, NodeJS.Timeout>();

  private scheduleQuizStatsBroadcast(
    sessionId: string,
    answeredCount: number,
    totalParticipants: number,
  ): void {
    const existing = this.quizStatsDebounceTimers.get(sessionId);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.quizStatsDebounceTimers.delete(sessionId);
      this.server.to(`session:${sessionId}`).emit('quiz:stats-update', {
        answeredCount,
        totalParticipants,
      });
    }, 500);

    this.quizStatsDebounceTimers.set(sessionId, timer);
  }

  private flushQuizStatsBroadcast(sessionId: string): void {
    const existing = this.quizStatsDebounceTimers.get(sessionId);
    if (existing) {
      clearTimeout(existing);
      this.quizStatsDebounceTimers.delete(sessionId);
    }
  }

  onModuleDestroy(): void {
    for (const timer of this.quizStatsDebounceTimers.values()) {
      clearTimeout(timer);
    }
    this.quizStatsDebounceTimers.clear();
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionsService: SessionsService,
    private readonly memory: SessionMemoryService,
    private readonly quizRuntime: QuizRuntimeService,
    private readonly quizzesService: QuizzesService,
    private readonly pollRuntime: PollRuntimeService,
    private readonly pollsService: PollsService,
    private readonly questionBoxRuntime: QuestionBoxRuntimeService,
    private readonly raiseHandRuntime: RaiseHandRuntimeService,
    private readonly brainstormRuntime: BrainstormRuntimeService,
    private readonly exitTicketRuntime: ExitTicketRuntimeService,
    private readonly classroomTimerRuntime: ClassroomTimerRuntimeService,
  ) {
    this.classroomTimerRuntime.onCompleted((sessionId, state) => {
      const payload = {
        timer: state,
        serverTime: Date.now(),
      };
      if (state.visibility === 'SHARED_TIMER') {
        this.server?.to(`session:${sessionId}`).emit('timer:completed', state);
        this.server?.to(`session:${sessionId}`).emit('timer:state', payload);
      } else {
        this.server?.to(`session:${sessionId}:teachers`).emit('timer:completed', state);
        this.server?.to(`session:${sessionId}:teachers`).emit('timer:state', payload);
      }
    });
  }

  /**
   * Helper: Parse session token from socket handshake (cookie or auth/header).
   */
  private extractSessionToken(client: Socket): string | null {
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token as string;
    }

    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1] || null;
    }

    const cookieHeader = client.handshake.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)wk_session=([^;]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    return null;
  }

  /**
   * Helper: Extract client IP from socket handshake.
   */
  private getClientIp(client: Socket): string {
    const forwarded = client.handshake.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0].split(',')[0].trim();
    }
    return client.handshake.address || 'unknown-ip';
  }

  /**
   * Helper: Authenticate teacher from socket handshake.
   * Checks in-memory socket cache first (0ms latency), falling back to DB on initial connection.
   */
  private async authenticateTeacher(client: Socket): Promise<{ id: string; email: string } | null> {
    if (!client.data) {
      client.data = {};
    }

    if (client.data.teacherId && client.data.teacherEmail) {
      return {
        id: client.data.teacherId,
        email: client.data.teacherEmail,
      };
    }

    const token = this.extractSessionToken(client);
    if (!token) return null;

    try {
      const authSession = await this.prisma.authSession.findUnique({
        where: { sessionToken: token },
        include: { user: true },
      });

      if (!authSession || authSession.expiresAt < new Date()) {
        return null;
      }

      if (authSession.user.status === 'SUSPENDED') {
        return null;
      }

      client.data.teacherId = authSession.user.id;
      client.data.teacherEmail = authSession.user.email;

      return {
        id: authSession.user.id,
        email: authSession.user.email,
      };
    } catch (err: any) {
      this.logger.warn(`Database connection slow or cold-starting during socket auth: ${err.message}. Retrying once...`);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const retrySession = await this.prisma.authSession.findUnique({
          where: { sessionToken: token },
          include: { user: true },
        });

        if (!retrySession || retrySession.expiresAt < new Date() || retrySession.user.status === 'SUSPENDED') {
          return null;
        }

        client.data.teacherId = retrySession.user.id;
        client.data.teacherEmail = retrySession.user.email;

        return {
          id: retrySession.user.id,
          email: retrySession.user.email,
        };
      } catch (retryErr: any) {
        this.logger.error(`Retry authenticating teacher failed: ${retryErr.message}`);
        return null;
      }
    }
  }

  /**
   * Helper: Verify teacher session ownership.
   * Leverages in-memory socket verification cache to eliminate repetitive PostgreSQL queries on every realtime event.
   */
  private async verifyTeacherSession(
    client: Socket,
    sessionId: string,
    teacherId: string,
  ): Promise<boolean> {
    if (!client.data) {
      client.data = {};
    }

    if (
      client.data.verifiedSessionId === sessionId &&
      client.data.teacherId === teacherId
    ) {
      return true;
    }

    const teacherSockets =
      typeof this.memory.getTeacherSockets === 'function'
        ? this.memory.getTeacherSockets(sessionId)
        : [];
    if (teacherSockets.includes(client.id) && client.data.teacherId === teacherId) {
      client.data.verifiedSessionId = sessionId;
      return true;
    }

    try {
      await this.sessionsService.findOne(sessionId, teacherId);
      client.data.verifiedSessionId = sessionId;
      return true;
    } catch {
      return false;
    }
  }

  handleConnection(client: Socket): void {
    this.logger.debug(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Socket disconnected: ${client.id}`);

    const result = this.memory.handleDisconnect(client.id);
    if (!result) return;

    if (result.role === 'PARTICIPANT' && result.participant && !result.participant.isOnline) {
      const remainingOnline = this.memory.getOnlineParticipantCount(result.sessionId);

      this.server.to(`session:${result.sessionId}`).emit('session:participant-left', {
        participantId: result.participant.id,
        displayName: result.participant.displayName,
        count: remainingOnline,
      });

      this.logger.log(
        `Participant left: [${result.participant.displayName}] from session ${result.sessionId}. Online: ${remainingOnline}`,
      );
    }
  }

  /**
   * Event: session:join
   */
  @SubscribeMessage('session:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: SessionJoinPayload & {
      isTeacher?: boolean;
      isProjector?: boolean;
      sessionId?: string;
    },
  ): Promise<void> {
    try {
      const teacher = await this.authenticateTeacher(client);

      if (payload.isTeacher) {
        if (!teacher) {
          client.emit('session:error', {
            code: 'UNAUTHORIZED',
            message: 'Gagal memverifikasi akun guru. Silakan muat ulang halaman.',
          });
          return;
        }

        let sessionId = payload.sessionId;

        if (!sessionId && payload.joinCode) {
          try {
            const session = await this.prisma.session.findFirst({
              where: { joinCode: payload.joinCode.trim().toUpperCase() },
            });
            sessionId = session?.id;
          } catch (dbErr: any) {
            this.logger.warn(`Failed to find session by joinCode: ${dbErr.message}`);
          }
        }

        if (!sessionId) {
          client.emit('session:error', {
            code: 'SESSION_NOT_FOUND',
            message: 'Sesi tidak ditemukan',
          });
          return;
        }

        const session = await this.sessionsService.findOne(sessionId, teacher.id);

        this.memory.registerTeacher(session.id, client.id);
        if (!client.data) {
          client.data = {};
        }
        client.data.teacherId = teacher.id;
        client.data.teacherEmail = teacher.email;
        client.data.verifiedSessionId = session.id;
        client.join(`session:${session.id}`);
        client.join(`session:${session.id}:teachers`);

        const snapshot = await this.sessionsService.getTeacherSnapshot(session.id, teacher.id);
        client.emit('session:state', snapshot);

        // If quiz is currently active, send teacher quiz snapshot
        if (this.quizRuntime.isQuizActive(session.id)) {
          const participants = this.memory.getParticipants(session.id);
          const quizSnapshot = this.quizRuntime.getTeacherSnapshot(session.id, participants);
          client.emit('quiz:state', quizSnapshot);
        }

        // If poll is active or exists, send teacher poll snapshot
        if (this.pollRuntime.hasPoll(session.id)) {
          const participants = this.memory.getParticipants(session.id);
          const pollSnapshot = this.pollRuntime.getTeacherSnapshot(session.id, participants);
          if (pollSnapshot) {
            client.emit('poll:state', pollSnapshot);
          }
        }

        // Send teacher question box snapshot
        const questionSnapshot = this.questionBoxRuntime.getTeacherSnapshot(session.id);
        client.emit('question:state', questionSnapshot);

        // Send teacher raise hand snapshot
        const handSnapshot = this.raiseHandRuntime.getTeacherSnapshot(session.id);
        client.emit('hand:state', handSnapshot);

        // Send teacher brainstorm snapshot
        const brainstormSnapshot = this.brainstormRuntime.getTeacherSnapshot(session.id);
        client.emit('brainstorm:state', brainstormSnapshot);

        // Send teacher exit ticket snapshot
        const exitTicketSnapshot = this.exitTicketRuntime.getTeacherSnapshot(
          session.id,
          this.memory.getOnlineParticipantCount(session.id),
        );
        client.emit('exit-ticket:state', exitTicketSnapshot);

        // Send teacher classroom timer snapshot
        const timerSnapshot = this.classroomTimerRuntime.getTeacherSnapshot(session.id);
        client.emit('timer:state', timerSnapshot);

        this.logger.log(`Teacher ${teacher.id} joined session room ${session.id}`);
        return;
      }

      // Projector Screen Join (Passive display mirror - does NOT register as student participant)
      if (payload.isProjector) {
        if (!payload.joinCode) {
          client.emit('session:error', {
            code: 'VALIDATION_ERROR',
            message: 'Kode sesi wajib diisi untuk proyektor',
          });
          return;
        }

        const codeValidation = joinCodeSchema.safeParse(payload.joinCode);
        if (!codeValidation.success) {
          client.emit('session:error', {
            code: 'VALIDATION_ERROR',
            message: 'Kode sesi tidak valid',
          });
          return;
        }

        const sessionPreview = await this.sessionsService.verifyJoinCode(codeValidation.data);

        this.memory.registerProjector(sessionPreview.id, client.id);
        client.join(`session:${sessionPreview.id}`);
        client.join(`session:${sessionPreview.id}:projectors`);

        const snapshot = await this.sessionsService.getProjectorSnapshot(sessionPreview.id);
        client.emit('session:state', snapshot);

        // If quiz is currently active, send teacher snapshot so projector can see question & progress
        if (this.quizRuntime.isQuizActive(sessionPreview.id)) {
          const participants = this.memory.getParticipants(sessionPreview.id);
          const quizSnapshot = this.quizRuntime.getTeacherSnapshot(sessionPreview.id, participants);
          client.emit('quiz:state', quizSnapshot);
        }

        // If poll is active or exists, send poll snapshot
        if (this.pollRuntime.hasPoll(sessionPreview.id)) {
          const participants = this.memory.getParticipants(sessionPreview.id);
          const pollSnapshot = this.pollRuntime.getTeacherSnapshot(sessionPreview.id, participants);
          if (pollSnapshot) {
            client.emit('poll:state', pollSnapshot);
          }
        }

        // Send question box snapshot
        const questionSnapshot = this.questionBoxRuntime.getTeacherSnapshot(sessionPreview.id);
        client.emit('question:state', questionSnapshot);

        // Send classroom timer snapshot
        const timerSnapshot = this.classroomTimerRuntime.getParticipantSnapshot(sessionPreview.id);
        client.emit('timer:state', timerSnapshot);

        // Send brainstorm board snapshot
        const brainstormSnapshot = this.brainstormRuntime.getTeacherSnapshot(sessionPreview.id);
        client.emit('brainstorm:state', brainstormSnapshot);

        // Send exit ticket snapshot
        const participants = this.memory.getParticipants(sessionPreview.id);
        const exitTicketSnapshot = this.exitTicketRuntime.getTeacherSnapshot(
          sessionPreview.id,
          participants.length,
        );
        client.emit('exit-ticket:state', exitTicketSnapshot);

        // Send raise hand snapshot
        const handSnapshot = this.raiseHandRuntime.getTeacherSnapshot(sessionPreview.id);
        client.emit('hand:state', handSnapshot);

        this.logger.log(`Projector joined session room ${sessionPreview.id}`);
        return;
      }

      // Participant Join
      const clientIp = this.getClientIp(client);
      const rateLimit = JoinCodeRateLimitGuard.check(clientIp);
      if (!rateLimit.allowed) {
        client.emit('session:error', {
          code: 'TOO_MANY_REQUESTS',
          message: `Terlalu banyak percobaan bergabung. Silakan coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
        });
        return;
      }

      const validation = joinSessionSchema.safeParse({
        code: payload.joinCode,
        displayName: payload.displayName,
        participantId: payload.participantId,
        reconnectToken: payload.reconnectToken,
      });

      if (!validation.success) {
        client.emit('session:error', {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message || 'Data bergabung tidak valid',
        });
        return;
      }

      const { code, displayName, participantId, reconnectToken } = validation.data;

      const sessionPreview = await this.sessionsService.verifyJoinCode(code);

      const participant = this.memory.addParticipant(
        sessionPreview.id,
        displayName,
        participantId,
        client.id,
        reconnectToken,
      );

      client.join(`session:${sessionPreview.id}`);

      const snapshot = await this.sessionsService.getParticipantSnapshot(
        sessionPreview.id,
        participant.id,
      );
      client.emit('session:state', snapshot);

      // If quiz is currently active, send participant quiz snapshot
      if (this.quizRuntime.isQuizActive(sessionPreview.id)) {
        const quizSnapshot = this.quizRuntime.getParticipantSnapshot(
          sessionPreview.id,
          participant.id,
        );
        client.emit('quiz:state', quizSnapshot);
      }

      // If poll is active, send participant poll snapshot
      if (this.pollRuntime.isPollActive(sessionPreview.id)) {
        const pollSnapshot = this.pollRuntime.getParticipantSnapshot(
          sessionPreview.id,
          participant.id,
        );
        if (pollSnapshot) {
          client.emit('poll:state', pollSnapshot);
        }
      }

      // Send participant question box snapshot
      const questionSnapshot = this.questionBoxRuntime.getParticipantSnapshot(
        sessionPreview.id,
        participant.id,
      );
      client.emit('question:state', questionSnapshot);

      // Send participant raise hand snapshot
      const handSnapshot = this.raiseHandRuntime.getParticipantSnapshot(
        sessionPreview.id,
        participant.id,
      );
      client.emit('hand:state', handSnapshot);

      // Send participant brainstorm snapshot
      const brainstormSnapshot = this.brainstormRuntime.getParticipantSnapshot(
        sessionPreview.id,
        participant.id,
      );
      client.emit('brainstorm:state', brainstormSnapshot);

      // Send participant exit ticket snapshot
      const exitTicketSnapshot = this.exitTicketRuntime.getParticipantSnapshot(
        sessionPreview.id,
        participant.id,
      );
      client.emit('exit-ticket:state', exitTicketSnapshot);

      // Send participant classroom timer snapshot (null if PRIVATE_TIMER)
      const timerSnapshot = this.classroomTimerRuntime.getParticipantSnapshot(sessionPreview.id);
      client.emit('timer:state', timerSnapshot);

      const totalOnline = this.memory.getOnlineParticipantCount(sessionPreview.id);
      this.server.to(`session:${sessionPreview.id}`).emit('session:participant-joined', {
        participant: {
          id: participant.id,
          displayName: participant.displayName,
        },
        count: totalOnline,
      });

      this.logger.log(
        `Participant [${participant.displayName}] joined session ${sessionPreview.id}. Total online: ${totalOnline}`,
      );
    } catch (err: any) {
      this.logger.warn(`Error during session:join: ${err.message}`);
      client.emit('session:error', {
        code: 'JOIN_FAILED',
        message: err.message || 'Gagal bergabung ke sesi',
      });
    }
  }

  /**
   * Event: session:start
   */
  @SubscribeMessage('session:start')
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionStartPayload,
  ): Promise<void> {
    try {
      const validation = sessionActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('session:error', {
          code: 'VALIDATION_ERROR',
          message: 'ID sesi tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('session:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru pemilik sesi yang dapat memulai sesi',
        });
        return;
      }

      const updated = await this.sessionsService.startSession(
        validation.data.sessionId,
        teacher.id,
      );

      this.server.to(`session:${updated.id}`).emit('session:started', {
        startedAt: updated.startedAt || new Date().toISOString(),
      });

      const teacherSnapshot = await this.sessionsService.getTeacherSnapshot(updated.id, teacher.id);
      client.emit('session:state', teacherSnapshot);

      this.logger.log(`Session ${updated.id} started via WebSocket by teacher ${teacher.id}`);
    } catch (err: any) {
      this.logger.warn(`Error during session:start: ${err.message}`);
      client.emit('session:error', {
        code: 'START_FAILED',
        message: err.message || 'Gagal memulai sesi',
      });
    }
  }

  /**
   * Event: session:end
   */
  @SubscribeMessage('session:end')
  async handleEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionEndPayload,
  ): Promise<void> {
    try {
      const validation = sessionActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('session:error', {
          code: 'VALIDATION_ERROR',
          message: 'ID sesi tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('session:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru pemilik sesi yang dapat mengakhiri sesi',
        });
        return;
      }

      const updated = await this.sessionsService.endSession(validation.data.sessionId, teacher.id);

      // Clear in-memory session participants and socket mappings
      this.memory.clearSession(validation.data.sessionId);
      // Clear any active quiz runtime
      this.quizRuntime.clearQuiz(validation.data.sessionId);
      // Clear any active poll runtime
      this.pollRuntime.clearPoll(validation.data.sessionId);
      // Clear question box runtime
      this.questionBoxRuntime.clearSession(validation.data.sessionId);
      // Clear raise hand runtime
      this.raiseHandRuntime.clearSession(validation.data.sessionId);
      // Clear brainstorm runtime
      this.brainstormRuntime.clearSession(validation.data.sessionId);
      // Clear exit ticket runtime
      this.exitTicketRuntime.clearSession(validation.data.sessionId);
      // Clear classroom timer runtime
      this.classroomTimerRuntime.clearSession(validation.data.sessionId);

      this.server.to(`session:${updated.id}`).emit('session:ended', {
        endedAt: updated.endedAt || new Date().toISOString(),
      });

      this.logger.log(`Session ${updated.id} ended via WebSocket by teacher ${teacher.id}`);
    } catch (err: any) {
      this.logger.warn(`Error during session:end: ${err.message}`);
      client.emit('session:error', {
        code: 'END_FAILED',
        message: err.message || 'Gagal mengakhiri sesi',
      });
    }
  }

  /**
   * Event: session:heartbeat
   */
  @SubscribeMessage('session:heartbeat')
  handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionHeartbeatPayload,
  ): void {
    const validation = sessionHeartbeatSchema.safeParse(payload);
    if (!validation.success) return;

    const { sessionId, participantId } = validation.data;
    if (participantId) {
      this.memory.touchParticipant(sessionId, participantId);
    }
  }

  /**
   * Event: session:leave
   */
  @SubscribeMessage('session:leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; participantId?: string },
  ): void {
    if (!payload?.sessionId) return;
    client.leave(`session:${payload.sessionId}`);
    const result = this.memory.handleDisconnect(client.id);
    if (result && result.participant) {
      const remainingOnline = this.memory.getOnlineParticipantCount(payload.sessionId);
      this.server.to(`session:${payload.sessionId}`).emit('session:participant-left', {
        participantId: result.participant.id,
        displayName: result.participant.displayName,
        count: remainingOnline,
      });
    }
  }

  // ==========================================
  // LIVE QUIZ REALTIME EVENTS
  // ==========================================

  /**
   * Event: quiz:start
   * Teacher launches a quiz into the active session.
   */
  @SubscribeMessage('quiz:start')
  async handleQuizStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: QuizStartPayload,
  ): Promise<void> {
    try {
      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('quiz:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat memulai kuis',
        });
        return;
      }

      // Verify session ownership
      await this.sessionsService.findOne(payload.sessionId, teacher.id);

      // Verify and fetch quiz
      const quiz = await this.quizzesService.findOne(payload.quizId, teacher.id);
      if (!quiz.questions || quiz.questions.length === 0) {
        client.emit('quiz:error', {
          code: 'EMPTY_QUIZ',
          message: 'Kuis tidak memiliki pertanyaan',
        });
        return;
      }

      // Initialize quiz runtime
      const activeState = this.quizRuntime.initQuiz(payload.sessionId, quiz);

      // Broadcast quiz:started to room
      this.server.to(`session:${payload.sessionId}`).emit('quiz:started', {
        quizId: quiz.id,
        title: quiz.title,
        totalQuestions: quiz.questions.length,
      });

      // Broadcast Question 1 to room (SECURITY: options do NOT include isCorrect!)
      const q1 = activeState.questions[0]!;
      const participantQ = {
        id: q1.id,
        order: q1.order,
        questionText: q1.questionText,
        points: q1.points,
        options: q1.options.map((o) => ({
          id: o.id,
          order: o.order,
          optionText: o.optionText,
        })),
      };

      this.server.to(`session:${payload.sessionId}`).emit('quiz:question-started', {
        questionNumber: 1,
        totalQuestions: activeState.questions.length,
        question: participantQ,
        deadline: activeState.questionDeadline,
      });

      // Send teacher-specific snapshot (includes correct answer)
      const participants = this.memory.getParticipants(payload.sessionId);
      const teacherSnapshot = this.quizRuntime.getTeacherSnapshot(payload.sessionId, participants);
      client.emit('quiz:state', teacherSnapshot);

      this.logger.log(`Quiz [${quiz.title}] started on session ${payload.sessionId}`);
    } catch (err: any) {
      this.logger.warn(`Error during quiz:start: ${err.message}`);
      client.emit('quiz:error', {
        code: 'START_FAILED',
        message: err.message || 'Gagal memulai kuis',
      });
    }
  }

  /**
   * Event: quiz:answer
   * Participant submits an answer.
   */
  @SubscribeMessage('quiz:answer')
  handleQuizAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: QuizAnswerPayload,
  ): void {
    const validation = quizAnswerSubmissionSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('quiz:error', {
        code: 'VALIDATION_ERROR',
        message: 'Format jawaban tidak valid',
      });
      return;
    }

    const entry = this.memory.getSocketEntry(client.id);
    if (!entry || entry.role !== 'PARTICIPANT') {
      client.emit('quiz:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya peserta yang dapat menjawab kuis',
      });
      return;
    }

    const { sessionId, questionId, optionId } = validation.data;
    if (entry.sessionId !== sessionId) {
      client.emit('quiz:error', {
        code: 'FORBIDDEN',
        message: 'Sesi tidak sesuai dengan koneksi aktif',
      });
      return;
    }

    const result = this.quizRuntime.recordAnswer(
      sessionId,
      entry.participantId,
      questionId,
      optionId,
    );

    if (!result.accepted) {
      client.emit('quiz:error', {
        code: 'SUBMISSION_REJECTED',
        message: result.error || 'Jawaban ditolak',
      });
      return;
    }

    // Acknowledge submission to participant
    client.emit('quiz:answer-accepted', {
      questionId,
      optionId,
    });

    // Update teacher with realtime answer stats
    const participants = this.memory.getParticipants(sessionId);
    const teacherSnapshot = this.quizRuntime.getTeacherSnapshot(sessionId, participants);
    if (teacherSnapshot) {
      // REAL-001: Route live distribution strictly to teacher sockets room
      this.server.to(`session:${sessionId}:teachers`).emit('quiz:distribution-update', {
        distribution: teacherSnapshot.distribution,
        answeredCount: teacherSnapshot.answeredCount,
      });

      // REAL-001: Debounce room-wide stats broadcast (500ms) to eliminate O(N^2) broadcast storm
      this.scheduleQuizStatsBroadcast(
        sessionId,
        teacherSnapshot.answeredCount,
        teacherSnapshot.totalParticipants,
      );
    }
  }

  /**
   * Event: quiz:end-question
   * Teacher closes submissions for current question and reveals answers/distribution.
   */
  @SubscribeMessage('quiz:end-question')
  async handleQuizEndQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: QuizEndQuestionPayload,
  ): Promise<void> {
    try {
      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('quiz:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menutup pertanyaan',
        });
        return;
      }

      await this.sessionsService.findOne(payload.sessionId, teacher.id);

      this.flushQuizStatsBroadcast(payload.sessionId);

      const result = this.quizRuntime.endQuestion(payload.sessionId);
      if (!result) return;

      // Broadcast question ended with correct option and distribution
      this.server.to(`session:${payload.sessionId}`).emit('quiz:question-ended', {
        correctOptionId: result.correctOptionId,
        distribution: result.distribution,
      });

      // Update teacher snapshot
      const participants = this.memory.getParticipants(payload.sessionId);
      const teacherSnapshot = this.quizRuntime.getTeacherSnapshot(payload.sessionId, participants);
      client.emit('quiz:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('quiz:error', { code: 'END_QUESTION_FAILED', message: err.message });
    }
  }

  /**
   * Event: quiz:next-question
   * Teacher advances to next question or concludes quiz if at the end.
   */
  @SubscribeMessage('quiz:next-question')
  async handleQuizNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: QuizNextQuestionPayload,
  ): Promise<void> {
    try {
      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('quiz:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat memajukan pertanyaan',
        });
        return;
      }

      await this.sessionsService.findOne(payload.sessionId, teacher.id);

      const result = this.quizRuntime.nextQuestion(payload.sessionId);
      if (!result) return;

      const participants = this.memory.getParticipants(payload.sessionId);

      if (result.isComplete) {
        // Quiz completed: broadcast leaderboard
        const leaderboard = this.quizRuntime.getLeaderboard(payload.sessionId, participants);
        this.server.to(`session:${payload.sessionId}`).emit('quiz:completed', {
          leaderboard,
        });

        const teacherSnapshot = this.quizRuntime.getTeacherSnapshot(
          payload.sessionId,
          participants,
        );
        client.emit('quiz:state', teacherSnapshot);
        return;
      }

      // Next question active: broadcast to participants (without isCorrect)
      const activeState = this.quizRuntime.getActiveQuiz(payload.sessionId);
      if (activeState) {
        const nextQ = activeState.questions[activeState.currentQuestionIndex]!;
        const participantQ = {
          id: nextQ.id,
          order: nextQ.order,
          questionText: nextQ.questionText,
          points: nextQ.points,
          options: nextQ.options.map((o) => ({
            id: o.id,
            order: o.order,
            optionText: o.optionText,
          })),
        };

        this.server.to(`session:${payload.sessionId}`).emit('quiz:question-started', {
          questionNumber: result.questionNumber,
          totalQuestions: result.totalQuestions,
          question: participantQ,
          deadline: activeState.questionDeadline,
        });

        const teacherSnapshot = this.quizRuntime.getTeacherSnapshot(
          payload.sessionId,
          participants,
        );
        client.emit('quiz:state', teacherSnapshot);
      }
    } catch (err: any) {
      client.emit('quiz:error', { code: 'NEXT_QUESTION_FAILED', message: err.message });
    }
  }

  /**
   * Event: quiz:finish
   * Teacher finishes quiz immediately.
   */
  @SubscribeMessage('quiz:finish')
  async handleQuizFinish(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: QuizFinishPayload,
  ): Promise<void> {
    try {
      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('quiz:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat mengakhiri kuis',
        });
        return;
      }

      await this.sessionsService.findOne(payload.sessionId, teacher.id);

      this.flushQuizStatsBroadcast(payload.sessionId);

      this.quizRuntime.finishQuiz(payload.sessionId);

      const participants = this.memory.getParticipants(payload.sessionId);
      const leaderboard = this.quizRuntime.getLeaderboard(payload.sessionId, participants);

      this.server.to(`session:${payload.sessionId}`).emit('quiz:completed', {
        leaderboard,
      });

      const teacherSnapshot = this.quizRuntime.getTeacherSnapshot(payload.sessionId, participants);
      client.emit('quiz:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('quiz:error', { code: 'FINISH_FAILED', message: err.message });
    }
  }

  // ==========================================
  // LIVE POLL REALTIME EVENTS
  // ==========================================

  /**
   * Event: poll:start
   * Teacher launches a live poll into the active session.
   */
  @SubscribeMessage('poll:start')
  async handlePollStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PollStartPayload,
  ): Promise<void> {
    try {
      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('poll:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat memulai polling',
        });
        return;
      }

      await this.sessionsService.findOne(payload.sessionId, teacher.id);

      const poll = await this.pollsService.findOne(payload.pollId, teacher.id);
      if (!poll.options || poll.options.length < 2) {
        client.emit('poll:error', {
          code: 'INVALID_POLL',
          message: 'Polling harus memiliki minimal 2 opsi',
        });
        return;
      }

      const activeState = this.pollRuntime.initPoll(payload.sessionId, poll);

      this.server.to(`session:${payload.sessionId}`).emit('poll:started', {
        pollId: poll.id,
        title: poll.title,
        question: poll.question,
        type: poll.type,
        options: activeState.options,
        settings: activeState.settings,
      });

      const participants = this.memory.getParticipants(payload.sessionId);
      const teacherSnapshot = this.pollRuntime.getTeacherSnapshot(payload.sessionId, participants);
      client.emit('poll:state', teacherSnapshot);

      this.logger.log(`Poll [${poll.title}] started on session ${payload.sessionId}`);
    } catch (err: any) {
      this.logger.warn(`Error during poll:start: ${err.message}`);
      client.emit('poll:error', {
        code: 'START_FAILED',
        message: err.message || 'Gagal memulai polling',
      });
    }
  }

  /**
   * Event: poll:respond
   * Participant submits poll choice(s).
   */
  @SubscribeMessage('poll:respond')
  handlePollRespond(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PollRespondPayload,
  ): void {
    const validation = pollResponseSubmissionSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('poll:error', {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Pilihan tidak valid',
      });
      return;
    }

    const entry = this.memory.getSocketEntry(client.id);
    if (!entry || entry.role !== 'PARTICIPANT') {
      client.emit('poll:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya peserta yang dapat menjawab polling',
      });
      return;
    }

    const { sessionId, pollId, optionId, optionIds } = validation.data;
    if (entry.sessionId !== sessionId) {
      client.emit('poll:error', {
        code: 'FORBIDDEN',
        message: 'Sesi tidak sesuai dengan koneksi aktif',
      });
      return;
    }

    const result = this.pollRuntime.recordResponse(
      sessionId,
      entry.participantId,
      optionId,
      optionIds,
    );

    if (!result.accepted) {
      client.emit('poll:error', {
        code: 'SUBMISSION_REJECTED',
        message: result.error || 'Respon ditolak',
      });
      return;
    }

    client.emit('poll:response-accepted', {
      pollId,
      selectedOptionIds: result.selectedOptionIds || [],
    });

    const participants = this.memory.getParticipants(sessionId);
    const teacherSnapshot = this.pollRuntime.getTeacherSnapshot(sessionId, participants);
    if (teacherSnapshot) {
      this.server.to(`session:${sessionId}`).emit('poll:stats-update', {
        responseCount: teacherSnapshot.responseCount,
        totalParticipants: teacherSnapshot.totalParticipants,
        responseRate: teacherSnapshot.responseRate,
        distribution: teacherSnapshot.settings?.showResultsToParticipants
          ? teacherSnapshot.distribution
          : undefined,
        percentages: teacherSnapshot.settings?.showResultsToParticipants
          ? teacherSnapshot.percentages
          : undefined,
      });

      this.server.to(`session:${sessionId}:teachers`).emit('poll:state', teacherSnapshot);
    }
  }

  /**
   * Event: poll:close
   * Teacher closes the active poll.
   */
  @SubscribeMessage('poll:close')
  async handlePollClose(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PollClosePayload,
  ): Promise<void> {
    try {
      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('poll:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menutup polling',
        });
        return;
      }

      await this.sessionsService.findOne(payload.sessionId, teacher.id);

      const result = this.pollRuntime.closePoll(payload.sessionId);
      if (!result) return;

      this.server.to(`session:${payload.sessionId}`).emit('poll:closed', result);

      const participants = this.memory.getParticipants(payload.sessionId);
      const teacherSnapshot = this.pollRuntime.getTeacherSnapshot(payload.sessionId, participants);
      client.emit('poll:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('poll:error', { code: 'CLOSE_FAILED', message: err.message });
    }
  }

  // ==========================================
  // QUESTION BOX REALTIME EVENTS
  // ==========================================

  /**
   * Event: question:submit
   * Participant submits a question to the active session.
   */
  @SubscribeMessage('question:submit')
  handleQuestionSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitQuestionPayload,
  ): void {
    const validation = submitQuestionSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('question:error', {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Format pertanyaan tidak valid',
      });
      return;
    }

    const entry = this.memory.getSocketEntry(client.id);
    if (!entry || entry.role !== 'PARTICIPANT') {
      client.emit('question:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya peserta yang dapat mengirim pertanyaan',
      });
      return;
    }

    const { sessionId, content, isAnonymous } = validation.data;
    if (entry.sessionId !== sessionId) {
      client.emit('question:error', {
        code: 'FORBIDDEN',
        message: 'Sesi tidak sesuai dengan koneksi aktif',
      });
      return;
    }

    const participant = this.memory.getParticipant(sessionId, entry.participantId);
    const authorName = participant?.displayName || 'Peserta';

    const result = this.questionBoxRuntime.submitQuestion(
      sessionId,
      entry.participantId,
      authorName,
      content,
      isAnonymous,
    );

    if (!result.accepted || !result.question) {
      client.emit('question:error', {
        code: 'SUBMISSION_REJECTED',
        message: result.error || 'Gagal mengirim pertanyaan',
      });
      return;
    }

    // Acknowledge submission to the submitting participant
    client.emit('question:submitted', {
      question: {
        id: result.question.id,
        content: result.question.content,
        status: result.question.status,
        isAnonymous: result.question.isAnonymous,
        createdAt: result.question.createdAt,
      },
    });

    // Notify teacher(s) in room session:${sessionId}:teachers
    this.server.to(`session:${sessionId}:teachers`).emit('question:created', {
      question: result.question,
    });

    // Emit count update to teacher(s)
    const counts = this.questionBoxRuntime.getTeacherSnapshot(sessionId);
    this.server.to(`session:${sessionId}:teachers`).emit('question:count-update', {
      pendingCount: counts.pendingCount,
      answeredCount: counts.answeredCount,
      totalCount: counts.totalCount,
    });
  }

  /**
   * Event: question:highlight
   * Teacher highlights a question to feature on projector and student view.
   */
  @SubscribeMessage('question:highlight')
  async handleQuestionHighlight(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: HighlightQuestionPayload,
  ): Promise<void> {
    try {
      const validation = moderateQuestionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('question:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data sorot pertanyaan tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('question:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menyorot pertanyaan',
        });
        return;
      }

      const { sessionId, questionId } = validation.data;
      const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
      if (!isOwner) {
        client.emit('question:error', {
          code: 'FORBIDDEN',
          message: 'Anda bukan pemilik sesi kelas ini',
        });
        return;
      }

      const question = this.questionBoxRuntime.highlightQuestion(sessionId, questionId);
      if (!question) {
        client.emit('question:error', {
          code: 'HIGHLIGHT_FAILED',
          message: 'Pertanyaan tidak dapat disorot',
        });
        return;
      }

      // Broadcast highlighted question to entire session (teacher, projector, participants)
      this.server.to(`session:${sessionId}`).emit('question:highlighted', {
        question: {
          id: question.id,
          content: question.content,
          authorName: question.authorName,
          isAnonymous: question.isAnonymous,
          createdAt: question.createdAt,
        },
      });

      // Update teacher snapshot
      const teacherSnapshot = this.questionBoxRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('question:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('question:error', {
        code: 'HIGHLIGHT_FAILED',
        message: err.message || 'Gagal menyorot pertanyaan',
      });
    }
  }

  /**
   * Event: question:unhighlight
   * Teacher removes highlight from a question.
   */
  @SubscribeMessage('question:unhighlight')
  async handleQuestionUnhighlight(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UnhighlightQuestionPayload,
  ): Promise<void> {
    try {
      const validation = moderateQuestionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('question:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data batal sorot tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('question:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat membatalkan sorotan pertanyaan',
        });
        return;
      }

      const { sessionId, questionId } = validation.data;
      const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
      if (!isOwner) {
        client.emit('question:error', {
          code: 'FORBIDDEN',
          message: 'Anda bukan pemilik sesi kelas ini',
        });
        return;
      }

      const question = this.questionBoxRuntime.unhighlightQuestion(sessionId, questionId);
      if (!question) return;

      // Broadcast unhighlight to entire session
      this.server.to(`session:${sessionId}`).emit('question:unhighlighted', {
        questionId,
      });

      // Update teacher snapshot
      const teacherSnapshot = this.questionBoxRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('question:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:teachers`).emit('question:count-update', {
        pendingCount: teacherSnapshot.pendingCount,
        answeredCount: teacherSnapshot.answeredCount,
        totalCount: teacherSnapshot.totalCount,
      });
    } catch (err: any) {
      client.emit('question:error', {
        code: 'UNHIGHLIGHT_FAILED',
        message: err.message || 'Gagal membatalkan sorotan',
      });
    }
  }

  /**
   * Event: question:answer
   * Teacher marks a question as answered.
   */
  @SubscribeMessage('question:answer')
  async handleQuestionAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AnswerQuestionPayload,
  ): Promise<void> {
    try {
      const validation = moderateQuestionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('question:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data jawab pertanyaan tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('question:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menandai pertanyaan selesai',
        });
        return;
      }

      const { sessionId, questionId } = validation.data;
      const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
      if (!isOwner) {
        client.emit('question:error', {
          code: 'FORBIDDEN',
          message: 'Anda bukan pemilik sesi kelas ini',
        });
        return;
      }

      const question = this.questionBoxRuntime.answerQuestion(sessionId, questionId);
      if (!question) return;

      // Broadcast answered to session
      this.server.to(`session:${sessionId}`).emit('question:answered', {
        questionId,
      });

      // Update teacher snapshot
      const teacherSnapshot = this.questionBoxRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('question:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:teachers`).emit('question:count-update', {
        pendingCount: teacherSnapshot.pendingCount,
        answeredCount: teacherSnapshot.answeredCount,
        totalCount: teacherSnapshot.totalCount,
      });
    } catch (err: any) {
      client.emit('question:error', {
        code: 'ANSWER_FAILED',
        message: err.message || 'Gagal menandai pertanyaan selesai',
      });
    }
  }

  /**
   * Event: question:dismiss
   * Teacher dismisses an inappropriate or duplicate question.
   */
  @SubscribeMessage('question:dismiss')
  async handleQuestionDismiss(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DismissQuestionPayload,
  ): Promise<void> {
    try {
      const validation = moderateQuestionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('question:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data abaikan pertanyaan tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('question:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat mengabaikan pertanyaan',
        });
        return;
      }

      const { sessionId, questionId } = validation.data;
      const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
      if (!isOwner) {
        client.emit('question:error', {
          code: 'FORBIDDEN',
          message: 'Anda bukan pemilik sesi kelas ini',
        });
        return;
      }

      const question = this.questionBoxRuntime.dismissQuestion(sessionId, questionId);
      if (!question) return;

      // Broadcast dismissed to session
      this.server.to(`session:${sessionId}`).emit('question:dismissed', {
        questionId,
      });

      // Update teacher snapshot
      const teacherSnapshot = this.questionBoxRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('question:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:teachers`).emit('question:count-update', {
        pendingCount: teacherSnapshot.pendingCount,
        answeredCount: teacherSnapshot.answeredCount,
        totalCount: teacherSnapshot.totalCount,
      });
    } catch (err: any) {
      client.emit('question:error', {
        code: 'DISMISS_FAILED',
        message: err.message || 'Gagal mengabaikan pertanyaan',
      });
    }
  }

  // ==========================================
  // RAISE HAND / REQUEST TO SPEAK EVENTS
  // ==========================================

  /**
   * Event: hand:raise
   * Participant raises hand to join the speaking queue.
   */
  @SubscribeMessage('hand:raise')
  handleHandRaise(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RaiseHandPayload,
  ): void {
    const validation = raiseHandActionSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('hand:error', {
        code: 'VALIDATION_ERROR',
        message: 'Data angkat tangan tidak valid',
      });
      return;
    }

    const entry = this.memory.getSocketEntry(client.id);
    if (!entry || entry.role !== 'PARTICIPANT') {
      client.emit('hand:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya peserta yang dapat mengangkat tangan',
      });
      return;
    }

    const { sessionId } = validation.data;
    if (entry.sessionId !== sessionId) {
      client.emit('hand:error', {
        code: 'FORBIDDEN',
        message: 'Sesi tidak sesuai dengan koneksi aktif',
      });
      return;
    }

    const participant = this.memory.getParticipant(sessionId, entry.participantId);
    const displayName = participant?.displayName || 'Peserta';

    const result = this.raiseHandRuntime.raiseHand(sessionId, entry.participantId, displayName);
    if (!result.accepted || !result.hand) {
      client.emit('hand:error', {
        code: 'RAISE_REJECTED',
        message: result.error || 'Gagal mengangkat tangan',
      });
      return;
    }

    // Send authoritative participant snapshot back to this participant
    const participantSnapshot = this.raiseHandRuntime.getParticipantSnapshot(
      sessionId,
      entry.participantId,
    );
    client.emit('hand:state', participantSnapshot);

    // Notify teacher room with new hand and updated teacher snapshot
    const teacherSnapshot = this.raiseHandRuntime.getTeacherSnapshot(sessionId);
    this.server.to(`session:${sessionId}:teachers`).emit('hand:raised', {
      hand: result.hand,
      queueCount: teacherSnapshot.raisedCount,
    });
    this.server.to(`session:${sessionId}:teachers`).emit('hand:state', teacherSnapshot);

    // Broadcast queue update to all in session
    this.server.to(`session:${sessionId}`).emit('hand:queue-update', {
      queueCount: teacherSnapshot.raisedCount,
    });
  }

  /**
   * Event: hand:lower
   * Participant voluntarily lowers their own hand while RAISED or ACKNOWLEDGED.
   */
  @SubscribeMessage('hand:lower')
  handleHandLower(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LowerHandPayload,
  ): void {
    const validation = raiseHandActionSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('hand:error', {
        code: 'VALIDATION_ERROR',
        message: 'Data turunkan tangan tidak valid',
      });
      return;
    }

    const entry = this.memory.getSocketEntry(client.id);
    if (!entry || entry.role !== 'PARTICIPANT') {
      client.emit('hand:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya peserta yang dapat menurunkan tangannya sendiri',
      });
      return;
    }

    const { sessionId } = validation.data;
    if (entry.sessionId !== sessionId) {
      client.emit('hand:error', {
        code: 'FORBIDDEN',
        message: 'Sesi tidak sesuai dengan koneksi aktif',
      });
      return;
    }

    const result = this.raiseHandRuntime.lowerHand(sessionId, entry.participantId);
    if (!result.accepted || !result.hand) {
      client.emit('hand:error', {
        code: 'LOWER_REJECTED',
        message: result.error || 'Gagal menurunkan tangan',
      });
      return;
    }

    // Send authoritative participant snapshot back to this participant
    const participantSnapshot = this.raiseHandRuntime.getParticipantSnapshot(
      sessionId,
      entry.participantId,
    );
    client.emit('hand:state', participantSnapshot);

    // Notify session of lowered hand
    this.server.to(`session:${sessionId}`).emit('hand:lowered', {
      handId: result.hand.id,
      participantId: entry.participantId,
    });

    // Update teacher snapshot and broadcast queue update
    const teacherSnapshot = this.raiseHandRuntime.getTeacherSnapshot(sessionId);
    this.server.to(`session:${sessionId}:teachers`).emit('hand:state', teacherSnapshot);
    this.server.to(`session:${sessionId}`).emit('hand:queue-update', {
      queueCount: teacherSnapshot.raisedCount,
    });
  }

  /**
   * Event: hand:acknowledge
   * Teacher acknowledges a participant's raised hand.
   */
  @SubscribeMessage('hand:acknowledge')
  async handleHandAcknowledge(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AcknowledgeHandPayload,
  ): Promise<void> {
    try {
      const validation = moderateHandActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('hand:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data konfirmasi tangan tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('hand:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat mengonfirmasi angkat tangan',
        });
        return;
      }

      const { sessionId, handId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const hand = this.raiseHandRuntime.acknowledgeHand(sessionId, handId);
      if (!hand) return;

      // Broadcast acknowledgment to whole session
      this.server.to(`session:${sessionId}`).emit('hand:acknowledged', {
        handId: hand.id,
        participantId: hand.participantId,
      });

      // Update teacher snapshot
      const teacherSnapshot = this.raiseHandRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('hand:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('hand:error', {
        code: 'ACKNOWLEDGE_FAILED',
        message: err.message || 'Gagal mengonfirmasi tangan',
      });
    }
  }

  /**
   * Event: hand:start-speaking
   * Teacher grants speaking turn to a participant.
   * Enforces 1-speaker invariant.
   */
  @SubscribeMessage('hand:start-speaking')
  async handleHandStartSpeaking(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: StartSpeakingPayload,
  ): Promise<void> {
    try {
      const validation = moderateHandActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('hand:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data mulai berbicara tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('hand:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat memberikan giliran berbicara',
        });
        return;
      }

      const { sessionId, handId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const result = this.raiseHandRuntime.startSpeaking(sessionId, handId);
      if (!result.accepted || !result.hand) {
        client.emit('hand:error', {
          code: 'START_SPEAKING_FAILED',
          message: result.error || 'Gagal memberikan giliran berbicara',
        });
        return;
      }

      const hand = result.hand;

      // Broadcast speaking turn to entire session (teacher, projector, participants)
      this.server.to(`session:${sessionId}`).emit('hand:speaking', {
        handId: hand.id,
        participantId: hand.participantId,
        displayName: hand.displayName,
      });

      // Update teacher snapshot and broadcast queue update
      const teacherSnapshot = this.raiseHandRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('hand:state', teacherSnapshot);
      this.server.to(`session:${sessionId}`).emit('hand:queue-update', {
        queueCount: teacherSnapshot.raisedCount,
      });
    } catch (err: any) {
      client.emit('hand:error', {
        code: 'START_SPEAKING_FAILED',
        message: err.message || 'Gagal memberikan giliran berbicara',
      });
    }
  }

  /**
   * Event: hand:lower-participant
   * Teacher lowers a specific participant's hand or finishes their speaking turn.
   */
  @SubscribeMessage('hand:lower-participant')
  async handleHandLowerParticipant(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LowerParticipantHandPayload,
  ): Promise<void> {
    try {
      const validation = moderateHandActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('hand:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data turunkan tangan tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('hand:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menurunkan tangan peserta',
        });
        return;
      }

      const { sessionId, handId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const hand = this.raiseHandRuntime.lowerParticipantHand(sessionId, handId);
      if (!hand) return;

      // Broadcast lowered to session
      this.server.to(`session:${sessionId}`).emit('hand:lowered', {
        handId: hand.id,
        participantId: hand.participantId,
      });

      // Update teacher snapshot and broadcast queue update
      const teacherSnapshot = this.raiseHandRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('hand:state', teacherSnapshot);
      this.server.to(`session:${sessionId}`).emit('hand:queue-update', {
        queueCount: teacherSnapshot.raisedCount,
      });
    } catch (err: any) {
      client.emit('hand:error', {
        code: 'LOWER_PARTICIPANT_FAILED',
        message: err.message || 'Gagal menurunkan tangan peserta',
      });
    }
  }

  /**
   * Event: hand:lower-all
   * Teacher lowers all raised hands in the session.
   */
  @SubscribeMessage('hand:lower-all')
  async handleHandLowerAll(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LowerAllHandsPayload,
  ): Promise<void> {
    try {
      const validation = raiseHandActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('hand:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data turunkan semua tangan tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('hand:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menurunkan semua tangan',
        });
        return;
      }

      const { sessionId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      this.raiseHandRuntime.lowerAllHands(sessionId);

      // Broadcast all-lowered and queue reset to entire session
      this.server.to(`session:${sessionId}`).emit('hand:all-lowered', {});
      this.server.to(`session:${sessionId}`).emit('hand:queue-update', {
        queueCount: 0,
      });

      // Update teacher snapshot
      const teacherSnapshot = this.raiseHandRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('hand:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('hand:error', {
        code: 'LOWER_ALL_FAILED',
        message: err.message || 'Gagal menurunkan semua tangan',
      });
    }
  }

  // ==========================================
  // COLLABORATIVE BRAINSTORM BOARD EVENTS
  // ==========================================

  /**
   * Event: brainstorm:create
   * Teacher initializes a new brainstorm activity with prompt and settings.
   */
  @SubscribeMessage('brainstorm:create')
  async handleBrainstormCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateBrainstormPayload,
  ): Promise<void> {
    try {
      const validation = createBrainstormSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('brainstorm:error', {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message || 'Data aktivitas papan ide tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('brainstorm:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru pemilik sesi yang dapat membuat papan ide',
        });
        return;
      }

      const { sessionId, prompt, isAnonymous, ideasVisibleToParticipants, submissionMode } =
        validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const result = this.brainstormRuntime.createActivity(sessionId, prompt, {
        isAnonymous,
        ideasVisibleToParticipants,
        submissionMode,
      });

      if (!result.accepted || !result.activity) {
        client.emit('brainstorm:error', {
          code: 'CREATE_FAILED',
          message: result.error || 'Gagal membuat papan ide',
        });
        return;
      }

      // Send updated teacher snapshot to teacher room and projectors
      const teacherSnapshot = this.brainstormRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('brainstorm:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('brainstorm:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('brainstorm:error', {
        code: 'CREATE_FAILED',
        message: err.message || 'Gagal membuat papan ide',
      });
    }
  }

  /**
   * Event: brainstorm:open
   * Teacher opens brainstorm activity for submissions.
   */
  @SubscribeMessage('brainstorm:open')
  async handleBrainstormOpen(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: OpenBrainstormPayload,
  ): Promise<void> {
    try {
      const validation = brainstormActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('brainstorm:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data sesi tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('brainstorm:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat membuka aktivitas papan ide',
        });
        return;
      }

      const { sessionId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const result = this.brainstormRuntime.openActivity(sessionId);
      if (!result.accepted || !result.activity) {
        client.emit('brainstorm:error', {
          code: 'OPEN_FAILED',
          message: result.error || 'Gagal membuka aktivitas papan ide',
        });
        return;
      }

      // Broadcast opened event to entire session
      this.server.to(`session:${sessionId}`).emit('brainstorm:opened', {
        activityId: result.activity.id,
        openedAt: result.activity.openedAt || Date.now(),
      });

      // Update teacher snapshot and projector
      const teacherSnapshot = this.brainstormRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('brainstorm:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('brainstorm:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('brainstorm:error', {
        code: 'OPEN_FAILED',
        message: err.message || 'Gagal membuka aktivitas papan ide',
      });
    }
  }

  /**
   * Event: brainstorm:pause
   * Teacher pauses submissions.
   */
  @SubscribeMessage('brainstorm:pause')
  async handleBrainstormPause(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PauseBrainstormPayload,
  ): Promise<void> {
    try {
      const validation = brainstormActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('brainstorm:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data sesi tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('brainstorm:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menjeda aktivitas papan ide',
        });
        return;
      }

      const { sessionId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const result = this.brainstormRuntime.pauseActivity(sessionId);
      if (!result.accepted || !result.activity) {
        client.emit('brainstorm:error', {
          code: 'PAUSE_FAILED',
          message: result.error || 'Gagal menjeda aktivitas papan ide',
        });
        return;
      }

      // Broadcast paused event to entire session
      this.server.to(`session:${sessionId}`).emit('brainstorm:paused', {
        activityId: result.activity.id,
        pausedAt: result.activity.pausedAt || Date.now(),
      });

      // Update teacher snapshot and projector
      const teacherSnapshot = this.brainstormRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('brainstorm:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('brainstorm:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('brainstorm:error', {
        code: 'PAUSE_FAILED',
        message: err.message || 'Gagal menjeda aktivitas papan ide',
      });
    }
  }

  /**
   * Event: brainstorm:close
   * Teacher closes activity permanently. Terminal state.
   */
  @SubscribeMessage('brainstorm:close')
  async handleBrainstormClose(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CloseBrainstormPayload,
  ): Promise<void> {
    try {
      const validation = brainstormActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('brainstorm:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data sesi tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('brainstorm:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menutup aktivitas papan ide',
        });
        return;
      }

      const { sessionId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const result = this.brainstormRuntime.closeActivity(sessionId);
      if (!result.accepted || !result.activity) {
        client.emit('brainstorm:error', {
          code: 'CLOSE_FAILED',
          message: result.error || 'Gagal menutup aktivitas papan ide',
        });
        return;
      }

      // Broadcast closed event to entire session
      this.server.to(`session:${sessionId}`).emit('brainstorm:closed', {
        activityId: result.activity.id,
        closedAt: result.activity.closedAt || Date.now(),
      });

      // Update teacher snapshot and projector
      const teacherSnapshot = this.brainstormRuntime.getTeacherSnapshot(sessionId);
      this.server.to(`session:${sessionId}:teachers`).emit('brainstorm:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('brainstorm:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('brainstorm:error', {
        code: 'CLOSE_FAILED',
        message: err.message || 'Gagal menutup aktivitas papan ide',
      });
    }
  }

  /**
   * Event: brainstorm:submit
   * Participant submits an idea.
   */
  @SubscribeMessage('brainstorm:submit')
  handleBrainstormSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitBrainstormIdeaPayload,
  ): void {
    const validation = submitBrainstormIdeaSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('brainstorm:error', {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Data ide tidak valid',
      });
      return;
    }

    const entry = this.memory.getSocketEntry(client.id);
    if (!entry || entry.role !== 'PARTICIPANT') {
      client.emit('brainstorm:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya peserta yang dapat mengirim ide ke papan',
      });
      return;
    }

    const { sessionId, content } = validation.data;
    if (entry.sessionId !== sessionId) {
      client.emit('brainstorm:error', {
        code: 'FORBIDDEN',
        message: 'Sesi tidak sesuai dengan koneksi aktif',
      });
      return;
    }

    const participant = this.memory.getParticipant(sessionId, entry.participantId);
    const authorName = participant?.displayName || 'Peserta';

    const result = this.brainstormRuntime.submitIdea(
      sessionId,
      entry.participantId,
      authorName,
      content,
    );

    if (!result.accepted || !result.idea) {
      client.emit('brainstorm:error', {
        code: 'SUBMISSION_REJECTED',
        message: result.error || 'Gagal mengirim ide',
      });
      return;
    }

    const idea = result.idea;
    const activity = this.brainstormRuntime.getActivity(sessionId);

    // 1. Send confirmation to the submitting participant
    client.emit('brainstorm:idea-submitted', {
      idea: {
        id: idea.id,
        content: idea.content,
        status: idea.status,
        isAnonymous: idea.isAnonymous,
        createdAt: idea.createdAt,
      },
    });

    // 2. Send updated authoritative participant snapshot to this participant
    const participantSnapshot = this.brainstormRuntime.getParticipantSnapshot(
      sessionId,
      entry.participantId,
    );
    client.emit('brainstorm:state', participantSnapshot);

    // 3. Send new idea and updated snapshot to teacher room and projectors
    const teacherSnapshot = this.brainstormRuntime.getTeacherSnapshot(sessionId);
    this.server.to(`session:${sessionId}:teachers`).emit('brainstorm:idea-created', {
      idea,
      visibleCount: teacherSnapshot.visibleCount,
      totalCount: teacherSnapshot.totalCount,
    });
    this.server.to(`session:${sessionId}:teachers`).emit('brainstorm:state', teacherSnapshot);
    this.server.to(`session:${sessionId}:projectors`).emit('brainstorm:state', teacherSnapshot);
    this.server.to(`session:${sessionId}:projectors`).emit('brainstorm:idea-created', {
      idea,
      visibleCount: teacherSnapshot.visibleCount,
      totalCount: teacherSnapshot.totalCount,
    });

    // 4. If ideasVisibleToParticipants is enabled, broadcast shared idea to session
    if (activity && activity.settings.ideasVisibleToParticipants) {
      this.server.to(`session:${sessionId}`).emit('brainstorm:idea-created', {
        idea: {
          id: idea.id,
          authorName: idea.authorName,
          isAnonymous: idea.isAnonymous,
          content: idea.content,
          createdAt: idea.createdAt,
        },
        totalCount: teacherSnapshot.visibleCount,
      });
    }
  }

  /**
   * Event: brainstorm:hide
   * Teacher hides an inappropriate or duplicate idea.
   */
  @SubscribeMessage('brainstorm:hide')
  async handleBrainstormHide(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: HideBrainstormIdeaPayload,
  ): Promise<void> {
    try {
      const validation = moderateBrainstormIdeaSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('brainstorm:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data sembunyikan ide tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('brainstorm:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menyembunyikan ide',
        });
        return;
      }

      const { sessionId, ideaId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const hidden = this.brainstormRuntime.hideIdea(sessionId, ideaId);
      if (!hidden) return;

      const teacherSnapshot = this.brainstormRuntime.getTeacherSnapshot(sessionId);

      // Broadcast hide event to entire session so participants remove the idea from their board
      this.server.to(`session:${sessionId}`).emit('brainstorm:idea-hidden', {
        ideaId,
        totalCount: teacherSnapshot.visibleCount,
      });

      // Update teacher snapshot and projector
      this.server.to(`session:${sessionId}:teachers`).emit('brainstorm:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('brainstorm:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('brainstorm:error', {
        code: 'HIDE_FAILED',
        message: err.message || 'Gagal menyembunyikan ide',
      });
    }
  }

  /**
   * Event: brainstorm:restore
   * Teacher restores a previously hidden idea.
   */
  @SubscribeMessage('brainstorm:restore')
  async handleBrainstormRestore(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RestoreBrainstormIdeaPayload,
  ): Promise<void> {
    try {
      const validation = moderateBrainstormIdeaSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('brainstorm:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data pemulihan ide tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('brainstorm:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat memulihkan ide',
        });
        return;
      }

      const { sessionId, ideaId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const restored = this.brainstormRuntime.restoreIdea(sessionId, ideaId);
      if (!restored) return;

      const teacherSnapshot = this.brainstormRuntime.getTeacherSnapshot(sessionId);
      const activity = this.brainstormRuntime.getActivity(sessionId);

      // If ideasVisibleToParticipants, broadcast restored idea to session
      if (activity && activity.settings.ideasVisibleToParticipants) {
        this.server.to(`session:${sessionId}`).emit('brainstorm:idea-restored', {
          idea: {
            id: restored.id,
            authorName: restored.authorName,
            isAnonymous: restored.isAnonymous,
            content: restored.content,
            createdAt: restored.createdAt,
          },
          totalCount: teacherSnapshot.visibleCount,
        });
      }

      // Update teacher snapshot and projector
      this.server.to(`session:${sessionId}:teachers`).emit('brainstorm:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('brainstorm:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('brainstorm:error', {
        code: 'RESTORE_FAILED',
        message: err.message || 'Gagal memulihkan ide',
      });
    }
  }

  /**
   * Event: exit-ticket:create
   * Teacher creates a new Exit Ticket in DRAFT status.
   */
  @SubscribeMessage('exit-ticket:create')
  async handleExitTicketCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateExitTicketPayload,
  ): Promise<void> {
    try {
      const validation = createExitTicketSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('exit-ticket:error', {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message || 'Data Exit Ticket tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('exit-ticket:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru pemilik sesi yang dapat membuat Exit Ticket',
        });
        return;
      }

      const { sessionId, title, isAnonymous, questions } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const result = this.exitTicketRuntime.createActivity(
        sessionId,
        title || 'Exit Ticket',
        isAnonymous,
        questions,
      );

      if (!result.accepted || !result.activity) {
        client.emit('exit-ticket:error', {
          code: 'CREATE_FAILED',
          message: result.error || 'Gagal membuat Exit Ticket',
        });
        return;
      }

      // Send teacher snapshot to teacher room and projectors
      const totalOnline = this.memory.getOnlineParticipantCount(sessionId);
      const teacherSnapshot = this.exitTicketRuntime.getTeacherSnapshot(sessionId, totalOnline);
      this.server.to(`session:${sessionId}:teachers`).emit('exit-ticket:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('exit-ticket:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('exit-ticket:error', {
        code: 'CREATE_FAILED',
        message: err.message || 'Gagal membuat Exit Ticket',
      });
    }
  }

  /**
   * Event: exit-ticket:open
   * Teacher opens Exit Ticket for participant submissions.
   */
  @SubscribeMessage('exit-ticket:open')
  async handleExitTicketOpen(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: OpenExitTicketPayload,
  ): Promise<void> {
    try {
      const validation = exitTicketActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('exit-ticket:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data sesi tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('exit-ticket:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat membuka Exit Ticket',
        });
        return;
      }

      const { sessionId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const result = this.exitTicketRuntime.openActivity(sessionId);
      if (!result.accepted || !result.activity) {
        client.emit('exit-ticket:error', {
          code: 'OPEN_FAILED',
          message: result.error || 'Gagal membuka Exit Ticket',
        });
        return;
      }

      // Broadcast opened event to entire session room
      this.server.to(`session:${sessionId}`).emit('exit-ticket:opened', {
        activityId: result.activity.id,
        openedAt: result.activity.openedAt || Date.now(),
      });

      // Update teacher snapshot and projectors
      const totalOnline = this.memory.getOnlineParticipantCount(sessionId);
      const teacherSnapshot = this.exitTicketRuntime.getTeacherSnapshot(sessionId, totalOnline);
      this.server.to(`session:${sessionId}:teachers`).emit('exit-ticket:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('exit-ticket:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('exit-ticket:error', {
        code: 'OPEN_FAILED',
        message: err.message || 'Gagal membuka Exit Ticket',
      });
    }
  }

  /**
   * Event: exit-ticket:close
   * Teacher closes Exit Ticket permanently (terminal state).
   */
  @SubscribeMessage('exit-ticket:close')
  async handleExitTicketClose(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CloseExitTicketPayload,
  ): Promise<void> {
    try {
      const validation = exitTicketActionSchema.safeParse(payload);
      if (!validation.success) {
        client.emit('exit-ticket:error', {
          code: 'VALIDATION_ERROR',
          message: 'Data sesi tidak valid',
        });
        return;
      }

      const teacher = await this.authenticateTeacher(client);
      if (!teacher) {
        client.emit('exit-ticket:error', {
          code: 'UNAUTHORIZED',
          message: 'Hanya guru yang dapat menutup Exit Ticket',
        });
        return;
      }

      const { sessionId } = validation.data;
      await this.sessionsService.findOne(sessionId, teacher.id);

      const result = this.exitTicketRuntime.closeActivity(sessionId);
      if (!result.accepted || !result.activity) {
        client.emit('exit-ticket:error', {
          code: 'CLOSE_FAILED',
          message: result.error || 'Gagal menutup Exit Ticket',
        });
        return;
      }

      // Broadcast closed event to entire session room
      this.server.to(`session:${sessionId}`).emit('exit-ticket:closed', {
        activityId: result.activity.id,
        closedAt: result.activity.closedAt || Date.now(),
      });

      // Update teacher snapshot and projectors
      const totalOnline = this.memory.getOnlineParticipantCount(sessionId);
      const teacherSnapshot = this.exitTicketRuntime.getTeacherSnapshot(sessionId, totalOnline);
      this.server.to(`session:${sessionId}:teachers`).emit('exit-ticket:state', teacherSnapshot);
      this.server.to(`session:${sessionId}:projectors`).emit('exit-ticket:state', teacherSnapshot);
    } catch (err: any) {
      client.emit('exit-ticket:error', {
        code: 'CLOSE_FAILED',
        message: err.message || 'Gagal menutup Exit Ticket',
      });
    }
  }

  /**
   * Event: exit-ticket:submit
   * Participant submits reflection response.
   */
  @SubscribeMessage('exit-ticket:submit')
  handleExitTicketSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitExitTicketPayload,
  ): void {
    const validation = submitExitTicketSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('exit-ticket:error', {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Data jawaban tidak valid',
      });
      return;
    }

    const entry = this.memory.getSocketEntry(client.id);
    if (!entry || entry.role !== 'PARTICIPANT') {
      client.emit('exit-ticket:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya peserta yang dapat mengirim respon Exit Ticket',
      });
      return;
    }

    const { sessionId, answers } = validation.data;
    if (entry.sessionId !== sessionId) {
      client.emit('exit-ticket:error', {
        code: 'FORBIDDEN',
        message: 'Sesi tidak sesuai dengan koneksi aktif',
      });
      return;
    }

    const participant = this.memory.getParticipant(sessionId, entry.participantId);
    const authorName = participant?.displayName || 'Peserta';

    const result = this.exitTicketRuntime.submitResponse(
      sessionId,
      entry.participantId,
      authorName,
      answers,
    );

    if (!result.accepted || !result.response) {
      client.emit('exit-ticket:error', {
        code: 'SUBMISSION_REJECTED',
        message: result.error || 'Gagal mengirim respon Exit Ticket',
      });
      return;
    }

    // 1. Send confirmation to the submitting participant
    client.emit('exit-ticket:response-submitted', {
      success: true,
      submittedAt: result.response.submittedAt,
    });

    // 2. Send updated authoritative participant snapshot to this participant
    const participantSnapshot = this.exitTicketRuntime.getParticipantSnapshot(
      sessionId,
      entry.participantId,
    );
    client.emit('exit-ticket:state', participantSnapshot);

    // 3. Update teacher room and projectors with aggregates and snapshot
    const totalOnline = this.memory.getOnlineParticipantCount(sessionId);
    const aggregates = this.exitTicketRuntime.calculateAggregates(sessionId, totalOnline);
    const teacherSnapshot = this.exitTicketRuntime.getTeacherSnapshot(sessionId, totalOnline);

    this.server.to(`session:${sessionId}:teachers`).emit('exit-ticket:results-updated', {
      responseCount: aggregates.responseCount,
      completionRate: aggregates.completionRate,
      aggregates,
    });
    this.server.to(`session:${sessionId}:teachers`).emit('exit-ticket:state', teacherSnapshot);
    this.server.to(`session:${sessionId}:projectors`).emit('exit-ticket:results-updated', {
      responseCount: aggregates.responseCount,
      completionRate: aggregates.completionRate,
      aggregates,
    });
    this.server.to(`session:${sessionId}:projectors`).emit('exit-ticket:state', teacherSnapshot);
  }

  // ==========================================
  // CLASSROOM TIMER EVENT HANDLERS (PHASE 12)
  // ==========================================

  private broadcastTimerState(
    sessionId: string,
    state: ClassroomTimerState,
    eventName?: string,
  ): void {
    const payload = {
      timer: state,
      serverTime: Date.now(),
    };

    if (state.visibility === 'SHARED_TIMER') {
      if (eventName) {
        this.server.to(`session:${sessionId}`).emit(eventName, state);
      }
      this.server.to(`session:${sessionId}`).emit('timer:state', payload);
    } else {
      if (eventName) {
        this.server.to(`session:${sessionId}:teachers`).emit(eventName, state);
      }
      this.server.to(`session:${sessionId}:teachers`).emit('timer:state', payload);
      // Ensure participants receive null state when timer is private
      this.server.to(`session:${sessionId}`).emit('timer:state', {
        timer: null,
        serverTime: Date.now(),
      });
    }
  }

  @SubscribeMessage('timer:set')
  async handleTimerSet(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SetClassroomTimerPayload,
  ): Promise<void> {
    const validation = setClassroomTimerSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('timer:error', {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Data timer tidak valid',
      });
      return;
    }

    const { sessionId, duration, label, visibility } = validation.data;
    const teacher = await this.authenticateTeacher(client);
    if (!teacher) {
      client.emit('timer:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya guru yang dapat mengatur timer kelas',
      });
      return;
    }

    const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
    if (!isOwner) {
      client.emit('timer:error', {
        code: 'FORBIDDEN',
        message: 'Anda bukan pemilik sesi kelas ini',
      });
      return;
    }

    const state = this.classroomTimerRuntime.setTimer(sessionId, duration, label, visibility);
    this.broadcastTimerState(sessionId, state);
  }

  @SubscribeMessage('timer:start')
  async handleTimerStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: StartClassroomTimerPayload,
  ): Promise<void> {
    const validation = startClassroomTimerSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('timer:error', {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Data timer tidak valid',
      });
      return;
    }

    const { sessionId, duration, label, visibility } = validation.data;
    const teacher = await this.authenticateTeacher(client);
    if (!teacher) {
      client.emit('timer:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya guru yang dapat memulai timer kelas',
      });
      return;
    }

    const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
    if (!isOwner) {
      client.emit('timer:error', {
        code: 'FORBIDDEN',
        message: 'Anda bukan pemilik sesi kelas ini',
      });
      return;
    }

    const state = this.classroomTimerRuntime.startTimer(sessionId, { duration, label, visibility });
    this.broadcastTimerState(sessionId, state, 'timer:started');
  }

  @SubscribeMessage('timer:pause')
  async handleTimerPause(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PauseClassroomTimerPayload,
  ): Promise<void> {
    const validation = timerActionSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('timer:error', {
        code: 'VALIDATION_ERROR',
        message: 'Session ID tidak valid',
      });
      return;
    }

    const { sessionId } = validation.data;
    const teacher = await this.authenticateTeacher(client);
    if (!teacher) {
      client.emit('timer:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya guru yang dapat menjeda timer kelas',
      });
      return;
    }

    const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
    if (!isOwner) {
      client.emit('timer:error', {
        code: 'FORBIDDEN',
        message: 'Anda bukan pemilik sesi kelas ini',
      });
      return;
    }

    const state = this.classroomTimerRuntime.pauseTimer(sessionId);
    this.broadcastTimerState(sessionId, state, 'timer:paused');
  }

  @SubscribeMessage('timer:resume')
  async handleTimerResume(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ResumeClassroomTimerPayload,
  ): Promise<void> {
    const validation = timerActionSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('timer:error', {
        code: 'VALIDATION_ERROR',
        message: 'Session ID tidak valid',
      });
      return;
    }

    const { sessionId } = validation.data;
    const teacher = await this.authenticateTeacher(client);
    if (!teacher) {
      client.emit('timer:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya guru yang dapat melanjutkan timer kelas',
      });
      return;
    }

    const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
    if (!isOwner) {
      client.emit('timer:error', {
        code: 'FORBIDDEN',
        message: 'Anda bukan pemilik sesi kelas ini',
      });
      return;
    }

    const state = this.classroomTimerRuntime.resumeTimer(sessionId);
    this.broadcastTimerState(sessionId, state, 'timer:resumed');
  }

  @SubscribeMessage('timer:reset')
  async handleTimerReset(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ResetClassroomTimerPayload,
  ): Promise<void> {
    const validation = resetClassroomTimerSchema.safeParse(payload);
    if (!validation.success) {
      client.emit('timer:error', {
        code: 'VALIDATION_ERROR',
        message: 'Data reset timer tidak valid',
      });
      return;
    }

    const { sessionId, newDuration } = validation.data;
    const teacher = await this.authenticateTeacher(client);
    if (!teacher) {
      client.emit('timer:error', {
        code: 'UNAUTHORIZED',
        message: 'Hanya guru yang dapat mereset timer kelas',
      });
      return;
    }

    const isOwner = await this.verifyTeacherSession(client, sessionId, teacher.id);
    if (!isOwner) {
      client.emit('timer:error', {
        code: 'FORBIDDEN',
        message: 'Anda bukan pemilik sesi kelas ini',
      });
      return;
    }

    const state = this.classroomTimerRuntime.resetTimer(sessionId, newDuration);
    this.broadcastTimerState(sessionId, state, 'timer:reset');
  }

  /**
   * Server helper: Broadcast session state externally (e.g. from REST controller).
   */
  broadcastState(sessionId: string, event: string, data: any): void {
    this.server.to(`session:${sessionId}`).emit(event, data);
  }
}
