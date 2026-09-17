import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionsService } from '../sessions.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('SessionsService (Lifecycle, IDOR & Join Code)', () => {
  let service: SessionsService;
  let mockPrisma: any;
  let mockMemory: any;

  beforeEach(() => {
    mockPrisma = {
      session: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      classroom: {
        findFirst: vi.fn(),
      },
    };

    mockMemory = {
      getParticipants: vi.fn().mockReturnValue([]),
      getOnlineParticipantCount: vi.fn().mockReturnValue(0),
      getParticipant: vi.fn(),
      clearSession: vi.fn(),
    };

    service = new SessionsService(mockPrisma, mockMemory);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  const sampleSession = {
    id: 'sess-123',
    teacherId: 'teacher-1',
    classroomId: 'class-1',
    title: 'Kuis IPA Bab 1',
    joinCode: 'AB7K42',
    status: 'WAITING',
    startedAt: null,
    endedAt: null,
    createdAt: new Date('2026-09-13T03:00:00Z'),
    updatedAt: new Date('2026-09-13T03:00:00Z'),
    classroom: { id: 'class-1', name: 'Kelas 7A' },
  };

  describe('createSession', () => {
    it('creates a session with server-generated joinCode and WAITING status', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null); // No joinCode collision
      mockPrisma.session.create.mockResolvedValue(sampleSession);

      const result = await service.createSession('teacher-1', {
        title: 'Kuis IPA Bab 1',
      });

      expect(result.id).toBe('sess-123');
      expect(result.status).toBe('WAITING');
      expect(mockPrisma.session.create).toHaveBeenCalled();
    });

    it('validates classroom ownership when classroomId is provided', async () => {
      mockPrisma.classroom.findFirst.mockResolvedValue(null); // Classroom not owned

      await expect(
        service.createSession('teacher-1', {
          title: 'Kuis IPA',
          classroomId: 'unowned-class',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('proceeds if classroom belongs to teacher', async () => {
      mockPrisma.classroom.findFirst.mockResolvedValue({ id: 'class-1', teacherId: 'teacher-1' });
      mockPrisma.session.findFirst.mockResolvedValue(null);
      mockPrisma.session.create.mockResolvedValue(sampleSession);

      const result = await service.createSession('teacher-1', {
        title: 'Kuis IPA',
        classroomId: 'class-1',
      });

      expect(result.classroomId).toBe('class-1');
    });
  });

  describe('startSession (State Machine: WAITING -> ACTIVE)', () => {
    it('transitions session from WAITING to ACTIVE', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(sampleSession);
      mockPrisma.session.update.mockResolvedValue({
        ...sampleSession,
        status: 'ACTIVE',
        startedAt: new Date(),
      });

      const result = await service.startSession('sess-123', 'teacher-1');
      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sess-123' },
          data: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });

    it('rejects start if teacher is not the owner (IDOR)', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(sampleSession);

      await expect(service.startSession('sess-123', 'other-teacher')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('rejects start if session is already ACTIVE', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        ...sampleSession,
        status: 'ACTIVE',
      });

      await expect(service.startSession('sess-123', 'teacher-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects start if session is ENDED (invalid transition: ENDED -> ACTIVE)', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        ...sampleSession,
        status: 'ENDED',
      });

      await expect(service.startSession('sess-123', 'teacher-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('endSession (State Machine: WAITING/ACTIVE -> ENDED)', () => {
    it('transitions session from ACTIVE to ENDED and clears in-memory state', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        ...sampleSession,
        status: 'ACTIVE',
      });
      mockPrisma.session.update.mockResolvedValue({
        ...sampleSession,
        status: 'ENDED',
        endedAt: new Date(),
      });

      const result = await service.endSession('sess-123', 'teacher-1');
      expect(result.status).toBe('ENDED');
      expect(mockMemory.clearSession).toHaveBeenCalledWith('sess-123');
    });

    it('rejects end if teacher is not the owner (IDOR)', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(sampleSession);

      await expect(service.endSession('sess-123', 'other-teacher')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('rejects end if session is already ENDED', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        ...sampleSession,
        status: 'ENDED',
      });

      await expect(service.endSession('sess-123', 'teacher-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyJoinCode', () => {
    it('normalizes uppercase code and returns active session info', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'sess-123',
        title: 'Kuis IPA',
        joinCode: 'AB7K42',
        status: 'WAITING',
      });

      const result = await service.verifyJoinCode('ab7k42');
      expect(result.id).toBe('sess-123');
      expect(result.joinCode).toBe('AB7K42');
      expect(mockPrisma.session.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            joinCode: 'AB7K42',
            status: { in: ['WAITING', 'ACTIVE'] },
          },
        }),
      );
    });

    it('throws NotFoundException if join code does not exist or session is ended', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);

      await expect(service.verifyJoinCode('NONEX1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne (IDOR protection)', () => {
    it('allows owner to fetch session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(sampleSession);

      const result = await service.findOne('sess-123', 'teacher-1');
      expect(result.id).toBe('sess-123');
    });

    it('blocks non-owner teacher from fetching session (IDOR)', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(sampleSession);

      await expect(service.findOne('sess-123', 'intruder-teacher')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('expireStaleSessions', () => {
    it('expires sessions older than 6 hours and clears memory', async () => {
      mockPrisma.session.findMany.mockResolvedValue([
        { id: 'sess-old-1' },
        { id: 'sess-old-2' },
      ]);
      mockPrisma.session.updateMany.mockResolvedValue({ count: 2 });

      const count = await service.expireStaleSessions();

      expect(count).toBe(2);
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['sess-old-1', 'sess-old-2'] } },
          data: expect.objectContaining({ status: 'ENDED' }),
        }),
      );
      expect(mockMemory.clearSession).toHaveBeenCalledWith('sess-old-1');
      expect(mockMemory.clearSession).toHaveBeenCalledWith('sess-old-2');
    });

    it('returns 0 when no stale sessions exist', async () => {
      mockPrisma.session.findMany.mockResolvedValue([]);

      const count = await service.expireStaleSessions();

      expect(count).toBe(0);
      expect(mockPrisma.session.updateMany).not.toHaveBeenCalled();
    });
  });
});
