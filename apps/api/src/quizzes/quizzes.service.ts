import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Quiz, QuizSummary } from '@walikelas/types';
import type { CreateQuizInput, UpdateQuizInput } from '@walikelas/validation';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new quiz with questions and options transactionally.
   */
  async create(teacherId: string, input: CreateQuizInput): Promise<Quiz> {
    const questionsData = input.questions.map((q, qIndex) => ({
      order: qIndex + 1,
      questionText: q.text.trim(),
      points: q.points ?? 100,
      timeLimitSeconds: q.timeLimitSeconds ?? input.settings?.timeLimitSeconds ?? 30,
      options: {
        create: q.options.map((opt, optIndex) => ({
          order: optIndex + 1,
          optionText: opt.text.trim(),
          isCorrect: opt.isCorrect,
        })),
      },
    }));

    const quiz = await this.prisma.quiz.create({
      data: {
        teacherId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        settings: (input.settings as any) || {
          timeLimitSeconds: 30,
          showLeaderboard: true,
          showCorrectAnswer: true,
        },
        questions: {
          create: questionsData,
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    this.logger.log(`Quiz created: [${quiz.title}] (ID: ${quiz.id}) by teacher ${teacherId}`);

    return {
      id: quiz.id,
      teacherId: quiz.teacherId,
      title: quiz.title,
      description: quiz.description,
      settings: (quiz.settings as any) || {},
      status: quiz.status,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        quizId: q.quizId,
        order: q.order,
        questionText: q.questionText,
        points: q.points,
        timeLimitSeconds: q.timeLimitSeconds,
        options: q.options.map((o) => ({
          id: o.id,
          questionId: o.questionId,
          order: o.order,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
        })),
      })),
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    };
  }

  /**
   * List all quizzes owned by a teacher.
   */
  async findAll(teacherId: string): Promise<QuizSummary[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: { teacherId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    return quizzes.map((q) => ({
      id: q.id,
      teacherId: q.teacherId,
      title: q.title,
      description: q.description,
      status: q.status,
      questionCount: q._count.questions,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    }));
  }

  /**
   * Find a single quiz with questions and options (IDOR protected).
   */
  async findOne(quizId: string, teacherId: string): Promise<Quiz> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Kuis tidak ditemukan');
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kuis ini');
    }

    return {
      id: quiz.id,
      teacherId: quiz.teacherId,
      title: quiz.title,
      description: quiz.description,
      settings: (quiz.settings as any) || {},
      status: quiz.status,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        quizId: q.quizId,
        order: q.order,
        questionText: q.questionText,
        points: q.points,
        timeLimitSeconds: q.timeLimitSeconds,
        options: q.options.map((o) => ({
          id: o.id,
          questionId: o.questionId,
          order: o.order,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
        })),
      })),
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    };
  }

  /**
   * Update a quiz and its questions/options transactionally.
   */
  async update(quizId: string, teacherId: string, input: UpdateQuizInput): Promise<Quiz> {
    await this.findOne(quizId, teacherId); // Verifies existence and ownership

    return this.prisma.$transaction(async (tx) => {
      // If questions provided, replace all questions and options cleanly
      if (input.questions) {
        // Delete existing questions (cascade deletes options)
        await tx.quizQuestion.deleteMany({
          where: { quizId },
        });

        // Create new questions with options
        for (let qIndex = 0; qIndex < input.questions.length; qIndex++) {
          const q = input.questions[qIndex]!;
          await tx.quizQuestion.create({
            data: {
              quizId,
              order: qIndex + 1,
              questionText: q.text.trim(),
              points: q.points ?? 100,
              timeLimitSeconds: q.timeLimitSeconds ?? input.settings?.timeLimitSeconds ?? 30,
              options: {
                create: q.options.map((opt, optIndex) => ({
                  order: optIndex + 1,
                  optionText: opt.text.trim(),
                  isCorrect: opt.isCorrect,
                })),
              },
            },
          });
        }
      }

      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.description !== undefined)
        updateData.description = input.description?.trim() || null;
      if (input.settings !== undefined) updateData.settings = input.settings;

      const updated = await tx.quiz.update({
        where: { id: quizId },
        data: updateData,
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      this.logger.log(`Quiz updated: [${updated.title}] (ID: ${quizId}) by teacher ${teacherId}`);

      return {
        id: updated.id,
        teacherId: updated.teacherId,
        title: updated.title,
        description: updated.description,
        settings: (updated.settings as any) || {},
        status: updated.status,
        questions: updated.questions.map((q) => ({
          id: q.id,
          quizId: q.quizId,
          order: q.order,
          questionText: q.questionText,
          points: q.points,
          timeLimitSeconds: q.timeLimitSeconds,
          options: q.options.map((o) => ({
            id: o.id,
            questionId: o.questionId,
            order: o.order,
            optionText: o.optionText,
            isCorrect: o.isCorrect,
          })),
        })),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    });
  }

  /**
   * Delete a quiz (cascade deletes questions and options).
   */
  async delete(quizId: string, teacherId: string): Promise<void> {
    await this.findOne(quizId, teacherId); // Verifies ownership

    await this.prisma.quiz.delete({
      where: { id: quizId },
    });

    this.logger.log(`Quiz deleted: (ID: ${quizId}) by teacher ${teacherId}`);
  }
}
