'use client';

import React, { useState, useEffect } from 'react';
import {
  Tv,
  Clock,
  Users,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@walikelas/ui';
import type {
  ParticipantSessionSnapshot,
  SharedQuestionItem,
  ParticipantQuestionData,
  TeacherLivePollSnapshot,
} from '@walikelas/types';
import { useSessionSocket } from './use-session-socket';
import { useClassroomTimer, formatTime } from '../classroom-timer';
import { ProjectorFeaturedQuestion } from '../question-box';

interface ProjectorSessionViewProps {
  joinCode?: string;
  isDemo?: boolean;
}

export function ProjectorSessionView({
  joinCode = 'DEMO99',
  isDemo = false,
}: ProjectorSessionViewProps): React.JSX.Element {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [demoTab, setDemoTab] = useState<'WAITING' | 'QUESTION' | 'QUIZ' | 'POLL'>('WAITING');

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Realtime socket connection for live projector
  const {
    snapshot: liveSnapshot,
    socket,
  } = useSessionSocket({
    isTeacher: false,
    joinCode: isDemo ? undefined : joinCode,
    displayName: 'Layar Proyektor',
  });

  const snapshot = liveSnapshot as ParticipantSessionSnapshot | null;

  // Realtime classroom timer
  const {
    remaining: ctRemaining,
    isRunning: ctIsRunning,
  } = useClassroomTimer({
    socket: isDemo ? null : socket,
    sessionId: snapshot?.id,
    isTeacher: false,
  });

  // State listeners for active tools
  const [quizState, setQuizState] = useState<{
    isActive: boolean;
    question: ParticipantQuestionData | null;
    questionNumber: number;
    totalQuestions: number;
    deadline: number | null;
    answeredCount: number;
    isEnded: boolean;
  }>({
    isActive: false,
    question: null,
    questionNumber: 1,
    totalQuestions: 1,
    deadline: null,
    answeredCount: 0,
    isEnded: false,
  });

  const [pollState, setPollState] = useState<TeacherLivePollSnapshot | null>(null);
  const [featuredQuestion, setFeaturedQuestion] = useState<SharedQuestionItem | null>(null);

  useEffect(() => {
    if (!socket || isDemo) return;

    // Quiz events
    socket.on('quiz:started', (data: any) => {
      setQuizState((prev) => ({
        ...prev,
        isActive: true,
        totalQuestions: data.totalQuestions || 1,
      }));
    });

    socket.on('quiz:question-started', (data: any) => {
      setQuizState((prev) => ({
        ...prev,
        isActive: true,
        question: data.question,
        questionNumber: data.questionNumber,
        totalQuestions: data.totalQuestions,
        deadline: data.deadline,
        answeredCount: 0,
        isEnded: false,
      }));
    });

    socket.on('quiz:stats-update', (data: any) => {
      setQuizState((prev) => ({
        ...prev,
        answeredCount: data.answeredCount || 0,
      }));
    });

    socket.on('quiz:question-ended', () => {
      setQuizState((prev) => ({
        ...prev,
        isEnded: true,
      }));
    });

    socket.on('quiz:finished', () => {
      setQuizState((prev) => ({
        ...prev,
        isActive: false,
      }));
    });

    // Poll events
    socket.on('poll:state', (data: TeacherLivePollSnapshot) => {
      setPollState(data);
    });

    socket.on('poll:started', (data: any) => {
      setPollState(data.poll);
    });

    socket.on('poll:closed', () => {
      setPollState(null);
    });

    // Question Box events
    socket.on('question:highlighted', (data: any) => {
      setFeaturedQuestion(data.question);
    });

    socket.on('question:dismissed', (data: any) => {
      setFeaturedQuestion((prev) => (prev?.id === data.questionId ? null : prev));
    });

    return () => {
      socket.off('quiz:started');
      socket.off('quiz:question-started');
      socket.off('quiz:stats-update');
      socket.off('quiz:question-ended');
      socket.off('quiz:finished');
      socket.off('poll:state');
      socket.off('poll:started');
      socket.off('poll:closed');
      socket.off('question:highlighted');
      socket.off('question:dismissed');
    };
  }, [socket, isDemo]);

  // Demo Mock Data
  const demoFeaturedQuestion: SharedQuestionItem = {
    id: 'demo-q1',
    content: 'Mengapa gaya gravitasi bumi lebih kuat dibandingkan gaya gravitasi bulan?',
    authorName: 'Siti Rahma',
    isAnonymous: false,
    createdAt: Date.now(),
  };

  const activeTitle = snapshot?.title || (isDemo ? 'Kelas IPA 7A — Gravitasi Bumi' : 'Sesi Kelas');
  const activeCode = isDemo ? 'DEMO99' : (snapshot?.title ? joinCode : joinCode);
  const participantCount = snapshot?.participantCount || (isDemo ? 32 : 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Presentation Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">{activeTitle}</h1>
              {isDemo && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Preview
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              WaliKelas Teaching Tools &bull; Mode Proyektor Layar Kelas
            </p>
          </div>
        </div>

        {/* Realtime Classroom Timer Banner if active */}
        {ctIsRunning && (
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 shadow-inner">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-amber-200">Timer:</span>
            <span className="text-xl font-mono font-black text-white">
              {formatTime(ctRemaining)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-300">
            <Users className="w-4 h-4 text-amber-400" />
            <span>{participantCount} Peserta</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (F11)'}
            className="text-slate-300 border-slate-700 hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Demo Controls (Only shown in Demo Mode) */}
      {isDemo && (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            Simulasi Tampilan Proyektor: Klik tab di bawah untuk melihat respons layar:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setDemoTab('WAITING')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                demoTab === 'WAITING' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              1. Layar Gabung
            </button>
            <button
              onClick={() => setDemoTab('QUESTION')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                demoTab === 'QUESTION' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2. Tanya Guru Disorot
            </button>
            <button
              onClick={() => setDemoTab('QUIZ')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                demoTab === 'QUIZ' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              3. Kuis Kelas
            </button>
            <button
              onClick={() => setDemoTab('POLL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                demoTab === 'POLL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              4. Polling Kelas
            </button>
          </div>
        </div>
      )}

      {/* Main Presentation Stage */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-12 max-w-6xl 2xl:max-w-7xl 4k:max-w-[120rem] w-full mx-auto">
        {/* Stage 1: Highlighted Question from Question Box */}
        {(featuredQuestion || (isDemo && demoTab === 'QUESTION')) && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-300">
            <ProjectorFeaturedQuestion
              question={isDemo && demoTab === 'QUESTION' ? demoFeaturedQuestion : featuredQuestion}
            />
          </div>
        )}

        {/* Stage 2: Live Quiz Question */}
        {(quizState.isActive || (isDemo && demoTab === 'QUIZ')) && (
          <div className="w-full max-w-4xl bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-sm">
                  Pertanyaan {quizState.questionNumber} / {quizState.totalQuestions}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  {quizState.answeredCount} siswa telah menjawab
                </span>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Clock className="w-4 h-4 motion-safe:animate-spin" />
                <span>Sedang Berlangsung</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-white leading-snug">
              {quizState.question?.questionText ||
                (isDemo && demoTab === 'QUIZ'
                  ? 'Planet manakah yang memiliki cincin paling mencolok di tata surya?'
                  : 'Pertanyaan kuis sedang ditampilkan...')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {(
                quizState.question?.options.map((o) => ({ id: o.id, text: o.optionText })) ||
                (isDemo && demoTab === 'QUIZ'
                  ? [
                      { id: '1', text: 'Mars' },
                      { id: '2', text: 'Saturnus' },
                      { id: '3', text: 'Jupiter' },
                      { id: '4', text: 'Neptunus' },
                    ]
                  : [])
              ).map((opt: { id: string; text: string }, idx: number) => {
                const letters = ['A', 'B', 'C', 'D', 'E'];
                return (
                  <div
                    key={opt.id}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-lg font-bold text-slate-100"
                  >
                    <span className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-black">
                      {letters[idx] || idx + 1}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 3: Live Poll */}
        {(pollState || (isDemo && demoTab === 'POLL')) && (
          <div className="w-full max-w-4xl bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-black text-sm">
                Polling Kelas Langsung
              </span>
              <span className="text-sm font-semibold text-slate-400">
                Respon Masuk Realtime
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white leading-snug">
              {pollState?.question ||
                (isDemo && demoTab === 'POLL'
                  ? 'Bagian materi manakah yang menurut Anda paling menantang?'
                  : 'Pertanyaan polling...')}
            </h2>

            <div className="space-y-4 pt-2">
              {(
                pollState?.options.map((o) => {
                  const count = pollState.distribution?.[o.id] || 0;
                  const pct = pollState.percentages?.[o.id] || 0;
                  return { id: o.id, text: o.optionText, count, percentage: pct };
                }) ||
                (isDemo && demoTab === 'POLL'
                  ? [
                      { id: '1', text: 'Hukum Keppler I & II', count: 18, percentage: 56 },
                      { id: '2', text: 'Gaya Gravitasi Newton', count: 10, percentage: 31 },
                      { id: '3', text: 'Kecepatan Orbit Satelit', count: 4, percentage: 13 },
                    ]
                  : [])
              ).map((opt: { id: string; text: string; count: number; percentage: number }) => (
                <div key={opt.id} className="space-y-1.5">
                  <div className="flex justify-between text-base font-bold text-slate-200">
                    <span>{opt.text}</span>
                    <span className="font-mono text-blue-400">{opt.percentage || 0}% ({opt.count || 0})</span>
                  </div>
                  <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${opt.percentage || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 4: Default Waiting / Welcoming Screen */}
        {!featuredQuestion &&
          !quizState.isActive &&
          !pollState &&
          (!isDemo || demoTab === 'WAITING') && (
            <div className="text-center space-y-8 max-w-3xl animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-sm font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Sesi Kelas Siap Digunakan</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Bergabung ke Sesi Kelas
                </h2>
                <p className="text-base md:text-xl text-slate-300 font-medium">
                  Buka browser di HP Anda dan masukkan kode sesi di bawah ini:
                </p>
              </div>

              {/* Massive Monospace Join Code Box */}
              <div className="p-8 md:p-12 rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl space-y-4">
                <p className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                  Kode Sesi Kelas
                </p>
                <div className="text-6xl sm:text-7xl md:text-8xl font-mono font-black tracking-widest text-white selection:bg-amber-500 selection:text-slate-950">
                  {activeCode}
                </div>
                <div className="pt-3 text-sm md:text-base text-slate-300 font-medium flex items-center justify-center gap-2">
                  <span>Alamat Web:</span>
                  <span className="font-mono font-bold text-amber-300 underline underline-offset-4">
                    tools.walikelas.id/join
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Koneksi Realtime Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{participantCount} Siswa Terhubung</span>
                </div>
              </div>
            </div>
          )}
      </main>

      {/* Presentation Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-900/40 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Layar Proyektor Terhubung &bull; Kode: {activeCode}</span>
        </div>
        <span>Tekan F11 untuk beralih mode layar penuh</span>
      </footer>
    </div>
  );
}

