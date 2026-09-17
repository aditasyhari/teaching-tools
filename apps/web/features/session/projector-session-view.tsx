'use client';

import React, { useState, useEffect } from 'react';
import {
  Tv,
  Clock,
  Users,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Radio,
  Mic,
} from 'lucide-react';
import { Button } from '@walikelas/ui';
import type {
  ProjectorSessionSnapshot,
  SharedQuestionItem,
  ParticipantQuestionData,
  TeacherLivePollSnapshot,
  BrainstormActivity,
  BrainstormIdea,
  TeacherBrainstormSnapshot,
  ExitTicketActivity,
  TeacherExitTicketSnapshot,
  TeacherRaiseHandSnapshot,
} from '@walikelas/types';
import { useSessionSocket } from './use-session-socket';
import { useClassroomTimer, formatTime } from '../classroom-timer';
import { ProjectorFeaturedQuestion } from '../question-box';
import { ProjectorBrainstormView } from '../brainstorm';
import { ProjectorExitTicketView } from '../exit-ticket';

interface ProjectorSessionViewProps {
  joinCode?: string;
  isDemo?: boolean;
}

export function ProjectorSessionView({
  joinCode = 'DEMO99',
  isDemo = false,
}: ProjectorSessionViewProps): React.JSX.Element {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [demoTab, setDemoTab] = useState<
    'WAITING' | 'QUESTION' | 'QUIZ' | 'POLL' | 'BRAINSTORM' | 'EXIT_TICKET' | 'SPEAKER'
  >('WAITING');

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
    isProjector: true,
    joinCode: isDemo ? undefined : joinCode,
  });

  const snapshot = liveSnapshot as ProjectorSessionSnapshot | null;

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
  // 1. Live Quiz
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

  // 2. Live Poll
  const [pollState, setPollState] = useState<TeacherLivePollSnapshot | null>(null);

  // 3. Question Box (Featured Question)
  const [featuredQuestion, setFeaturedQuestion] = useState<SharedQuestionItem | null>(null);

  // 4. Brainstorm Board
  const [brainstormState, setBrainstormState] = useState<{
    activity: BrainstormActivity | null;
    ideas: BrainstormIdea[];
    totalCount: number;
  }>({
    activity: null,
    ideas: [],
    totalCount: 0,
  });

  // 5. Exit Ticket
  const [exitTicketState, setExitTicketState] = useState<{
    activity: ExitTicketActivity | null;
    responseCount: number;
    totalExpected: number;
    completionRate: number;
  }>({
    activity: null,
    responseCount: 0,
    totalExpected: 0,
    completionRate: 0,
  });

  // 6. Raise Hand Speaking Spotlight
  const [speakingStudent, setSpeakingStudent] = useState<{
    displayName: string;
    participantId?: string;
  } | null>(null);

  useEffect(() => {
    if (!socket || isDemo) return;

    // --- Quiz events ---
    const onQuizState = (data: any) => {
      if (data && data.status === 'RUNNING' && data.currentQuestion) {
        setQuizState({
          isActive: true,
          question: data.currentQuestion,
          questionNumber: (data.currentQuestionIndex ?? 0) + 1,
          totalQuestions: data.totalQuestions || 1,
          deadline: data.deadline,
          answeredCount: data.answersCount || 0,
          isEnded: false,
        });
      }
    };

    const onQuizStarted = (data: any) => {
      setQuizState((prev) => ({
        ...prev,
        isActive: true,
        totalQuestions: data.totalQuestions || 1,
      }));
    };

    const onQuizQuestionStarted = (data: any) => {
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
    };

    const onQuizStatsUpdate = (data: any) => {
      setQuizState((prev) => ({
        ...prev,
        answeredCount: data.answeredCount || 0,
      }));
    };

    const onQuizQuestionEnded = () => {
      setQuizState((prev) => ({
        ...prev,
        isEnded: true,
      }));
    };

    const onQuizFinished = () => {
      setQuizState((prev) => ({
        ...prev,
        isActive: false,
      }));
    };

    // --- Poll events ---
    const onPollState = (data: TeacherLivePollSnapshot) => {
      setPollState(data);
    };

    const onPollStarted = (data: any) => {
      setPollState(data.poll);
    };

    const onPollClosed = () => {
      setPollState(null);
    };

    // --- Question Box events ---
    const onQuestionState = (data: any) => {
      if (data && 'highlightedQuestion' in data) {
        setFeaturedQuestion(data.highlightedQuestion || null);
      }
    };

    const onQuestionHighlighted = (data: any) => {
      setFeaturedQuestion(data.question);
    };

    const onQuestionUnhighlighted = (data: any) => {
      setFeaturedQuestion((prev) => (prev?.id === data.questionId ? null : prev));
    };

    const onQuestionAnswered = (data: any) => {
      setFeaturedQuestion((prev) => (prev?.id === data.questionId ? null : prev));
    };

    const onQuestionDismissed = (data: any) => {
      setFeaturedQuestion((prev) => (prev?.id === data.questionId ? null : prev));
    };

    // --- Brainstorm Board events ---
    const onBrainstormState = (data: TeacherBrainstormSnapshot) => {
      if (data) {
        setBrainstormState({
          activity: data.activity || null,
          ideas: data.ideas || [],
          totalCount: data.totalCount || 0,
        });
      }
    };

    const onBrainstormOpened = (data: any) => {
      setBrainstormState((prev) => ({
        ...prev,
        activity: prev.activity
          ? { ...prev.activity, status: 'OPEN', openedAt: data.openedAt }
          : null,
      }));
    };

    const onBrainstormPaused = (data: any) => {
      setBrainstormState((prev) => ({
        ...prev,
        activity: prev.activity
          ? { ...prev.activity, status: 'PAUSED', pausedAt: data.pausedAt }
          : null,
      }));
    };

    const onBrainstormClosed = () => {
      setBrainstormState((prev) => ({
        ...prev,
        activity: prev.activity ? { ...prev.activity, status: 'CLOSED' } : null,
      }));
    };

    const onBrainstormIdeaCreated = (data: any) => {
      if (data?.idea) {
        setBrainstormState((prev) => {
          if (prev.ideas.some((i) => i.id === data.idea.id)) return prev;
          return {
            ...prev,
            ideas: [data.idea, ...prev.ideas],
            totalCount: data.totalCount ?? prev.totalCount + 1,
          };
        });
      }
    };

    const onBrainstormIdeaHidden = (data: any) => {
      setBrainstormState((prev) => ({
        ...prev,
        ideas: prev.ideas.map((i) => (i.id === data.ideaId ? { ...i, status: 'HIDDEN' } : i)),
        totalCount: data.totalCount ?? prev.totalCount,
      }));
    };

    const onBrainstormIdeaRestored = (data: any) => {
      setBrainstormState((prev) => ({
        ...prev,
        ideas: prev.ideas.map((i) => (i.id === data.idea?.id ? { ...i, status: 'VISIBLE' } : i)),
        totalCount: data.totalCount ?? prev.totalCount,
      }));
    };

    // --- Exit Ticket events ---
    const onExitTicketState = (data: TeacherExitTicketSnapshot) => {
      if (data) {
        setExitTicketState({
          activity: data.activity || null,
          responseCount: data.responseCount || 0,
          totalExpected: data.totalExpected || 0,
          completionRate: data.completionRate || 0,
        });
      }
    };

    const onExitTicketOpened = (data: any) => {
      setExitTicketState((prev) => ({
        ...prev,
        activity: prev.activity
          ? { ...prev.activity, status: 'OPEN', openedAt: data.openedAt }
          : null,
      }));
    };

    const onExitTicketClosed = () => {
      setExitTicketState((prev) => ({
        ...prev,
        activity: prev.activity ? { ...prev.activity, status: 'CLOSED' } : null,
      }));
    };

    const onExitTicketResultsUpdated = (data: any) => {
      setExitTicketState((prev) => ({
        ...prev,
        responseCount: data.responseCount ?? prev.responseCount,
        completionRate: data.completionRate ?? prev.completionRate,
      }));
    };

    // --- Raise Hand Speaking Spotlight events ---
    const onHandState = (data: TeacherRaiseHandSnapshot) => {
      if (data?.currentSpeaker) {
        setSpeakingStudent({
          displayName: data.currentSpeaker.displayName,
          participantId: data.currentSpeaker.participantId,
        });
      } else {
        setSpeakingStudent(null);
      }
    };

    const onHandSpeaking = (data: any) => {
      if (data?.displayName) {
        setSpeakingStudent({
          displayName: data.displayName,
          participantId: data.participantId,
        });
      }
    };

    const onHandLowered = (data: any) => {
      setSpeakingStudent((prev) => (prev?.participantId === data.participantId ? null : prev));
    };

    const onHandAllLowered = () => {
      setSpeakingStudent(null);
    };

    // Register all listeners
    socket.on('quiz:state', onQuizState);
    socket.on('quiz:started', onQuizStarted);
    socket.on('quiz:question-started', onQuizQuestionStarted);
    socket.on('quiz:stats-update', onQuizStatsUpdate);
    socket.on('quiz:question-ended', onQuizQuestionEnded);
    socket.on('quiz:finished', onQuizFinished);

    socket.on('poll:state', onPollState);
    socket.on('poll:started', onPollStarted);
    socket.on('poll:closed', onPollClosed);

    socket.on('question:state', onQuestionState);
    socket.on('question:highlighted', onQuestionHighlighted);
    socket.on('question:unhighlighted', onQuestionUnhighlighted);
    socket.on('question:answered', onQuestionAnswered);
    socket.on('question:dismissed', onQuestionDismissed);

    socket.on('brainstorm:state', onBrainstormState);
    socket.on('brainstorm:opened', onBrainstormOpened);
    socket.on('brainstorm:paused', onBrainstormPaused);
    socket.on('brainstorm:closed', onBrainstormClosed);
    socket.on('brainstorm:idea-created', onBrainstormIdeaCreated);
    socket.on('brainstorm:idea-hidden', onBrainstormIdeaHidden);
    socket.on('brainstorm:idea-restored', onBrainstormIdeaRestored);

    socket.on('exit-ticket:state', onExitTicketState);
    socket.on('exit-ticket:opened', onExitTicketOpened);
    socket.on('exit-ticket:closed', onExitTicketClosed);
    socket.on('exit-ticket:results-updated', onExitTicketResultsUpdated);

    socket.on('hand:state', onHandState);
    socket.on('hand:speaking', onHandSpeaking);
    socket.on('hand:lowered', onHandLowered);
    socket.on('hand:all-lowered', onHandAllLowered);

    return () => {
      socket.off('quiz:state', onQuizState);
      socket.off('quiz:started', onQuizStarted);
      socket.off('quiz:question-started', onQuizQuestionStarted);
      socket.off('quiz:stats-update', onQuizStatsUpdate);
      socket.off('quiz:question-ended', onQuizQuestionEnded);
      socket.off('quiz:finished', onQuizFinished);

      socket.off('poll:state', onPollState);
      socket.off('poll:started', onPollStarted);
      socket.off('poll:closed', onPollClosed);

      socket.off('question:state', onQuestionState);
      socket.off('question:highlighted', onQuestionHighlighted);
      socket.off('question:unhighlighted', onQuestionUnhighlighted);
      socket.off('question:answered', onQuestionAnswered);
      socket.off('question:dismissed', onQuestionDismissed);

      socket.off('brainstorm:state', onBrainstormState);
      socket.off('brainstorm:opened', onBrainstormOpened);
      socket.off('brainstorm:paused', onBrainstormPaused);
      socket.off('brainstorm:closed', onBrainstormClosed);
      socket.off('brainstorm:idea-created', onBrainstormIdeaCreated);
      socket.off('brainstorm:idea-hidden', onBrainstormIdeaHidden);
      socket.off('brainstorm:idea-restored', onBrainstormIdeaRestored);

      socket.off('exit-ticket:state', onExitTicketState);
      socket.off('exit-ticket:opened', onExitTicketOpened);
      socket.off('exit-ticket:closed', onExitTicketClosed);
      socket.off('exit-ticket:results-updated', onExitTicketResultsUpdated);

      socket.off('hand:state', onHandState);
      socket.off('hand:speaking', onHandSpeaking);
      socket.off('hand:lowered', onHandLowered);
      socket.off('hand:all-lowered', onHandAllLowered);
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

  const demoBrainstormActivity: BrainstormActivity = {
    id: 'demo-bs-1',
    sessionId: 'demo-session',
    prompt: 'Apa saja ide praktis untuk menghemat energi listrik di lingkungan sekolah kita?',
    status: 'OPEN',
    settings: {
      isAnonymous: false,
      ideasVisibleToParticipants: true,
      submissionMode: 'MULTIPLE_PER_PARTICIPANT',
      maxIdeasPerParticipant: 5,
    },
    createdAt: Date.now() - 60000,
    openedAt: Date.now() - 50000,
  };

  const demoBrainstormIdeas: BrainstormIdea[] = [
    {
      id: 'idea-1',
      sessionId: 'demo-session',
      activityId: 'demo-bs-1',
      participantId: 'p-1',
      authorName: 'Ahmad Fauzi',
      isAnonymous: false,
      content: 'Matikan lampu dan proyektor saat jam istirahat atau kelas kosong.',
      status: 'VISIBLE',
      createdAt: Date.now() - 40000,
    },
    {
      id: 'idea-2',
      sessionId: 'demo-session',
      activityId: 'demo-bs-1',
      participantId: 'p-2',
      authorName: 'Nadia Putri',
      isAnonymous: false,
      content: 'Buka ventilasi dan tirai jendela pada pagi hari untuk memaksimalkan cahaya alami.',
      status: 'VISIBLE',
      createdAt: Date.now() - 32000,
    },
    {
      id: 'idea-3',
      sessionId: 'demo-session',
      activityId: 'demo-bs-1',
      participantId: 'p-3',
      authorName: 'Rian Hidayat',
      isAnonymous: false,
      content: 'Atur suhu AC kelas konsisten di 24°C agar kompresor tidak bekerja terlalu berat.',
      status: 'VISIBLE',
      createdAt: Date.now() - 20000,
    },
    {
      id: 'idea-4',
      sessionId: 'demo-session',
      activityId: 'demo-bs-1',
      participantId: 'p-4',
      authorName: 'Anonim',
      isAnonymous: true,
      content: 'Tunjuk petugas piket energi harian dari siswa untuk cek saklar sebelum pulang.',
      status: 'VISIBLE',
      createdAt: Date.now() - 10000,
    },
  ];

  const demoExitTicketActivity: ExitTicketActivity = {
    id: 'demo-et-1',
    sessionId: 'demo-session',
    title: 'Refleksi Akhir Pembelajaran — Gaya & Gravitasi',
    status: 'OPEN',
    isAnonymous: false,
    questions: [],
    createdAt: Date.now() - 120000,
    openedAt: Date.now() - 100000,
  };

  const activeTitle = snapshot?.title || (isDemo ? 'Kelas IPA 7A — Gravitasi Bumi' : 'Sesi Kelas');
  const activeCode = isDemo ? 'DEMO99' : (snapshot?.joinCode || joinCode);
  const participantCount = snapshot?.participantCount || (isDemo ? 32 : 0);

  // Determine stage conditions
  const isBrainstormActive =
    brainstormState.activity &&
    (brainstormState.activity.status === 'OPEN' || brainstormState.activity.status === 'PAUSED');

  const isExitTicketActive =
    exitTicketState.activity && exitTicketState.activity.status === 'OPEN';

  const isSpeakerSpotlightDemo = isDemo && demoTab === 'SPEAKER';
  const effectiveSpeaker = isSpeakerSpotlightDemo
    ? { displayName: 'Budi Santoso (7A)' }
    : speakingStudent;

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
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-2">
          <span className="text-slate-400 font-medium">
            Simulasi Tampilan Proyektor: Klik tab untuk menguji tampilan tiap tool:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setDemoTab('WAITING')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                demoTab === 'WAITING' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
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
                demoTab === 'POLL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              4. Polling Kelas
            </button>
            <button
              onClick={() => setDemoTab('BRAINSTORM')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                demoTab === 'BRAINSTORM' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              5. Papan Ide (Sticky Notes)
            </button>
            <button
              onClick={() => setDemoTab('EXIT_TICKET')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                demoTab === 'EXIT_TICKET' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              6. Tiket Keluar
            </button>
            <button
              onClick={() => setDemoTab('SPEAKER')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                demoTab === 'SPEAKER' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              7. Sorot Bicara
            </button>
          </div>
        </div>
      )}

      {/* Main Presentation Stage */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 max-w-7xl 2xl:max-w-7xl 4k:max-w-[120rem] w-full mx-auto relative">
        {/* Stage 1: Highlighted Question from Question Box */}
        {(featuredQuestion || (isDemo && demoTab === 'QUESTION')) && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-300">
            <ProjectorFeaturedQuestion
              question={isDemo && demoTab === 'QUESTION' ? demoFeaturedQuestion : featuredQuestion}
            />
          </div>
        )}

        {/* Stage 2: Live Quiz Question */}
        {!featuredQuestion && (quizState.isActive || (isDemo && demoTab === 'QUIZ')) && (
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
        {!featuredQuestion &&
          !quizState.isActive &&
          (pollState || (isDemo && demoTab === 'POLL')) && (
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
                      <span className="font-mono text-blue-400">
                        {opt.percentage || 0}% ({opt.count || 0})
                      </span>
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

        {/* Stage 4: Brainstorm Board (Papan Ide Sticky Notes) */}
        {!featuredQuestion &&
          !quizState.isActive &&
          !pollState &&
          (isBrainstormActive || (isDemo && demoTab === 'BRAINSTORM')) && (
            <div className="w-full animate-in fade-in duration-300">
              <ProjectorBrainstormView
                activity={isDemo && demoTab === 'BRAINSTORM' ? demoBrainstormActivity : brainstormState.activity}
                ideas={isDemo && demoTab === 'BRAINSTORM' ? demoBrainstormIdeas : brainstormState.ideas}
                totalIdeasCount={isDemo && demoTab === 'BRAINSTORM' ? demoBrainstormIdeas.length : brainstormState.totalCount}
              />
            </div>
          )}

        {/* Stage 5: Exit Ticket (Refleksi Kelas) */}
        {!featuredQuestion &&
          !quizState.isActive &&
          !pollState &&
          !isBrainstormActive &&
          (isExitTicketActive || (isDemo && demoTab === 'EXIT_TICKET')) && (
            <div className="w-full animate-in fade-in duration-300">
              <ProjectorExitTicketView
                activity={isDemo && demoTab === 'EXIT_TICKET' ? demoExitTicketActivity : exitTicketState.activity}
                responseCount={isDemo && demoTab === 'EXIT_TICKET' ? 24 : exitTicketState.responseCount}
                totalExpected={isDemo && demoTab === 'EXIT_TICKET' ? 32 : exitTicketState.totalExpected}
                completionRate={isDemo && demoTab === 'EXIT_TICKET' ? 75 : exitTicketState.completionRate}
              />
            </div>
          )}

        {/* Stage 6: Default Waiting / Welcoming Screen */}
        {!featuredQuestion &&
          !quizState.isActive &&
          !pollState &&
          !isBrainstormActive &&
          !isExitTicketActive &&
          (!isDemo || demoTab === 'WAITING' || demoTab === 'SPEAKER') && (
            <div className="text-center space-y-8 max-w-3xl animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-sm font-bold">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
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

        {/* Global Speaker Spotlight Banner (Raise Hand) */}
        {effectiveSpeaker && (
          <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-lg w-full px-4">
            <div className="flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-indigo-950/95 border-2 border-indigo-400/60 shadow-2xl shadow-indigo-950/90 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center animate-pulse shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase font-extrabold tracking-widest text-indigo-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Giliran Berbicara Sekarang
                </div>
                <div className="text-lg md:text-xl font-black text-white truncate">
                  {effectiveSpeaker.displayName}
                </div>
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
