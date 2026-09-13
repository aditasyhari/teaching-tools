import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassroomsService } from '../classrooms.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ClassroomsService (IDOR & CRUD)', () => {
  let service: ClassroomsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      classroom: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      classroomMember: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new ClassroomsService(mockPrisma);
  });

  const sampleClassroom = {
    id: 'class-1',
    teacherId: 'teacher-owner',
    name: 'Kelas 7A',
    subject: 'IPA',
    grade: '7',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [],
  };

  describe('findOne (IDOR protection)', () => {
    it('allows the classroom owner to access the classroom', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(sampleClassroom);

      const result = await service.findOne('class-1', 'teacher-owner');
      expect(result.id).toBe('class-1');
      expect(result.name).toBe('Kelas 7A');
    });

    it('blocks another teacher from accessing the classroom (IDOR)', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(sampleClassroom);

      await expect(service.findOne('class-1', 'other-teacher', false)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows an admin to access any classroom', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(sampleClassroom);

      const result = await service.findOne('class-1', 'admin-id', true);
      expect(result.id).toBe('class-1');
    });

    it('throws NotFoundException if classroom does not exist', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'teacher-owner')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a classroom linked to the teacher', async () => {
      mockPrisma.classroom.create.mockResolvedValue({
        ...sampleClassroom,
        id: 'class-new',
      });

      const result = await service.create('teacher-owner', {
        name: 'Kelas 8B',
        subject: 'Matematika',
      });

      expect(result.id).toBe('class-new');
      expect(mockPrisma.classroom.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            teacherId: 'teacher-owner',
            name: 'Kelas 8B',
          }),
        }),
      );
    });

    it('rejects invalid classroom name with BadRequestException', async () => {
      await expect(
        service.create('teacher-owner', {
          name: '',
        } as any),
      ).rejects.toThrow();
    });
  });

  describe('update & archive', () => {
    it('allows owner to update and archive classroom', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(sampleClassroom);
      mockPrisma.classroom.update.mockResolvedValue({
        ...sampleClassroom,
        status: 'ARCHIVED',
        name: 'Kelas 7A (Arsip)',
      });

      const updated = await service.update('class-1', 'teacher-owner', {
        name: 'Kelas 7A (Arsip)',
        status: 'ARCHIVED',
      });

      expect(updated.status).toBe('ARCHIVED');
      expect(mockPrisma.classroom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'class-1' },
          data: expect.objectContaining({
            name: 'Kelas 7A (Arsip)',
            status: 'ARCHIVED',
          }),
        }),
      );
    });

    it('blocks another teacher from updating or archiving classroom (IDOR)', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(sampleClassroom);

      await expect(
        service.update('class-1', 'attacker-teacher', {
          status: 'ARCHIVED',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
