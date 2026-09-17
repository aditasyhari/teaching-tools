import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProjectorSessionView } from '../projector-session-view';

let mockSocketHandlers: Record<string, Function> = {};
const mockSocketInstance = {
  connected: true,
  on: vi.fn((event: string, handler: Function) => {
    mockSocketHandlers[event] = handler;
  }),
  off: vi.fn((event: string) => {
    delete mockSocketHandlers[event];
  }),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
};

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocketInstance),
}));

describe('ProjectorSessionView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocketHandlers = {};
  });

  it('renders demo projector mode with join code and high-contrast presentation header', () => {
    render(<ProjectorSessionView joinCode="DEMO99" isDemo={true} />);

    expect(screen.getByText('DEMO99')).toBeDefined();
    expect(screen.getByText(/Mode Proyektor Layar Kelas/i)).toBeDefined();
    expect(screen.getByText('Demo Preview')).toBeDefined();
    expect(screen.getByTitle('Layar Penuh (F11)')).toBeDefined();
    expect(screen.getByText(/Bergabung ke Sesi Kelas/i)).toBeDefined();
    expect(screen.getByText(/Sesi Kelas Siap Digunakan/i)).toBeDefined();
  });

  it('switches demo tabs between waiting, question, quiz, and poll previews', () => {
    render(<ProjectorSessionView joinCode="DEMO99" isDemo={true} />);

    // Default is waiting room
    expect(screen.getByText(/Bergabung ke Sesi Kelas/i)).toBeDefined();

    // Click Pertanyaan Tab
    const questionTab = screen.getByRole('button', { name: /2\. Tanya Guru Disorot/i });
    fireEvent.click(questionTab);
    expect(screen.getByText(/Pertanyaan Disorot/i)).toBeDefined();
    expect(
      screen.getByText(/Mengapa gaya gravitasi bumi lebih kuat dibandingkan gaya gravitasi bulan\?/i),
    ).toBeDefined();

    // Click Kuis Tab
    const quizTab = screen.getByRole('button', { name: /3\. Kuis Kelas/i });
    fireEvent.click(quizTab);
    expect(
      screen.getByText(/Planet manakah yang memiliki cincin paling mencolok di tata surya\?/i),
    ).toBeDefined();

    // Click Polling Tab
    const pollTab = screen.getByRole('button', { name: /4\. Polling Kelas/i });
    fireEvent.click(pollTab);
    expect(screen.getByText(/Polling Kelas Langsung/i)).toBeDefined();
    expect(
      screen.getByText(/Bagian materi manakah yang menurut Anda paling menantang\?/i),
    ).toBeDefined();
  });

  it('handles live question highlight, unhighlight, and answered events to clear projector screen', () => {
    render(<ProjectorSessionView joinCode="PROJ01" isDemo={false} />);

    // Trigger connect event so useSessionSocket marks connected
    act(() => {
      mockSocketHandlers['connect']?.();
    });

    // Simulate question:highlighted from teacher
    act(() => {
      mockSocketHandlers['question:highlighted']?.({
        question: {
          id: 'q-live-1',
          content: 'Bagaimana cara kerja fotosintesis?',
          authorName: 'Ahmad Fauzi',
          isAnonymous: false,
          createdAt: Date.now(),
        },
      });
    });

    expect(screen.getByText(/Pertanyaan Disorot/i)).toBeDefined();
    expect(screen.getByText(/Bagaimana cara kerja fotosintesis\?/i)).toBeDefined();
    expect(screen.getByText('Ahmad Fauzi')).toBeDefined();

    // Simulate question:unhighlighted -> should clear screen back to waiting
    act(() => {
      mockSocketHandlers['question:unhighlighted']?.({
        questionId: 'q-live-1',
      });
    });

    expect(screen.queryByText(/Bagaimana cara kerja fotosintesis\?/i)).toBeNull();

    // Highlight again, then mark answered -> should clear screen
    act(() => {
      mockSocketHandlers['question:highlighted']?.({
        question: {
          id: 'q-live-2',
          content: 'Kapan praktikum dimulai?',
          authorName: 'Anonim',
          isAnonymous: true,
          createdAt: Date.now(),
        },
      });
    });
    expect(screen.getByText(/Kapan praktikum dimulai\?/i)).toBeDefined();

    act(() => {
      mockSocketHandlers['question:answered']?.({
        questionId: 'q-live-2',
      });
    });
    expect(screen.queryByText(/Kapan praktikum dimulai\?/i)).toBeNull();
  });

  it('switches to Brainstorm, Exit Ticket, and Speaker spotlight demo tabs', () => {
    render(<ProjectorSessionView joinCode="DEMO99" isDemo={true} />);

    // Click Brainstorm Tab
    const brainstormTab = screen.getByRole('button', { name: /5\. Papan Ide/i });
    fireEvent.click(brainstormTab);
    expect(screen.getByText(/Papan Ide Kelas/i)).toBeDefined();
    expect(
      screen.getByText(/Apa saja ide praktis untuk menghemat energi listrik/i),
    ).toBeDefined();
    expect(
      screen.getByText(/“Matikan lampu dan proyektor saat jam istirahat/i),
    ).toBeDefined();

    // Click Exit Ticket Tab
    const exitTicketTab = screen.getByRole('button', { name: /6\. Tiket Keluar/i });
    fireEvent.click(exitTicketTab);
    expect(screen.getByText(/Tiket Keluar Kelas/i)).toBeDefined();
    expect(screen.getByText(/Refleksi Akhir Pembelajaran/i)).toBeDefined();
    expect(screen.getByText(/Progres Pengumpulan Refleksi/i)).toBeDefined();

    // Click Speaker Spotlight Tab
    const speakerTab = screen.getByRole('button', { name: /7\. Sorot Bicara/i });
    fireEvent.click(speakerTab);
    expect(screen.getByText(/Giliran Berbicara Sekarang/i)).toBeDefined();
    expect(screen.getByText('Budi Santoso (7A)')).toBeDefined();
  });

  it('handles live brainstorm:state, exit-ticket:state, and hand:speaking events', () => {
    render(<ProjectorSessionView joinCode="PROJ01" isDemo={false} />);

    act(() => {
      mockSocketHandlers['connect']?.();
    });

    // 1. Live Brainstorm event
    act(() => {
      mockSocketHandlers['brainstorm:state']?.({
        activity: {
          id: 'b-live-1',
          sessionId: 'PROJ01',
          prompt: 'Tuliskan ide judul proposal sains',
          status: 'OPEN',
          settings: {
            isAnonymous: false,
            ideasVisibleToParticipants: true,
            submissionMode: 'MULTIPLE_PER_PARTICIPANT',
            maxIdeasPerParticipant: 5,
          },
          createdAt: Date.now(),
        },
        ideas: [
          {
            id: 'idea-101',
            sessionId: 'PROJ01',
            activityId: 'b-live-1',
            participantId: 'p-1',
            authorName: 'Rina Kusuma',
            isAnonymous: false,
            content: 'Pembuatan bioplastik dari kulit singkong',
            status: 'VISIBLE',
            createdAt: Date.now(),
          },
        ],
        visibleCount: 1,
        hiddenCount: 0,
        totalCount: 1,
      });
    });

    expect(screen.getByText('Tuliskan ide judul proposal sains')).toBeDefined();
    expect(screen.getByText(/“Pembuatan bioplastik dari kulit singkong”/i)).toBeDefined();
    expect(screen.getByText('Rina Kusuma')).toBeDefined();

    // 2. Live Raise Hand speaking turn spotlight
    act(() => {
      mockSocketHandlers['hand:speaking']?.({
        handId: 'h-1',
        participantId: 'p-1',
        displayName: 'Rina Kusuma (7B)',
      });
    });

    expect(screen.getByText(/Giliran Berbicara Sekarang/i)).toBeDefined();
    expect(screen.getByText('Rina Kusuma (7B)')).toBeDefined();

    // Lower hand clears spotlight
    act(() => {
      mockSocketHandlers['hand:lowered']?.({
        handId: 'h-1',
        participantId: 'p-1',
      });
    });

    expect(screen.queryByText('Rina Kusuma (7B)')).toBeNull();
  });
});

