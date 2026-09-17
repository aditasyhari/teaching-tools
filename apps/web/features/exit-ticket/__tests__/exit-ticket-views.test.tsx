import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParticipantExitTicketView } from '../participant-exit-ticket-view';
import { TeacherExitTicketPanel } from '../teacher-exit-ticket-panel';
import { ProjectorExitTicketView } from '../projector-exit-ticket-view';

describe('Exit Ticket Views', () => {
  it('renders participant empty state when no exit ticket is active', () => {
    render(
      <ParticipantExitTicketView
        activity={null}
        hasSubmitted={false}
        onSubmit={vi.fn()}
        isSubmitting={false}
        cooldown={0}
        error={null}
        successMessage={null}
        onClearError={vi.fn()}
        onClearSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText(/Belum Ada Exit Ticket Aktif/i)).toBeDefined();
  });

  it('renders participant exit ticket form, selects answers and submits', () => {
    const onSubmit = vi.fn();
    render(
      <ParticipantExitTicketView
        activity={{
          id: 'et-1',
          title: 'Refleksi Fisika Termodinamika',
          status: 'OPEN',
          isAnonymous: true,
          questions: [
            {
              id: 'q-scale',
              order: 1,
              type: 'SCALE',
              prompt: 'Tingkat pemahaman materi hari ini',
              required: true,
              scale: { min: 1, max: 5, minLabel: 'Kurang', maxLabel: 'Sangat' },
            },
            {
              id: 'q-text',
              order: 2,
              type: 'SHORT_TEXT',
              prompt: 'Apa kesimpulan yang kamu peroleh?',
              required: false,
            },
          ],
        }}
        hasSubmitted={false}
        onSubmit={onSubmit}
        isSubmitting={false}
        cooldown={0}
        error={null}
        successMessage={null}
        onClearError={vi.fn()}
        onClearSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText('Refleksi Fisika Termodinamika')).toBeDefined();
    expect(screen.getByText('Tingkat pemahaman materi hari ini')).toBeDefined();

    // Click rating star 5
    const star5 = screen.getByRole('button', { name: '5' });
    fireEvent.click(star5);

    // Type text response
    const textarea = screen.getByPlaceholderText(/Tuliskan jawaban Anda di sini/i);
    fireEvent.change(textarea, { target: { value: 'Hukum termodinamika menjelaskan perpindahan kalor' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Kirimkan Refleksi/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith([
      { questionId: 'q-scale', value: 5 },
      { questionId: 'q-text', value: 'Hukum termodinamika menjelaskan perpindahan kalor' },
    ]);
  });

  it('renders teacher exit ticket panel dialog with summary aggregates', () => {
    render(
      <TeacherExitTicketPanel
        isOpen={true}
        onClose={vi.fn()}
        activity={{
          id: 'et-1',
          sessionId: 's-1',
          title: 'Refleksi Akhir Pertemuan',
          status: 'OPEN',
          isAnonymous: true,
          questions: [
            {
              id: 'q-1',
              order: 1,
              type: 'SCALE',
              prompt: 'Tingkat pemahaman materi:',
              required: true,
              scale: { min: 1, max: 5 },
            },
          ],
          createdAt: Date.now(),
        }}
        aggregates={{
          totalExpected: 10,
          responseCount: 8,
          completionRate: 80,
          questionAggregates: {
            'q-1': {
              questionId: 'q-1',
              type: 'SCALE',
              totalResponses: 8,
              scaleAverage: 4.5,
              scaleDistribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 5 },
            },
          },
        }}
        responseCount={8}
        totalExpected={10}
        completionRate={80}
        onCreateActivity={vi.fn()}
        onOpenActivity={vi.fn()}
        onCloseActivity={vi.fn()}
      />,
    );

    expect(screen.getByText(/Exit Ticket \/ Refleksi Akhir/i)).toBeDefined();
    expect(screen.getByText('Refleksi Akhir Pertemuan')).toBeDefined();
    expect(screen.getByText(/Respon Masuk: 8 \/ 10 peserta/i)).toBeDefined();
    expect(screen.getByText(/80% selesai/i)).toBeDefined();
    expect(screen.getByText('4.5')).toBeDefined();
  });

  it('renders ProjectorExitTicketView with progress meter correctly', () => {
    render(
      <ProjectorExitTicketView
        activity={{
          id: 'et-1',
          sessionId: 's-1',
          title: 'Refleksi Akhir Kelas Matematika',
          status: 'OPEN',
          isAnonymous: false,
          questions: [],
          createdAt: Date.now(),
        }}
        responseCount={20}
        totalExpected={25}
        completionRate={80}
      />
    );

    expect(screen.getByText('Refleksi Akhir Kelas Matematika')).toBeDefined();
    expect(screen.getByText(/Tiket Keluar Kelas/i)).toBeDefined();
    expect(screen.getByText(/Pengisian Sedang Berlangsung/i)).toBeDefined();
    expect(screen.getByText('20')).toBeDefined();
    expect(screen.getByText('(80%)')).toBeDefined();
  });
});

