import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizzesService } from '../quizzes.service';

describe('QuizzesService', () => {
  let service: QuizzesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      quiz: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      quizQuestion: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    service = new QuizzesService(mockPrisma);
  });

  describe('create', () => {
    it('creates a quiz with questions and options', async () => {
      const teacherId = 'teacher-123';
      const input = {
        title: 'Kuis Geografi',
        description: 'Bab 1',
        settings: { timeLimitSeconds: 20, showLeaderboard: true, showCorrectAnswer: true },
        questions: [
          {
            text: 'Ibu kota Indonesia?',
            points: 100,
            timeLimitSeconds: 20,
            options: [
              { text: 'Jakarta', isCorrect: false },
              { text: 'Nusantara', isCorrect: true },
            ],
          },
        ],
      };

      mockPrisma.quiz.create.mockResolvedValue({
        id: 'quiz-1',
        teacherId,
        title: 'Kuis Geografi',
        description: 'Bab 1',
        settings: input.settings,
        status: 'DRAFT',
        questions: [
          {
            id: 'q-1',
            quizId: 'quiz-1',
            order: 1,
            questionText: 'Ibu kota Indonesia?',
            points: 100,
            timeLimitSeconds: 20,
            options: [
              { id: 'opt-1', questionId: 'q-1', order: 1, optionText: 'Jakarta', isCorrect: false },
              {
                id: 'opt-2',
                questionId: 'q-1',
                order: 2,
                optionText: 'Nusantara',
                isCorrect: true,
              },
            ],
          },
        ],
        createdAt: new Date('2026-09-13T00:00:00.000Z'),
        updatedAt: new Date('2026-09-13T00:00:00.000Z'),
      });

      const result = await service.create(teacherId, input as any);

      expect(result.id).toBe('quiz-1');
      expect(result.title).toBe('Kuis Geografi');
      expect(result.questions).toHaveLength(1);
      expect(result.questions![0].options).toHaveLength(2);
      expect(mockPrisma.quiz.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('returns quiz summaries for a teacher', async () => {
      mockPrisma.quiz.findMany.mockResolvedValue([
        {
          id: 'quiz-1',
          teacherId: 'teacher-123',
          title: 'Kuis 1',
          description: null,
          status: 'PUBLISHED',
          createdAt: new Date('2026-09-13T00:00:00.000Z'),
          updatedAt: new Date('2026-09-13T00:00:00.000Z'),
          _count: { questions: 5 },
        },
      ]);

      const result = await service.findAll('teacher-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('quiz-1');
      expect(result[0].questionCount).toBe(5);
      expect(mockPrisma.quiz.findMany).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-123' },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { questions: true } } },
      });
    });
  });

  describe('findOne', () => {
    it('returns quiz if found and owned by teacher', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue({
        id: 'quiz-1',
        teacherId: 'teacher-123',
        title: 'Kuis 1',
        description: null,
        settings: {},
        status: 'PUBLISHED',
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.findOne('quiz-1', 'teacher-123');
      expect(result.id).toBe('quiz-1');
    });

    it('throws NotFoundException if quiz does not exist', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'teacher-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if quiz is owned by another teacher (IDOR)', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue({
        id: 'quiz-1',
        teacherId: 'other-teacher',
      });

      await expect(service.findOne('quiz-1', 'teacher-123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException on IDOR', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue({
        id: 'quiz-1',
        teacherId: 'other-teacher',
      });

      await expect(service.update('quiz-1', 'teacher-123', { title: 'New Title' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('updates quiz metadata and replaces questions transactionally', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue({
        id: 'quiz-1',
        teacherId: 'teacher-123',
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.quiz.update.mockResolvedValue({
        id: 'quiz-1',
        teacherId: 'teacher-123',
        title: 'Updated Title',
        description: 'New Desc',
        settings: {},
        status: 'DRAFT',
        questions: [
          {
            id: 'q-new',
            quizId: 'quiz-1',
            order: 1,
            questionText: 'Q1',
            points: 100,
            timeLimitSeconds: 30,
            options: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update('quiz-1', 'teacher-123', {
        title: 'Updated Title',
        description: 'New Desc',
        questions: [
          {
            text: 'Q1',
            points: 100,
            timeLimitSeconds: 30,
            options: [
              { text: 'A', isCorrect: true },
              { text: 'B', isCorrect: false },
            ],
          },
        ],
      } as any);

      expect(result.title).toBe('Updated Title');
      expect(mockPrisma.quizQuestion.deleteMany).toHaveBeenCalledWith({
        where: { quizId: 'quiz-1' },
      });
      expect(mockPrisma.quizQuestion.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes quiz when owned by teacher', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue({
        id: 'quiz-1',
        teacherId: 'teacher-123',
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.quiz.delete.mockResolvedValue({ id: 'quiz-1' });

      await service.delete('quiz-1', 'teacher-123');
      expect(mockPrisma.quiz.delete).toHaveBeenCalledWith({ where: { id: 'quiz-1' } });
    });

    it('throws ForbiddenException on delete attempt by non-owner', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue({
        id: 'quiz-1',
        teacherId: 'other-teacher',
      });

      await expect(service.delete('quiz-1', 'teacher-123')).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.quiz.delete).not.toHaveBeenCalled();
    });
  });
});
