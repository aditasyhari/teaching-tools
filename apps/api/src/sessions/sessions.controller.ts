import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsGateway } from './sessions.gateway';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { TeachingSession, SessionSnapshot, SessionParticipant, User } from '@walikelas/types';
import { createSessionSchema, joinCodeSchema } from '@walikelas/validation';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly gateway: SessionsGateway,
  ) {}

  /**
   * Public: Verify join code and return session basic info.
   */
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body('code') code: string): Promise<{
    id: string;
    title: string;
    joinCode: string;
    status: string;
  }> {
    const validation = joinCodeSchema.safeParse(code);
    if (!validation.success) {
      throw new BadRequestException('Format kode sesi tidak valid');
    }
    return this.sessionsService.verifyJoinCode(validation.data);
  }

  /**
   * Teacher: Create new teaching session.
   */
  @Post()
  @UseGuards(AuthGuard)
  async create(@CurrentUser() teacher: User, @Body() body: unknown): Promise<TeachingSession> {
    const validation = createSessionSchema.safeParse(body);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors[0]?.message || 'Data pembuatan sesi tidak valid',
      );
    }
    return this.sessionsService.createSession(teacher.id, validation.data);
  }

  /**
   * Teacher: List all owned sessions.
   */
  @Get()
  @UseGuards(AuthGuard)
  async findAll(@CurrentUser() teacher: User): Promise<TeachingSession[]> {
    return this.sessionsService.findAllTeacherSessions(teacher.id);
  }

  /**
   * Teacher: Get single session snapshot.
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() teacher: User): Promise<SessionSnapshot> {
    return this.sessionsService.getTeacherSnapshot(id, teacher.id);
  }

  /**
   * Teacher: Start session (WAITING -> ACTIVE).
   */
  @Post(':id/start')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async start(@Param('id') id: string, @CurrentUser() teacher: User): Promise<TeachingSession> {
    const updated = await this.sessionsService.startSession(id, teacher.id);

    // Broadcast session:started to realtime clients
    this.gateway.broadcastState(id, 'session:started', {
      startedAt: updated.startedAt || new Date().toISOString(),
    });

    return updated;
  }

  /**
   * Teacher: End session (WAITING or ACTIVE -> ENDED).
   */
  @Post(':id/end')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async end(@Param('id') id: string, @CurrentUser() teacher: User): Promise<TeachingSession> {
    const updated = await this.sessionsService.endSession(id, teacher.id);

    // Broadcast session:ended to realtime clients
    this.gateway.broadcastState(id, 'session:ended', {
      endedAt: updated.endedAt || new Date().toISOString(),
    });

    return updated;
  }

  /**
   * Teacher: Get active in-memory participants.
   */
  @Get(':id/participants')
  @UseGuards(AuthGuard)
  async getParticipants(
    @Param('id') id: string,
    @CurrentUser() teacher: User,
  ): Promise<SessionParticipant[]> {
    return this.sessionsService.getParticipants(id, teacher.id);
  }
}
