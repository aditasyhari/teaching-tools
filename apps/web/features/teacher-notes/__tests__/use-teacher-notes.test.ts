import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTeacherNotes } from '../use-teacher-notes';

// Mock dependencies
const mockNotes = [
  {
    id: 'note-1',
    teacherId: 'teacher-1',
    classroomId: 'class-1',
    title: 'Catatan Rencana IPA',
    content: 'Persiapan praktikum.',
    tags: ['ipa'],
    pinned: false,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
];

vi.mock('../../../lib/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'teacher-1', name: 'Budi' },
    activeClassroom: { id: 'class-1', name: 'Kelas 7A' },
  }),
}));

vi.mock('@walikelas/api-client', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    fetchNotes: vi.fn().mockImplementation(async () => mockNotes),
    createNote: vi.fn().mockImplementation(async (_, input) => ({
      id: 'note-new',
      teacherId: 'teacher-1',
      classroomId: input.classroomId || null,
      title: input.title,
      content: input.content || '',
      tags: input.tags || [],
      pinned: input.pinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    updateNote: vi.fn().mockImplementation(async (_, _id, input) => ({
      ...mockNotes[0],
      ...input,
    })),
    deleteNote: vi.fn().mockImplementation(async () => {}),
  };
});

describe('useTeacherNotes Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads notes on mount when authenticated', async () => {
    const { result } = renderHook(() => useTeacherNotes());

    // Wait for effect to load notes
    await act(async () => {
      await result.current.reloadNotes();
    });

    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0]?.title).toBe('Catatan Rencana IPA');
  });

  it('creates note and prepends to notes list', async () => {
    const { result } = renderHook(() => useTeacherNotes());

    await act(async () => {
      await result.current.createNote({
        title: 'Catatan Baru',
        content: 'Isi baru',
      });
    });

    expect(result.current.notes[0]?.title).toBe('Catatan Baru');
  });

  it('toggles pin on note', async () => {
    const { result } = renderHook(() => useTeacherNotes());

    await act(async () => {
      await result.current.reloadNotes();
    });

    const noteToToggle = result.current.notes[0]!;
    await act(async () => {
      await result.current.togglePin(noteToToggle);
    });

    expect(result.current.notes[0]?.pinned).toBe(true);
  });

  it('deletes note from list', async () => {
    const { result } = renderHook(() => useTeacherNotes());

    await act(async () => {
      await result.current.reloadNotes();
    });

    expect(result.current.notes).toHaveLength(1);

    await act(async () => {
      await result.current.deleteNote('note-1');
    });

    expect(result.current.notes).toHaveLength(0);
  });
});
