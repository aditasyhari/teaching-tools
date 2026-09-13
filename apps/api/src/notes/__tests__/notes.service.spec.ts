import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotesService } from '../notes.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('NotesService (IDOR, Classroom Validation, & CRUD)', () => {
  let service: NotesService;
  let mockPrisma: any;

  const sampleNote = {
    id: 'note-1',
    teacherId: 'teacher-owner',
    classroomId: 'class-1',
    title: 'Catatan Bab Kalor',
    content: 'Persiapkan alat termometer untuk pertemuan berikutnya.',
    tags: ['fisika', 'praktikum'],
    pinned: false,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  const sampleClassroom = {
    id: 'class-1',
    teacherId: 'teacher-owner',
    name: 'Kelas 7A',
    subject: 'IPA',
  };

  beforeEach(() => {
    mockPrisma = {
      teacherNote: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      classroom: {
        findUnique: vi.fn(),
      },
    };

    service = new NotesService(mockPrisma);
  });

  describe('findAll', () => {
    it('returns all notes belonging to the teacher with pinned first', async () => {
      mockPrisma.teacherNote.findMany.mockResolvedValue([sampleNote]);

      const notes = await service.findAll('teacher-owner', {});
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('note-1');
      expect(notes[0].title).toBe('Catatan Bab Kalor');
      expect(mockPrisma.teacherNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ teacherId: 'teacher-owner' }),
        }),
      );
    });

    it('filters by classroom and search text', async () => {
      mockPrisma.teacherNote.findMany.mockResolvedValue([sampleNote]);

      await service.findAll('teacher-owner', {
        classroomId: 'class-1',
        search: 'kalor',
        pinned: false,
      });

      expect(mockPrisma.teacherNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teacherId: 'teacher-owner',
            classroomId: 'class-1',
            pinned: false,
          }),
        }),
      );
    });
  });

  describe('findOne (IDOR Protection)', () => {
    it('allows teacher to retrieve their own note', async () => {
      mockPrisma.teacherNote.findUnique.mockResolvedValue(sampleNote);

      const note = await service.findOne('note-1', 'teacher-owner');
      expect(note.id).toBe('note-1');
      expect(note.title).toBe('Catatan Bab Kalor');
    });

    it('blocks another teacher from viewing the note (IDOR prevention)', async () => {
      mockPrisma.teacherNote.findUnique.mockResolvedValue(sampleNote);

      await expect(service.findOne('note-1', 'intruder-teacher')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException if note does not exist', async () => {
      mockPrisma.teacherNote.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'teacher-owner')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a note without classroom context successfully', async () => {
      mockPrisma.teacherNote.create.mockResolvedValue({
        ...sampleNote,
        classroomId: null,
      });

      const note = await service.create('teacher-owner', {
        title: 'Catatan Bebas',
        content: 'Refleksi mengajar hari ini.',
      });

      expect(note.id).toBe('note-1');
      expect(mockPrisma.teacherNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            teacherId: 'teacher-owner',
            classroomId: null,
            title: 'Catatan Bebas',
          }),
        }),
      );
    });

    it('creates a note with valid classroom context owned by teacher', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(sampleClassroom);
      mockPrisma.teacherNote.create.mockResolvedValue(sampleNote);

      const note = await service.create('teacher-owner', {
        title: 'Catatan Kelas 7A',
        content: 'Konten evaluasi',
        classroomId: 'class-1',
      });

      expect(note.id).toBe('note-1');
      expect(mockPrisma.classroom.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
    });

    it('rejects creating note with a classroom owned by another teacher', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue({
        ...sampleClassroom,
        teacherId: 'other-teacher',
      });

      await expect(
        service.create('teacher-owner', {
          title: 'Percobaan Catatan Kelas Orang Lain',
          content: 'Konten',
          classroomId: 'class-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects invalid note with empty title', async () => {
      await expect(
        service.create('teacher-owner', {
          title: '   ',
          content: 'Konten',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('allows owner to update and toggle pin', async () => {
      mockPrisma.teacherNote.findUnique.mockResolvedValue(sampleNote);
      mockPrisma.teacherNote.update.mockResolvedValue({
        ...sampleNote,
        pinned: true,
        title: 'Judul Baru',
      });

      const updated = await service.update('note-1', 'teacher-owner', {
        title: 'Judul Baru',
        pinned: true,
      });

      expect(updated.pinned).toBe(true);
      expect(updated.title).toBe('Judul Baru');
    });

    it('blocks another teacher from updating the note (IDOR)', async () => {
      mockPrisma.teacherNote.findUnique.mockResolvedValue(sampleNote);

      await expect(
        service.update('note-1', 'intruder-teacher', {
          title: 'Judul Dihack',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('allows owner to delete note', async () => {
      mockPrisma.teacherNote.findUnique.mockResolvedValue(sampleNote);
      mockPrisma.teacherNote.delete.mockResolvedValue(sampleNote);

      await service.delete('note-1', 'teacher-owner');
      expect(mockPrisma.teacherNote.delete).toHaveBeenCalledWith({
        where: { id: 'note-1' },
      });
    });

    it('blocks another teacher from deleting the note (IDOR)', async () => {
      mockPrisma.teacherNote.findUnique.mockResolvedValue(sampleNote);

      await expect(service.delete('note-1', 'intruder-teacher')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
