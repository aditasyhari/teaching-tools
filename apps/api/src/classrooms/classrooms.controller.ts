import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User, ApiResponse, Classroom, ClassroomMember } from '@walikelas/types';
import type {
  CreateClassroomInput,
  UpdateClassroomInput,
  AddClassroomMemberInput,
} from '@walikelas/validation';

@Controller('classrooms')
@UseGuards(AuthGuard)
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Get()
  async findAll(@CurrentUser() user: User): Promise<ApiResponse<Classroom[]>> {
    const data = await this.classroomsService.findAll(user.id);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: CreateClassroomInput,
  ): Promise<ApiResponse<Classroom>> {
    const data = await this.classroomsService.create(user.id, body);
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
  ): Promise<ApiResponse<Classroom>> {
    const data = await this.classroomsService.findOne(id, user.id, user.role === 'ADMIN');
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
    @Body() body: UpdateClassroomInput,
  ): Promise<ApiResponse<Classroom>> {
    const data = await this.classroomsService.update(id, user.id, body, user.role === 'ADMIN');
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
    await this.classroomsService.delete(id, user.id, user.role === 'ADMIN');
    return {
      success: true,
      data: { id },
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: AddClassroomMemberInput,
  ): Promise<ApiResponse<ClassroomMember>> {
    const data = await this.classroomsService.addMember(id, user.id, body, user.role === 'ADMIN');
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<{ memberId: string }>> {
    await this.classroomsService.removeMember(id, memberId, user.id, user.role === 'ADMIN');
    return {
      success: true,
      data: { memberId },
      timestamp: new Date().toISOString(),
    };
  }
}
