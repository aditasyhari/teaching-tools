import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { TeacherProfile } from '@walikelas/types';
import { type UpdateTeacherProfileInput, updateTeacherProfileSchema } from '@walikelas/validation';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<TeacherProfile> {
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil guru tidak ditemukan.');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      schoolName: profile.schoolName,
      preferences: profile.preferences as Record<string, any>,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  async updateProfile(userId: string, data: UpdateTeacherProfileInput): Promise<TeacherProfile> {
    const parseResult = updateTeacherProfileSchema.safeParse(data);
    if (!parseResult.success) {
      throw new BadRequestException(
        parseResult.error.errors[0]?.message || 'Input profil tidak valid.',
      );
    }
    const validData = parseResult.data;

    const existing = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Profil guru tidak ditemukan.');
    }

    const updated = await this.prisma.teacherProfile.update({
      where: { userId },
      data: {
        ...(validData.displayName ? { displayName: validData.displayName } : {}),
        ...(validData.schoolName !== undefined ? { schoolName: validData.schoolName } : {}),
        ...(validData.preferences ? { preferences: validData.preferences } : {}),
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      displayName: updated.displayName,
      schoolName: updated.schoolName,
      preferences: updated.preferences as Record<string, any>,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
