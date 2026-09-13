import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Classroom, ClassroomMember } from '@walikelas/types';
import {
  type CreateClassroomInput,
  type UpdateClassroomInput,
  type AddClassroomMemberInput,
  createClassroomSchema,
  updateClassroomSchema,
  addClassroomMemberSchema,
} from '@walikelas/validation';

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapClassroom(c: any): Classroom {
    return {
      id: c.id,
      teacherId: c.teacherId,
      name: c.name,
      subject: c.subject,
      grade: c.grade,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      members: c.members?.map((m: any) => this.mapMember(m)),
    };
  }

  private mapMember(m: any): ClassroomMember {
    return {
      id: m.id,
      classroomId: m.classroomId,
      displayName: m.displayName,
      studentIdentifier: m.studentIdentifier,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }

  async findAll(teacherId: string): Promise<Classroom[]> {
    const classrooms = await this.prisma.classroom.findMany({
      where: { teacherId },
      include: {
        members: {
          where: { status: 'ACTIVE' },
          orderBy: { displayName: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return classrooms.map((c) => this.mapClassroom(c));
  }

  async findOne(id: string, teacherId: string, isAdmin = false): Promise<Classroom> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        members: {
          where: { status: 'ACTIVE' },
          orderBy: { displayName: 'asc' },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Ruang kelas tidak ditemukan.');
    }

    // IDOR Protection: verify teacher owns this classroom
    if (!isAdmin && classroom.teacherId !== teacherId) {
      throw new ForbiddenException('Anda tidak memiliki hak akses ke kelas ini.');
    }

    return this.mapClassroom(classroom);
  }

  async create(teacherId: string, data: CreateClassroomInput): Promise<Classroom> {
    const parseResult = createClassroomSchema.safeParse(data);
    if (!parseResult.success) {
      throw new BadRequestException(
        parseResult.error.errors[0]?.message || 'Input kelas tidak valid.',
      );
    }
    const validData = parseResult.data;

    const classroom = await this.prisma.classroom.create({
      data: {
        teacherId,
        name: validData.name,
        subject: validData.subject,
        grade: validData.grade,
      },
      include: {
        members: true,
      },
    });

    return this.mapClassroom(classroom);
  }

  async update(
    id: string,
    teacherId: string,
    data: UpdateClassroomInput,
    isAdmin = false,
  ): Promise<Classroom> {
    await this.findOne(id, teacherId, isAdmin);

    const parseResult = updateClassroomSchema.safeParse(data);
    if (!parseResult.success) {
      throw new BadRequestException(
        parseResult.error.errors[0]?.message || 'Input pembaruan kelas tidak valid.',
      );
    }
    const validData = parseResult.data;

    const updated = await this.prisma.classroom.update({
      where: { id },
      data: {
        ...(validData.name ? { name: validData.name } : {}),
        ...(validData.subject !== undefined ? { subject: validData.subject } : {}),
        ...(validData.grade !== undefined ? { grade: validData.grade } : {}),
        ...(validData.status ? { status: validData.status } : {}),
      },
      include: {
        members: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    return this.mapClassroom(updated);
  }

  async delete(id: string, teacherId: string, isAdmin = false): Promise<void> {
    await this.findOne(id, teacherId, isAdmin);

    await this.prisma.classroom.delete({
      where: { id },
    });
  }

  async addMember(
    classroomId: string,
    teacherId: string,
    data: AddClassroomMemberInput,
    isAdmin = false,
  ): Promise<ClassroomMember> {
    await this.findOne(classroomId, teacherId, isAdmin);

    const parseResult = addClassroomMemberSchema.safeParse(data);
    if (!parseResult.success) {
      throw new BadRequestException(
        parseResult.error.errors[0]?.message || 'Input data siswa tidak valid.',
      );
    }
    const validData = parseResult.data;

    const member = await this.prisma.classroomMember.create({
      data: {
        classroomId,
        displayName: validData.displayName,
        studentIdentifier: validData.studentIdentifier,
      },
    });

    return this.mapMember(member);
  }

  async removeMember(
    classroomId: string,
    memberId: string,
    teacherId: string,
    isAdmin = false,
  ): Promise<void> {
    await this.findOne(classroomId, teacherId, isAdmin);

    const member = await this.prisma.classroomMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.classroomId !== classroomId) {
      throw new NotFoundException('Siswa tidak ditemukan dalam daftar kelas ini.');
    }

    await this.prisma.classroomMember.delete({
      where: { id: memberId },
    });
  }
}
