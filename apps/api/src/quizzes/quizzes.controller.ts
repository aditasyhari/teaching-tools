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
import { QuizzesService } from './quizzes.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { Quiz, QuizSummary, User } from '@walikelas/types';
import { createQuizSchema, updateQuizSchema } from '@walikelas/validation';

@Controller('quizzes')
@UseGuards(AuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  async create(@CurrentUser() teacher: User, @Body() body: unknown): Promise<Quiz> {
    const validation = createQuizSchema.safeParse(body);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors[0]?.message || 'Data pembuatan kuis tidak valid',
      );
    }
    return this.quizzesService.create(teacher.id, validation.data);
  }

  @Get()
  async findAll(@CurrentUser() teacher: User): Promise<QuizSummary[]> {
    return this.quizzesService.findAll(teacher.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() teacher: User): Promise<Quiz> {
    return this.quizzesService.findOne(id, teacher.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() teacher: User,
    @Body() body: unknown,
  ): Promise<Quiz> {
    const validation = updateQuizSchema.safeParse(body);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors[0]?.message || 'Data pembaruan kuis tidak valid',
      );
    }
    return this.quizzesService.update(id, teacher.id, validation.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() teacher: User): Promise<{ id: string }> {
    await this.quizzesService.delete(id, teacher.id);
    return { id };
  }
}
