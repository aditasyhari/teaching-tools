import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PollsService } from '../polls.service';

describe('PollsService', () => {
  let service: PollsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      poll: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      pollOption: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    service = new PollsService(mockPrisma);
  });

  describe('create', () => {
    it('creates a poll with options transactionally', async () => {
      const teacherId = 'teacher-123';
      const input = {
        title: 'Cek Pemahaman',
        question: 'Apakah kamu paham pecahan desimal?',
        type: 'SINGLE_CHOICE' as const,
        settings: { allowMultiple: false, showResultsToParticipants: true, isAnonymous: true },
        options: [
          { optionText: 'Sangat Paham' },
          { optionText: 'Cukup Paham' },
          { optionText: 'Masih Bingung' },
        ],
      };

      mockPrisma.poll.create.mockResolvedValue({
        id: 'poll-1',
        teacherId,
        title: input.title,
        question: input.question,
        type: input.type,
        settings: input.settings,
        status: 'DRAFT',
        options: [
          { id: 'opt-1', pollId: 'poll-1', order: 1, optionText: 'Sangat Paham' },
          { id: 'opt-2', pollId: 'poll-1', order: 2, optionText: 'Cukup Paham' },
          { id: 'opt-3', pollId: 'poll-1', order: 3, optionText: 'Masih Bingung' },
        ],
        createdAt: new Date('2026-09-13T00:00:00.000Z'),
        updatedAt: new Date('2026-09-13T00:00:00.000Z'),
      });

      const result = await service.create(teacherId, input);

      expect(result.id).toBe('poll-1');
      expect(result.title).toBe('Cek Pemahaman');
      expect(result.options).toHaveLength(3);
      expect(mockPrisma.poll.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('returns poll summaries for a teacher', async () => {
      mockPrisma.poll.findMany.mockResolvedValue([
        {
          id: 'poll-1',
          teacherId: 'teacher-123',
          title: 'Poll 1',
          question: 'Pertanyaan 1',
          type: 'SINGLE_CHOICE',
          status: 'PUBLISHED',
          createdAt: new Date('2026-09-13T00:00:00.000Z'),
          updatedAt: new Date('2026-09-13T00:00:00.000Z'),
          _count: { options: 4 },
        },
      ]);

      const result = await service.findAll('teacher-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('poll-1');
      expect(result[0].optionCount).toBe(4);
      expect(mockPrisma.poll.findMany).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-123' },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { options: true } } },
      });
    });
  });

  describe('findOne', () => {
    it('returns poll if found and owned by teacher', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue({
        id: 'poll-1',
        teacherId: 'teacher-123',
        title: 'Poll 1',
        question: 'Pertanyaan 1',
        type: 'SINGLE_CHOICE',
        settings: {},
        status: 'PUBLISHED',
        options: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.findOne('poll-1', 'teacher-123');
      expect(result.id).toBe('poll-1');
    });

    it('throws NotFoundException if poll does not exist', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'teacher-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if poll is owned by another teacher (IDOR)', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue({
        id: 'poll-1',
        teacherId: 'other-teacher',
      });

      await expect(service.findOne('poll-1', 'teacher-123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException on IDOR update attempt', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue({
        id: 'poll-1',
        teacherId: 'other-teacher',
      });

      await expect(service.update('poll-1', 'teacher-123', { title: 'New Title' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('updates poll and replaces options transactionally', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue({
        id: 'poll-1',
        teacherId: 'teacher-123',
        options: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.poll.update.mockResolvedValue({
        id: 'poll-1',
        teacherId: 'teacher-123',
        title: 'Updated Title',
        question: 'Updated Question',
        type: 'SINGLE_CHOICE',
        settings: {},
        status: 'DRAFT',
        options: [
          { id: 'opt-new-1', pollId: 'poll-1', order: 1, optionText: 'Baru 1' },
          { id: 'opt-new-2', pollId: 'poll-1', order: 2, optionText: 'Baru 2' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update('poll-1', 'teacher-123', {
        title: 'Updated Title',
        question: 'Updated Question',
        options: [{ optionText: 'Baru 1' }, { optionText: 'Baru 2' }],
      });

      expect(result.title).toBe('Updated Title');
      expect(mockPrisma.pollOption.deleteMany).toHaveBeenCalledWith({
        where: { pollId: 'poll-1' },
      });
      expect(mockPrisma.pollOption.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes poll when owned by teacher', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue({
        id: 'poll-1',
        teacherId: 'teacher-123',
        options: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.poll.delete.mockResolvedValue({ id: 'poll-1' });

      await service.delete('poll-1', 'teacher-123');
      expect(mockPrisma.poll.delete).toHaveBeenCalledWith({ where: { id: 'poll-1' } });
    });

    it('throws ForbiddenException on delete attempt by non-owner', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue({
        id: 'poll-1',
        teacherId: 'other-teacher',
      });

      await expect(service.delete('poll-1', 'teacher-123')).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.poll.delete).not.toHaveBeenCalled();
    });
  });
});
