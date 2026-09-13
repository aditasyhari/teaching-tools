import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Poll, PollSummary } from '@walikelas/types';
import type { CreatePollInput, UpdatePollInput } from '@walikelas/validation';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new poll with options transactionally.
   */
  async create(teacherId: string, input: CreatePollInput): Promise<Poll> {
    const optionsData = input.options.map((opt, optIndex) => ({
      order: optIndex + 1,
      optionText: opt.optionText.trim(),
    }));

    const poll = await this.prisma.poll.create({
      data: {
        teacherId,
        title: input.title.trim(),
        question: input.question.trim(),
        type: input.type || 'SINGLE_CHOICE',
        settings: (input.settings as any) || {
          allowMultiple: false,
          showResultsToParticipants: true,
          isAnonymous: true,
        },
        options: {
          create: optionsData,
        },
      },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    this.logger.log(`Poll created: [${poll.title}] (ID: ${poll.id}) by teacher ${teacherId}`);

    return {
      id: poll.id,
      teacherId: poll.teacherId,
      title: poll.title,
      question: poll.question,
      type: poll.type as any,
      settings: (poll.settings as any) || {},
      status: poll.status as any,
      options: poll.options.map((o) => ({
        id: o.id,
        pollId: o.pollId,
        order: o.order,
        optionText: o.optionText,
      })),
      createdAt: poll.createdAt.toISOString(),
      updatedAt: poll.updatedAt.toISOString(),
    };
  }

  /**
   * List all polls owned by a teacher.
   */
  async findAll(teacherId: string): Promise<PollSummary[]> {
    const polls = await this.prisma.poll.findMany({
      where: { teacherId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { options: true },
        },
      },
    });

    return polls.map((p) => ({
      id: p.id,
      teacherId: p.teacherId,
      title: p.title,
      question: p.question,
      type: p.type as any,
      status: p.status as any,
      optionCount: p._count.options,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  /**
   * Find a single poll with options (IDOR protected).
   */
  async findOne(pollId: string, teacherId: string): Promise<Poll> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Polling tidak ditemukan');
    }

    if (poll.teacherId !== teacherId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke polling ini');
    }

    return {
      id: poll.id,
      teacherId: poll.teacherId,
      title: poll.title,
      question: poll.question,
      type: poll.type as any,
      settings: (poll.settings as any) || {},
      status: poll.status as any,
      options: poll.options.map((o) => ({
        id: o.id,
        pollId: o.pollId,
        order: o.order,
        optionText: o.optionText,
      })),
      createdAt: poll.createdAt.toISOString(),
      updatedAt: poll.updatedAt.toISOString(),
    };
  }

  /**
   * Update a poll and its options transactionally.
   */
  async update(pollId: string, teacherId: string, input: UpdatePollInput): Promise<Poll> {
    await this.findOne(pollId, teacherId); // Verifies existence and ownership

    return this.prisma.$transaction(async (tx) => {
      // If options provided, replace all options cleanly
      if (input.options) {
        await tx.pollOption.deleteMany({
          where: { pollId },
        });

        for (let optIndex = 0; optIndex < input.options.length; optIndex++) {
          const opt = input.options[optIndex]!;
          await tx.pollOption.create({
            data: {
              pollId,
              order: optIndex + 1,
              optionText: opt.optionText.trim(),
            },
          });
        }
      }

      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.question !== undefined) updateData.question = input.question.trim();
      if (input.type !== undefined) updateData.type = input.type;
      if (input.settings !== undefined) updateData.settings = input.settings;

      const updated = await tx.poll.update({
        where: { id: pollId },
        data: updateData,
        include: {
          options: {
            orderBy: { order: 'asc' },
          },
        },
      });

      this.logger.log(`Poll updated: [${updated.title}] (ID: ${pollId}) by teacher ${teacherId}`);

      return {
        id: updated.id,
        teacherId: updated.teacherId,
        title: updated.title,
        question: updated.question,
        type: updated.type as any,
        settings: (updated.settings as any) || {},
        status: updated.status as any,
        options: updated.options.map((o) => ({
          id: o.id,
          pollId: o.pollId,
          order: o.order,
          optionText: o.optionText,
        })),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    });
  }

  /**
   * Delete a poll (cascade deletes options).
   */
  async delete(pollId: string, teacherId: string): Promise<void> {
    await this.findOne(pollId, teacherId); // Verifies ownership

    await this.prisma.poll.delete({
      where: { id: pollId },
    });

    this.logger.log(`Poll deleted: (ID: ${pollId}) by teacher ${teacherId}`);
  }
}
