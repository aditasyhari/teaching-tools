import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { Poll, PollSummary, User } from '@walikelas/types';
import { createPollSchema, updatePollSchema } from '@walikelas/validation';

@Controller('polls')
@UseGuards(AuthGuard)
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  async create(@CurrentUser() teacher: User, @Body() body: unknown): Promise<Poll> {
    const validation = createPollSchema.safeParse(body);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors[0]?.message || 'Data pembuatan polling tidak valid',
      );
    }
    return this.pollsService.create(teacher.id, validation.data);
  }

  @Get()
  async findAll(@CurrentUser() teacher: User): Promise<PollSummary[]> {
    return this.pollsService.findAll(teacher.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() teacher: User): Promise<Poll> {
    return this.pollsService.findOne(id, teacher.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() teacher: User,
    @Body() body: unknown,
  ): Promise<Poll> {
    const validation = updatePollSchema.safeParse(body);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors[0]?.message || 'Data pembaruan polling tidak valid',
      );
    }
    return this.pollsService.update(id, teacher.id, validation.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() teacher: User): Promise<{ id: string }> {
    await this.pollsService.delete(id, teacher.id);
    return { id };
  }
}
