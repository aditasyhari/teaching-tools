import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParticipantBrainstormView } from '../participant-brainstorm-view';
import { TeacherBrainstormPanel } from '../teacher-brainstorm-panel';
import { ProjectorBrainstormView } from '../projector-brainstorm-view';

describe('Brainstorm Views', () => {
  it('renders participant empty state when no activity is active', () => {
    render(
      <ParticipantBrainstormView
        activity={null}
        myIdeas={[]}
        sharedIdeas={[]}
        canSubmit={true}
        totalIdeasCount={0}
        onSubmitIdea={vi.fn()}
        isSubmitting={false}
        cooldown={0}
        error={null}
        successMessage={null}
        onClearError={vi.fn()}
        onClearSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText(/Belum Ada Papan Ide Aktif/i)).toBeDefined();
  });

  it('renders active participant brainstorm board and submits idea', () => {
    const onSubmitIdea = vi.fn();
    render(
      <ParticipantBrainstormView
        activity={{
          id: 'b-1',
          prompt: 'Ide topik penelitian biologi',
          status: 'OPEN',
          settings: {
            isAnonymous: true,
            ideasVisibleToParticipants: true,
            submissionMode: 'MULTIPLE_PER_PARTICIPANT',
            maxIdeasPerParticipant: 5,
          },
        }}
        myIdeas={[]}
        sharedIdeas={[]}
        canSubmit={true}
        totalIdeasCount={0}
        onSubmitIdea={onSubmitIdea}
        isSubmitting={false}
        cooldown={0}
        error={null}
        successMessage={null}
        onClearError={vi.fn()}
        onClearSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText('Ide topik penelitian biologi')).toBeDefined();
    expect(screen.getByText(/Menerima Ide/i)).toBeDefined();

    const textarea = screen.getByPlaceholderText(/Ketik ide singkat Anda di sini/i);
    fireEvent.change(textarea, { target: { value: 'Pengaruh cahaya pada pertumbuhan alga' } });

    const submitBtn = screen.getByRole('button', { name: /Kirim Ide/i });
    fireEvent.click(submitBtn);

    expect(onSubmitIdea).toHaveBeenCalledWith('Pengaruh cahaya pada pertumbuhan alga');
  });

  it('renders teacher brainstorm panel dialog with moderation controls', () => {
    const onHideIdea = vi.fn();
    render(
      <TeacherBrainstormPanel
        isOpen={true}
        onClose={vi.fn()}
        activity={{
          id: 'b-1',
          sessionId: 's-1',
          prompt: 'Pemantik Diskusi Hari Ini',
          status: 'OPEN',
          settings: {
            isAnonymous: false,
            ideasVisibleToParticipants: true,
            submissionMode: 'MULTIPLE_PER_PARTICIPANT',
            maxIdeasPerParticipant: 5,
          },
          createdAt: Date.now(),
        }}
        ideas={[
          {
            id: 'idea-1',
            sessionId: 's-1',
            activityId: 'b-1',
            participantId: 'p-1',
            authorName: 'Siti Aminah',
            isAnonymous: false,
            content: 'Gunakan panel surya di atap sekolah',
            status: 'VISIBLE',
            createdAt: Date.now(),
          },
        ]}
        visibleCount={1}
        hiddenCount={0}
        totalCount={1}
        onCreateActivity={vi.fn()}
        onOpenActivity={vi.fn()}
        onPauseActivity={vi.fn()}
        onCloseActivity={vi.fn()}
        onHideIdea={onHideIdea}
        onRestoreIdea={vi.fn()}
      />,
    );

    expect(screen.getByText(/Papan Ide Kolaboratif/i)).toBeDefined();
    expect(screen.getByText('Pemantik Diskusi Hari Ini')).toBeDefined();
    expect(screen.getByText('Gunakan panel surya di atap sekolah')).toBeDefined();

    const hideBtn = screen.getByRole('button', { name: /^Sembunyikan$/i });
    fireEvent.click(hideBtn);
    expect(onHideIdea).toHaveBeenCalledWith('idea-1');
  });

  it('renders ProjectorBrainstormView empty state and sticky note grid correctly', () => {
    const { rerender } = render(
      <ProjectorBrainstormView
        activity={{
          id: 'b-1',
          sessionId: 's-1',
          prompt: 'Pertanyaan Brainstorming Proyektor',
          status: 'OPEN',
          settings: {
            isAnonymous: false,
            ideasVisibleToParticipants: true,
            submissionMode: 'MULTIPLE_PER_PARTICIPANT',
            maxIdeasPerParticipant: 5,
          },
          createdAt: Date.now(),
        }}
        ideas={[]}
        totalIdeasCount={0}
      />,
    );

    expect(screen.getByText('Pertanyaan Brainstorming Proyektor')).toBeDefined();
    expect(screen.getByText(/Belum Ada Ide yang Dikirim/i)).toBeDefined();

    rerender(
      <ProjectorBrainstormView
        activity={{
          id: 'b-1',
          sessionId: 's-1',
          prompt: 'Pertanyaan Brainstorming Proyektor',
          status: 'OPEN',
          settings: {
            isAnonymous: false,
            ideasVisibleToParticipants: true,
            submissionMode: 'MULTIPLE_PER_PARTICIPANT',
            maxIdeasPerParticipant: 5,
          },
          createdAt: Date.now(),
        }}
        ideas={[
          {
            id: 'idea-1',
            sessionId: 's-1',
            activityId: 'b-1',
            participantId: 'p-1',
            authorName: 'Budi Santoso',
            isAnonymous: false,
            content: 'Ide ramah lingkungan dari Budi',
            status: 'VISIBLE',
            createdAt: Date.now(),
          },
          {
            id: 'idea-2',
            sessionId: 's-1',
            activityId: 'b-1',
            participantId: 'p-2',
            authorName: 'Anonim',
            isAnonymous: true,
            content: 'Ide rahasia tanpa nama',
            status: 'VISIBLE',
            createdAt: Date.now(),
          },
        ]}
        totalIdeasCount={2}
      />,
    );

    expect(screen.getByText('“Ide ramah lingkungan dari Budi”')).toBeDefined();
    expect(screen.getByText('Budi Santoso')).toBeDefined();
    expect(screen.getByText('“Ide rahasia tanpa nama”')).toBeDefined();
    expect(screen.getByText('Anonim')).toBeDefined();
    expect(screen.getByText(/2 ide terkumpul/i)).toBeDefined();
  });
});

