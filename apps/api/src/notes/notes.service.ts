import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { TeacherNote } from '@walikelas/types';
import {
  type CreateNoteInput,
  type UpdateNoteInput,
  type NoteQueryInput,
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
} from '@walikelas/validation';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapNote(n: any): TeacherNote {
    return {
      id: n.id,
      teacherId: n.teacherId,
      classroomId: n.classroomId,
      title: n.title,
      content: n.content,
      tags: n.tags || [],
      pinned: n.pinned,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    };
  }

  async findAll(teacherId: string, query?: NoteQueryInput): Promise<TeacherNote[]> {
    const validQuery = query ? noteQuerySchema.parse(query) : {};

    const whereClause: any = {
      teacherId,
    };

    if (validQuery.classroomId) {
      whereClause.classroomId = validQuery.classroomId;
    }

    if (validQuery.pinned !== undefined) {
      whereClause.pinned = validQuery.pinned;
    }

    if (validQuery.search) {
      whereClause.OR = [
        { title: { contains: validQuery.search, mode: 'insensitive' } },
        { content: { contains: validQuery.search, mode: 'insensitive' } },
      ];
    }

    const notes = await this.prisma.teacherNote.findMany({
      where: whereClause,
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });

    return notes.map((n) => this.mapNote(n));
  }

  async findOne(id: string, teacherId: string): Promise<TeacherNote> {
    const note = await this.prisma.teacherNote.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Catatan tidak ditemukan.');
    }

    // IDOR Protection: verify teacher owns this note
    if (note.teacherId !== teacherId) {
      throw new ForbiddenException('Anda tidak memiliki izin untuk mengakses catatan ini.');
    }

    return this.mapNote(note);
  }

  async create(teacherId: string, data: CreateNoteInput): Promise<TeacherNote> {
    const parseResult = createNoteSchema.safeParse(data);
    if (!parseResult.success) {
      throw new BadRequestException(
        parseResult.error.errors[0]?.message || 'Data catatan tidak valid.',
      );
    }
    const validData = parseResult.data;

    // If classroomId is provided, verify it belongs to this teacher
    if (validData.classroomId) {
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: validData.classroomId },
      });

      if (!classroom) {
        throw new NotFoundException('Konteks kelas yang dipilih tidak ditemukan.');
      }

      if (classroom.teacherId !== teacherId) {
        throw new ForbiddenException('Konteks kelas tidak valid atau bukan milik Anda.');
      }
    }

    const note = await this.prisma.teacherNote.create({
      data: {
        teacherId,
        classroomId: validData.classroomId || null,
        title: validData.title,
        content: validData.content,
        tags: validData.tags || [],
        pinned: validData.pinned || false,
      },
    });

    return this.mapNote(note);
  }

  async update(id: string, teacherId: string, data: UpdateNoteInput): Promise<TeacherNote> {
    await this.findOne(id, teacherId);

    const parseResult = updateNoteSchema.safeParse(data);
    if (!parseResult.success) {
      throw new BadRequestException(
        parseResult.error.errors[0]?.message || 'Data pembaruan catatan tidak valid.',
      );
    }
    const validData = parseResult.data;

    if (validData.classroomId) {
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: validData.classroomId },
      });

      if (!classroom || classroom.teacherId !== teacherId) {
        throw new ForbiddenException('Konteks kelas tidak valid atau bukan milik Anda.');
      }
    }

    const updated = await this.prisma.teacherNote.update({
      where: { id },
      data: {
        ...(validData.title !== undefined ? { title: validData.title } : {}),
        ...(validData.content !== undefined ? { content: validData.content } : {}),
        ...(validData.classroomId !== undefined ? { classroomId: validData.classroomId } : {}),
        ...(validData.tags !== undefined ? { tags: validData.tags } : {}),
        ...(validData.pinned !== undefined ? { pinned: validData.pinned } : {}),
      },
    });

    return this.mapNote(updated);
  }

  async delete(id: string, teacherId: string): Promise<void> {
    await this.findOne(id, teacherId);

    await this.prisma.teacherNote.delete({
      where: { id },
    });
  }
}
