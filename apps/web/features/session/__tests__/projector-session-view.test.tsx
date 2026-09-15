import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectorSessionView } from '../projector-session-view';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connected: false,
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
  })),
}));

describe('ProjectorSessionView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});

