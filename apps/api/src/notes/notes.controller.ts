import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User, ApiResponse, TeacherNote } from '@walikelas/types';
import type { CreateNoteInput, UpdateNoteInput, NoteQueryInput } from '@walikelas/validation';

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query() query: NoteQueryInput,
  ): Promise<ApiResponse<TeacherNote[]>> {
    const data = await this.notesService.findAll(user.id, query);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: CreateNoteInput,
  ): Promise<ApiResponse<TeacherNote>> {
    const data = await this.notesService.create(user.id, body);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<TeacherNote>> {
    const data = await this.notesService.findOne(id, user.id);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: UpdateNoteInput,
  ): Promise<ApiResponse<TeacherNote>> {
    const data = await this.notesService.update(id, user.id, body);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<{ id: string }>> {
    await this.notesService.delete(id, user.id);
    return {
      success: true,
      data: { id },
      timestamp: new Date().toISOString(),
    };
  }
}
