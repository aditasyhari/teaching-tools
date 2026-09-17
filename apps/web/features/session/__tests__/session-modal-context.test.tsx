import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionModalProvider, useSessionModal } from '../session-modal-context';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../../../lib/auth-context', () => ({
  useAuth: () => ({
    classrooms: [
      { id: 'c-1', name: 'Kelas 7A', grade: '7' },
      { id: 'c-2', name: 'Kelas 8B', grade: '8' },
    ],
    activeClassroom: { id: 'c-1', name: 'Kelas 7A' },
  }),
}));

const mockCreateSession = vi.fn();
vi.mock('@walikelas/api-client', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    createSession: (...args: any[]) => mockCreateSession(...args),
  };
});

function TestTriggerComponent() {
  const { openCreateModal, isCreateOpen } = useSessionModal();
  return (
    <div>
      <span data-testid="is-open">{isCreateOpen ? 'open' : 'closed'}</span>
      <button
        type="button"
        onClick={() => openCreateModal({ defaultTitle: 'Kuis IPA 1' })}
      >
        Trigger Modal
      </button>
    </div>
  );
}

describe('SessionModalContext & Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when useSessionModal is called outside provider', () => {
    expect(() => render(<TestTriggerComponent />)).toThrow(
      'useSessionModal must be used within a SessionModalProvider'
    );
  });

  it('opens dialog with prefilled title and allows submitting session', async () => {
    mockCreateSession.mockResolvedValueOnce({
      id: 'sess-123',
      joinCode: 'WK9999',
      title: 'Kuis IPA 1',
    });

    render(
      <SessionModalProvider>
        <TestTriggerComponent />
      </SessionModalProvider>
    );

    expect(screen.getByTestId('is-open').textContent).toBe('closed');

    // Click trigger to open modal
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Modal' }));
    expect(screen.getByTestId('is-open').textContent).toBe('open');

    // Verify modal title & form inputs
    expect(screen.getByText('Buat Sesi Kelas Baru')).toBeDefined();
    const titleInput = screen.getByPlaceholderText(/Kuis Bab 3 Biologi/i) as HTMLInputElement;
    expect(titleInput.value).toBe('Kuis IPA 1');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Mulai Sesi Sekarang/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/teacher/sessions/sess-123');
    });

    // Modal closes after creation
    expect(screen.getByTestId('is-open').textContent).toBe('closed');
  });

  it('displays error message when creation fails', async () => {
    mockCreateSession.mockRejectedValueOnce(new Error('Sesi aktif sudah ada'));

    render(
      <SessionModalProvider>
        <TestTriggerComponent />
      </SessionModalProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Modal' }));
    const submitBtn = screen.getByRole('button', { name: /Mulai Sesi Sekarang/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Sesi aktif sudah ada')).toBeDefined();
    });
  });

  it('closes modal when Batal button is clicked', () => {
    render(
      <SessionModalProvider>
        <TestTriggerComponent />
      </SessionModalProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Modal' }));
    expect(screen.getByTestId('is-open').textContent).toBe('open');

    const cancelBtn = screen.getByRole('button', { name: 'Batal' });
    fireEvent.click(cancelBtn);

    expect(screen.getByTestId('is-open').textContent).toBe('closed');
  });
});
