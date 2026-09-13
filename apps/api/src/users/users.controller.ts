import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User, ApiResponse, TeacherProfile } from '@walikelas/types';
import type { UpdateTeacherProfileInput } from '@walikelas/validation';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: User): Promise<ApiResponse<TeacherProfile>> {
    const profile = await this.usersService.getProfile(user.id);
    return {
      success: true,
      data: profile,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateTeacherProfileInput,
  ): Promise<ApiResponse<TeacherProfile>> {
    const profile = await this.usersService.updateProfile(user.id, body);
    return {
      success: true,
      data: profile,
      timestamp: new Date().toISOString(),
    };
  }
}
