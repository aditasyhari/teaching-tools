import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClassroomsView } from '../classrooms-view';

// Mock classroom data
const mockClassrooms = [
  {
    id: 'class-1',
    teacherId: 'teacher-1',
    name: 'Kelas 7A',
    subject: 'Matematika',
    grade: 'Kelas 7',
    status: 'ACTIVE' as const,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    members: [
      {
        id: 'member-1',
        classroomId: 'class-1',
        displayName: 'Ahmad Dahlan',
        studentIdentifier: '101',
        status: 'ACTIVE' as const,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'class-2',
    teacherId: 'teacher-1',
    name: 'Kelas 8B',
    subject: 'IPA',
    grade: 'Kelas 8',
    status: 'ACTIVE' as const,
    createdAt: '2026-09-02T00:00:00.000Z',
    updatedAt: '2026-09-02T00:00:00.000Z',
    members: [],
  },
];

const mockSetActiveClassroom = vi.fn();
const mockRefreshAuth = vi.fn();

vi.mock('../../../lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'teacher-1', name: 'Guru Contoh' },
    activeClassroom: mockClassrooms[0],
    setActiveClassroom: mockSetActiveClassroom,
    refreshAuth: mockRefreshAuth,
    classrooms: mockClassrooms,
  }),
}));

vi.mock('@walikelas/api-client', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    fetchClassrooms: vi.fn().mockImplementation(async () => mockClassrooms),
    createClassroom: vi.fn().mockImplementation(async (_, input) => ({
      id: 'class-new',
      teacherId: 'teacher-1',
      name: input.name,
      subject: input.subject || null,
      grade: input.grade || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [],
    })),
    updateClassroom: vi.fn().mockImplementation(async (_, _id, input) => ({
      ...mockClassrooms[0],
      ...input,
    })),
    deleteClassroom: vi.fn().mockImplementation(async () => {}),
    addClassroomMember: vi.fn().mockImplementation(async (_, classroomId, input) => ({
      id: 'member-new',
      classroomId,
      displayName: input.displayName,
      studentIdentifier: input.studentIdentifier || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    removeClassroomMember: vi.fn().mockImplementation(async () => {}),
  };
});

describe('ClassroomsView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header and classroom list', async () => {
    render(<ClassroomsView />);

    await waitFor(() => {
      expect(screen.getByText('Kelas 7A')).toBeDefined();
      expect(screen.getByText('Kelas 8B')).toBeDefined();
    });

    expect(screen.getAllByText('Kelas Saya').length).toBeGreaterThan(0);
    expect(screen.getByText('Matematika')).toBeDefined();
    expect(screen.getByText('IPA')).toBeDefined();
  });

  it('displays active badge on currently active classroom', async () => {
    render(<ClassroomsView />);

    await waitFor(() => {
      expect(screen.getByText('Aktif')).toBeDefined();
      expect(screen.getByText('Terpilih')).toBeDefined();
    });
  });

  it('opens modal to create new classroom', async () => {
    render(<ClassroomsView />);

    await waitFor(() => {
      expect(screen.getByText('Kelas 7A')).toBeDefined();
    });

    const createBtn = screen.getByRole('button', { name: /buat kelas baru/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: 'Buat Kelas Baru' })).toBeDefined();
    expect(screen.getByPlaceholderText('Contoh: Kelas 7A, X MIPA 1')).toBeDefined();
  });

  it('opens roster modal to view students', async () => {
    render(<ClassroomsView />);

    await waitFor(() => {
      expect(screen.getByText('Kelas 7A')).toBeDefined();
    });

    const rosterBtn = screen.getByRole('button', { name: /daftar murid \(1\)/i });
    fireEvent.click(rosterBtn);

    await waitFor(() => {
      expect(screen.getByText(/daftar murid: kelas 7a/i)).toBeDefined();
      expect(screen.getByText('Ahmad Dahlan')).toBeDefined();
    });
  });
});
