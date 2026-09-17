import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionMemoryService } from './session-memory.service';
import type {
  TeachingSession,
  SessionSnapshot,
  ParticipantSessionSnapshot,
  ProjectorSessionSnapshot,
  SessionParticipant,
} from '@walikelas/types';
import type { CreateSessionInput } from '@walikelas/validation';
import { JOIN_CODE_CHARACTERS, JOIN_CODE_LENGTH } from '@walikelas/config';
import { randomInt } from 'crypto';

/**
 * Maximum lifetime for any classroom session (6 hours).
 * After 6 hours, sessions are automatically considered expired and transitioned to ENDED.
 */
export const MAX_SESSION_DURATION_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class SessionsService implements OnModuleDestroy {
  private readonly logger = new Logger(SessionsService.name);
  private expireInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly memory: SessionMemoryService,
  ) {
    // Periodically run background stale session cleanup every 5 minutes
    this.expireInterval = setInterval(() => {
      this.expireStaleSessions().catch((err) => {
        this.logger.error(`Error during expireStaleSessions: ${err.message}`);
      });
    }, 5 * 60 * 1000);
  }

  onModuleDestroy(): void {
    if (this.expireInterval) {
      clearInterval(this.expireInterval);
      this.expireInterval = null;
    }
  }

  /**
   * Automatically transition sessions older than MAX_SESSION_DURATION_MS to ENDED.
   * Cleans up both database status and transient in-memory state.
   */
  async expireStaleSessions(): Promise<number> {
    const threshold = new Date(Date.now() - MAX_SESSION_DURATION_MS);
    const staleSessions = await this.prisma.session.findMany({
      where: {
        status: { in: ['WAITING', 'ACTIVE'] },
        createdAt: { lt: threshold },
      },
      select: { id: true },
    });

    if (staleSessions.length === 0) return 0;

    const now = new Date();
    await this.prisma.session.updateMany({
      where: {
        id: { in: staleSessions.map((s) => s.id) },
      },
      data: {
        status: 'ENDED',
        endedAt: now,
      },
    });

    for (const s of staleSessions) {
      this.memory.clearSession(s.id);
    }

    this.logger.log(`Auto-expired ${staleSessions.length} sessions older than 6 hours.`);
    return staleSessions.length;
  }

  /**
   * Generate a random collision-resistant uppercase alphanumeric join code.
   * Excludes visually ambiguous characters (0, O, 1, I).
   */
  private generateRandomCode(): string {
    let code = '';
    const charsLength = JOIN_CODE_CHARACTERS.length;
    for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
      code += JOIN_CODE_CHARACTERS.charAt(randomInt(0, charsLength));
    }
    return code;
  }

  /**
   * Generate a unique join code that is not currently active.
   */
  async generateUniqueJoinCode(): Promise<string> {
    const maxRetries = 10;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const code = this.generateRandomCode();
      const existing = await this.prisma.session.findFirst({
        where: {
          joinCode: code,
          status: { in: ['WAITING', 'ACTIVE'] },
        },
      });
      if (!existing) {
        return code;
      }
    }
    throw new BadRequestException('Gagal menghasilkan kode sesi unik, silakan coba lagi');
  }

  /**
   * Create a new classroom teaching session.
   * Teacher is authoritatively determined from application session.
   */
  async createSession(teacherId: string, input: CreateSessionInput): Promise<TeachingSession> {
    // If classroomId provided, verify that the teacher owns the classroom
    if (input.classroomId) {
      const classroom = await this.prisma.classroom.findFirst({
        where: {
          id: input.classroomId,
          teacherId,
        },
      });

      if (!classroom) {
        throw new ForbiddenException('Anda tidak memiliki akses ke kelas ini');
      }
    }

    // Auto-end any lingering WAITING or ACTIVE sessions previously created by this teacher
    const lingeringSessions = await this.prisma.session.findMany({
      where: {
        teacherId,
        status: { in: ['WAITING', 'ACTIVE'] },
      },
      select: { id: true },
    });

    if (lingeringSessions.length > 0) {
      await this.prisma.session.updateMany({
        where: { id: { in: lingeringSessions.map((s) => s.id) } },
        data: { status: 'ENDED', endedAt: new Date() },
      });
      for (const s of lingeringSessions) {
        this.memory.clearSession(s.id);
      }
      this.logger.log(`Auto-ended ${lingeringSessions.length} lingering sessions for teacher ${teacherId}`);
    }

    const joinCode = await this.generateUniqueJoinCode();

    const session = await this.prisma.session.create({
      data: {
        teacherId,
        classroomId: input.classroomId ?? null,
        title: input.title.trim(),
        joinCode,
        status: 'WAITING',
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log(
      `Session created: [${session.title}] code: ${session.joinCode} (ID: ${session.id}) by teacher ${teacherId}`,
    );

    return {
      id: session.id,
      teacherId: session.teacherId,
      classroomId: session.classroomId,
      title: session.title,
      joinCode: session.joinCode,
      status: session.status as TeachingSession['status'],
      startedAt: session.startedAt?.toISOString() ?? null,
      endedAt: session.endedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      classroom: session.classroom,
    };
  }

  /**
   * List all teaching sessions owned by the authenticated teacher.
   */
  async findAllTeacherSessions(teacherId: string): Promise<TeachingSession[]> {
    // Run stale session cleanup
    await this.expireStaleSessions();

    const sessions = await this.prisma.session.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      teacherId: s.teacherId,
      classroomId: s.classroomId,
      title: s.title,
      joinCode: s.joinCode,
      status: s.status as TeachingSession['status'],
      startedAt: s.startedAt?.toISOString() ?? null,
      endedAt: s.endedAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      classroom: s.classroom,
    }));
  }

  /**
   * Retrieve a single session owned by the authenticated teacher.
   */
  async findOne(sessionId: string, teacherId: string): Promise<TeachingSession> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sesi tidak ditemukan');
    }

    if (session.teacherId !== teacherId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke sesi ini');
    }

    return {
      id: session.id,
      teacherId: session.teacherId,
      classroomId: session.classroomId,
      title: session.title,
      joinCode: session.joinCode,
      status: session.status as TeachingSession['status'],
      startedAt: session.startedAt?.toISOString() ?? null,
      endedAt: session.endedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      classroom: session.classroom,
    };
  }

  /**
   * Start a session (WAITING -> ACTIVE).
   * Only the session owner can start the session.
   */
  async startSession(sessionId: string, teacherId: string): Promise<TeachingSession> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sesi tidak ditemukan');
    }

    if (session.teacherId !== teacherId) {
      throw new ForbiddenException('Anda tidak memiliki izin memulai sesi ini');
    }

    if (session.status !== 'WAITING') {
      throw new BadRequestException(
        'Hanya sesi dengan status MENUNGGU (WAITING) yang dapat dimulai',
      );
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log(`Session started: ${sessionId} by teacher ${teacherId}`);

    return {
      id: updated.id,
      teacherId: updated.teacherId,
      classroomId: updated.classroomId,
      title: updated.title,
      joinCode: updated.joinCode,
      status: updated.status as TeachingSession['status'],
      startedAt: updated.startedAt?.toISOString() ?? null,
      endedAt: updated.endedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      classroom: updated.classroom,
    };
  }

  /**
   * End a session (WAITING or ACTIVE -> ENDED).
   * Only the session owner can end the session.
   */
  async endSession(sessionId: string, teacherId: string): Promise<TeachingSession> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sesi tidak ditemukan');
    }

    if (session.teacherId !== teacherId) {
      throw new ForbiddenException('Anda tidak memiliki izin mengakhiri sesi ini');
    }

    if (session.status === 'ENDED') {
      throw new BadRequestException('Sesi ini sudah diakhiri sebelumnya');
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Clear transient in-memory state for this session
    this.memory.clearSession(sessionId);

    this.logger.log(`Session ended: ${sessionId} by teacher ${teacherId}`);

    return {
      id: updated.id,
      teacherId: updated.teacherId,
      classroomId: updated.classroomId,
      title: updated.title,
      joinCode: updated.joinCode,
      status: updated.status as TeachingSession['status'],
      startedAt: updated.startedAt?.toISOString() ?? null,
      endedAt: updated.endedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      classroom: updated.classroom,
    };
  }

  /**
   * Public verification of join code.
   * Returns basic session preview information for participants before joining.
   */
  async verifyJoinCode(rawCode: string): Promise<{
    id: string;
    title: string;
    joinCode: string;
    status: string;
  }> {
    const code = rawCode.trim().toUpperCase();

    const session = await this.prisma.session.findFirst({
      where: {
        joinCode: code,
        status: { in: ['WAITING', 'ACTIVE'] },
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
        status: true,
        createdAt: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Kode sesi tidak valid atau sesi telah berakhir');
    }

    // Just-in-time expiry: if session is older than MAX_SESSION_DURATION_MS, auto-expire
    if (session.createdAt && Date.now() - new Date(session.createdAt).getTime() > MAX_SESSION_DURATION_MS) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          status: 'ENDED',
          endedAt: new Date(),
        },
      });
      this.memory.clearSession(session.id);
      throw new NotFoundException('Sesi telah berakhir karena telah melebihi batas waktu maksimal');
    }

    return {
      id: session.id,
      title: session.title,
      joinCode: session.joinCode,
      status: session.status,
    };
  }

  /**
   * Get authoritative snapshot for the teacher console.
   */
  async getTeacherSnapshot(sessionId: string, teacherId: string): Promise<SessionSnapshot> {
    const session = await this.findOne(sessionId, teacherId);
    const participants = this.memory.getParticipants(sessionId);

    return {
      id: session.id,
      title: session.title,
      joinCode: session.joinCode,
      status: session.status,
      teacherId: session.teacherId,
      classroomId: session.classroomId,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      createdAt: session.createdAt,
      participantCount: this.memory.getOnlineParticipantCount(sessionId),
      participants: participants.map((p) => ({
        id: p.id,
        displayName: p.displayName,
        joinedAt: p.joinedAt,
        isOnline: p.isOnline,
      })),
      serverTime: new Date().toISOString(),
    };
  }

  /**
   * Get snapshot for participant.
   */
  async getParticipantSnapshot(
    sessionId: string,
    participantId: string,
  ): Promise<ParticipantSessionSnapshot> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sesi tidak ditemukan');
    }

    const participant = this.memory.getParticipant(sessionId, participantId);
    const displayName = participant ? participant.displayName : 'Peserta';

    return {
      id: session.id,
      title: session.title,
      status: session.status as ParticipantSessionSnapshot['status'],
      participantCount: this.memory.getOnlineParticipantCount(sessionId),
      currentParticipant: {
        id: participantId,
        displayName,
        reconnectToken: participant?.reconnectToken,
      },
      serverTime: new Date().toISOString(),
    };
  }

  /**
   * Get authoritative snapshot for projector screen.
   * Projector displays receive session metadata and real-time student count
   * without creating or registering a student participant.
   */
  async getProjectorSnapshot(sessionId: string): Promise<ProjectorSessionSnapshot> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        title: true,
        joinCode: true,
        status: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sesi tidak ditemukan');
    }

    return {
      id: session.id,
      title: session.title,
      joinCode: session.joinCode,
      status: session.status as ProjectorSessionSnapshot['status'],
      participantCount: this.memory.getOnlineParticipantCount(sessionId),
      serverTime: new Date().toISOString(),
    };
  }

  /**
   * Get active participants in a session (for teacher REST API).
   */
  async getParticipants(sessionId: string, teacherId: string): Promise<SessionParticipant[]> {
    await this.findOne(sessionId, teacherId); // Verifies ownership
    return this.memory.getParticipants(sessionId);
  }
}
