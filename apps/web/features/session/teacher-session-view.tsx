'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Play,
  Square,
  Copy,
  Check,
  ArrowLeft,
  Wifi,
  WifiOff,
  AlertCircle,
  HelpCircle,
  Tv,
} from 'lucide-react';
import { Button, Badge, PageHeaderSection, EmptyState } from '@walikelas/ui';
import type { SessionSnapshot } from '@walikelas/types';
import { useSessionSocket } from './use-session-socket';
import { apiClient } from '../../lib/api';
import { fetchSession } from '@walikelas/api-client';
import { useLiveQuiz } from '../quiz/use-live-quiz';
import { TeacherLiveQuizHud } from '../quiz/teacher-live-quiz-hud';
import { QuizPickerModal } from '../quiz/quiz-picker-modal';
import { useLivePoll } from '../poll/use-live-poll';
import { TeacherLivePollHud } from '../poll/teacher-live-poll-hud';
import { PollPickerModal } from '../poll/poll-picker-modal';
import { BarChart2, Hand, Mic, Lightbulb, ClipboardCheck, Clock } from 'lucide-react';
import { useQuestionBox } from '../question-box/use-question-box';
import { TeacherQuestionBoxPanel } from '../question-box/teacher-question-box-panel';
import { useRaiseHand, TeacherRaiseHandPanel } from '../raise-hand';
import { useBrainstorm, TeacherBrainstormPanel } from '../brainstorm';
import { useExitTicket, TeacherExitTicketPanel } from '../exit-ticket';
import {
  useClassroomTimer,
  TeacherClassroomTimerPanel,
  formatTime as formatTimerTime,
} from '../classroom-timer';

interface TeacherSessionViewProps {
  sessionId: string;
}

export function TeacherSessionView({ sessionId }: TeacherSessionViewProps): React.JSX.Element {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showQuizPicker, setShowQuizPicker] = useState(false);
  const [hudDismissed, setHudDismissed] = useState(false);
  const [showPollPicker, setShowPollPicker] = useState(false);
  const [pollHudDismissed, setPollHudDismissed] = useState(false);
  const [showQuestionBox, setShowQuestionBox] = useState(false);
  const [showRaiseHand, setShowRaiseHand] = useState(false);
  const [showBrainstorm, setShowBrainstorm] = useState(false);
  const [showExitTicket, setShowExitTicket] = useState(false);
  const [showClassroomTimer, setShowClassroomTimer] = useState(false);
  const [initialData, setInitialData] = useState<SessionSnapshot | null>(null);

  // Initial HTTP fetch of session snapshot
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchSession(apiClient, sessionId);
        if (mounted) {
          setInitialData(data);
          setInitialLoading(false);
        }
      } catch {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // Realtime Socket.IO connection
  const {
    connectionStatus,
    snapshot: liveSnapshot,
    error: socketError,
    startSession,
    endSession,
    socket,
  } = useSessionSocket({
    isTeacher: true,
    sessionId,
  });

  // Live Quiz Engine Hook
  const {
    isQuizActive,
    isQuestionEnded,
    isQuizFinished,
    quizError,
    questionNumber,
    totalQuestions,
    questionDeadline,
    teacherSnapshot,
    distribution,
    answeredCount,
    totalParticipants,
    correctOptionId,
    leaderboard,
    startQuiz,
    endQuestion,
    nextQuestion,
    finishQuiz,
  } = useLiveQuiz({
    socket,
    sessionId,
    isTeacher: true,
  });

  // Live Poll & Feedback Engine Hook
  const {
    isPollActive,
    isPollClosed,
    pollError,
    teacherSnapshot: pollSnapshot,
    distribution: pollDistribution,
    percentages: pollPercentages,
    responseCount: pollResponseCount,
    totalParticipants: pollTotalParticipants,
    responseRate: pollResponseRate,
    startPoll,
    closePoll,
  } = useLivePoll({
    socket,
    sessionId,
    isTeacher: true,
  });

  // Question Box / Ask Teacher Hook
  const {
    questions: qbQuestions,
    highlightedQuestionId: qbHighlightedId,
    pendingCount: qbPendingCount,
    answeredCount: qbAnsweredCount,
    totalCount: qbTotalCount,
    highlightQuestion: qbHighlight,
    unhighlightQuestion: qbUnhighlight,
    answerQuestion: qbAnswer,
    dismissQuestion: qbDismiss,
  } = useQuestionBox({
    socket,
    sessionId,
    isTeacher: true,
  });

  // Raise Hand / Request to Speak Hook
  const {
    queue: rhQueue,
    currentSpeaker: rhCurrentSpeaker,
    raisedCount: rhRaisedCount,
    acknowledgeHand: rhAcknowledge,
    startSpeaking: rhStartSpeaking,
    lowerParticipantHand: rhLowerParticipant,
    lowerAllHands: rhLowerAll,
  } = useRaiseHand({
    socket,
    sessionId,
    isTeacher: true,
  });

  // Collaborative Brainstorm Board Hook
  const {
    activity: bsActivity,
    ideas: bsIdeas,
    visibleCount: bsVisibleCount,
    hiddenCount: bsHiddenCount,
    totalCount: bsTotalCount,
    createActivity: bsCreateActivity,
    openActivity: bsOpenActivity,
    pauseActivity: bsPauseActivity,
    closeActivity: bsCloseActivity,
    hideIdea: bsHideIdea,
    restoreIdea: bsRestoreIdea,
  } = useBrainstorm({
    socket,
    sessionId,
    isTeacher: true,
  });

  // Exit Ticket / Quick Reflection Hook
  const {
    activity: etActivity,
    aggregates: etAggregates,
    responseCount: etResponseCount,
    totalExpected: etTotalExpected,
    completionRate: etCompletionRate,
    createActivity: etCreateActivity,
    openActivity: etOpenActivity,
    closeActivity: etCloseActivity,
  } = useExitTicket({
    socket,
    sessionId,
    isTeacher: true,
  });

  // Classroom Timer Hook
  const {
    timer: ctTimer,
    duration: ctDuration,
    remaining: ctRemaining,
    progress: ctProgress,
    isRunning: ctIsRunning,
    isPaused: ctIsPaused,
    isCompleted: ctIsCompleted,
    isIdle: ctIsIdle,
    error: ctError,
    setTimer: ctSetTimer,
    startTimer: ctStartTimer,
    pauseTimer: ctPauseTimer,
    resumeTimer: ctResumeTimer,
    resetTimer: ctResetTimer,
    clearError: ctClearError,
  } = useClassroomTimer({
    socket,
    sessionId,
    isTeacher: true,
  });

  const session = (liveSnapshot as SessionSnapshot) || initialData;

  const handleCopyCode = () => {
    if (!session?.joinCode) return;
    navigator.clipboard.writeText(session.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!session?.joinCode) return;
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://tools.walikelas.id';
    navigator.clipboard.writeText(`${origin}/join/${session.joinCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleConfirmEnd = () => {
    endSession();
    setShowConfirmEnd(false);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Memuat sesi kelas...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <EmptyState
          title="Sesi Tidak Ditemukan"
          description="Sesi kelas yang Anda tuju tidak ditemukan atau Anda tidak memiliki izin akses."
          action={
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/teacher/sessions')}
            >
              Kembali ke Daftar Sesi
            </Button>
          }
        />
      </div>
    );
  }

  const isWaiting = session.status === 'WAITING';
  const isActive = session.status === 'ACTIVE';
  const isEnded = session.status === 'ENDED';

  const participants = session.participants || [];
  const onlineCount = session.participantCount || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Navigation */}
      <PageHeaderSection
        title={session.title}
        description={`Sesi ID: ${session.id}`}
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Sesi Kelas', href: '/teacher/sessions' },
          { label: session.title, current: true },
        ]}
        actions={
          <div className="flex items-center gap-3">
            {/* Connection Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                connectionStatus === 'CONNECTED'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : connectionStatus === 'RECONNECTING'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {connectionStatus === 'CONNECTED' ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              <span>
                {connectionStatus === 'CONNECTED'
                  ? 'Realtime Aktif'
                  : connectionStatus === 'RECONNECTING'
                    ? 'Menghubungkan ulang...'
                    : 'Terputus'}
              </span>
            </div>

            {/* Session Status Badge */}
            {isWaiting && <Badge variant="warning">Menunggu Dimulai</Badge>}
            {isActive && <Badge variant="success">Sesi Sedang Berlangsung</Badge>}
            {isEnded && <Badge variant="neutral">Selesai</Badge>}
          </div>
        }
      />

      {socketError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{socketError}</span>
        </div>
      )}

      {/* Hero Join Card */}
      {!isEnded && (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">
                Minta murid bergabung melalui tautan atau masukkan kode:
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-indigo-800/80 px-6 py-3 rounded-xl border border-indigo-700/50 shadow-inner">
                  <span className="text-3xl sm:text-5xl font-mono font-extrabold tracking-widest text-indigo-100">
                    {session.joinCode}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={
                      copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
                    }
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? 'Tersalin!' : 'Salin Kode'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={
                      copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
                    }
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? 'Link Tersalin!' : 'Salin Link Gabung'}
                  </Button>
                  <a
                    href={`/projector/${session.joinCode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Tv className="w-4 h-4 text-indigo-300" />}
                    >
                      Buka Layar Proyektor
                    </Button>
                  </a>
                </div>
              </div>
              <p className="text-xs text-indigo-300">
                Murid membuka:{' '}
                <span className="font-semibold underline">tools.walikelas.id/join</span> lalu ketik
                kode di atas.
              </p>
            </div>

            <div className="flex flex-col gap-3 justify-center lg:items-end border-t lg:border-t-0 lg:border-l border-indigo-800/80 pt-4 lg:pt-0 lg:pl-6">
              {isWaiting && (
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Play className="w-5 h-5 fill-current" />}
                  onClick={startSession}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Mulai Sesi Sekarang
                </Button>
              )}

              {isActive && (
                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                  {!isQuizActive && !isPollActive && (
                    <Button
                      variant="secondary"
                      size="lg"
                      leftIcon={<BarChart2 className="w-5 h-5 text-blue-400" />}
                      onClick={() => {
                        setPollHudDismissed(false);
                        setShowPollPicker(true);
                      }}
                      className="w-full sm:w-auto bg-blue-900/80 hover:bg-blue-800 text-white font-bold border-blue-600 shadow-md"
                    >
                      Mulai Polling
                    </Button>
                  )}
                  {!isQuizActive && !isPollActive && (
                    <Button
                      variant="secondary"
                      size="lg"
                      leftIcon={<HelpCircle className="w-5 h-5 text-indigo-400" />}
                      onClick={() => {
                        setHudDismissed(false);
                        setShowQuizPicker(true);
                      }}
                      className="w-full sm:w-auto bg-indigo-800/80 hover:bg-indigo-700 text-white font-bold border-indigo-600 shadow-md"
                    >
                      Mulai Kuis
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<HelpCircle className="w-5 h-5 text-amber-400" />}
                    onClick={() => setShowQuestionBox(true)}
                    className="relative w-full sm:w-auto bg-amber-950/80 hover:bg-amber-900 text-white font-bold border-amber-600 shadow-md"
                  >
                    <span>Tanya Guru</span>
                    {qbPendingCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-amber-500 rounded-full">
                        {qbPendingCount}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<Hand className="w-5 h-5 text-amber-400" />}
                    onClick={() => setShowRaiseHand(true)}
                    className="relative w-full sm:w-auto bg-amber-950/80 hover:bg-amber-900 text-white font-bold border-amber-600 shadow-md"
                  >
                    <span>Angkat Tangan</span>
                    {rhRaisedCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-amber-500 rounded-full animate-pulse">
                        {rhRaisedCount}
                      </span>
                    )}
                    {rhCurrentSpeaker && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-white">
                        <Mic className="h-3 w-3 animate-pulse" />
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<Lightbulb className="w-5 h-5 text-violet-400" />}
                    onClick={() => setShowBrainstorm(true)}
                    className="relative w-full sm:w-auto bg-violet-950/80 hover:bg-violet-900 text-white font-bold border-violet-600 shadow-md"
                  >
                    <span>Papan Ide</span>
                    {bsTotalCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-violet-600 rounded-full">
                        {bsVisibleCount}
                      </span>
                    )}
                    {bsActivity && bsActivity.status === 'OPEN' && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Aktif
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<ClipboardCheck className="w-5 h-5 text-indigo-400" />}
                    onClick={() => setShowExitTicket(true)}
                    className="relative w-full sm:w-auto bg-indigo-950/80 hover:bg-indigo-900 text-white font-bold border-indigo-600 shadow-md"
                  >
                    <span>Tiket Keluar</span>
                    {etResponseCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                        {etResponseCount}
                      </span>
                    )}
                    {etActivity && etActivity.status === 'OPEN' && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Aktif
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<Clock className="w-5 h-5 text-blue-400" />}
                    onClick={() => setShowClassroomTimer(true)}
                    className="relative w-full sm:w-auto bg-blue-950/80 hover:bg-blue-900 text-white font-bold border-blue-600 shadow-md"
                  >
                    <span>Timer</span>
                    {(ctIsRunning || ctIsPaused || ctIsCompleted) && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-mono font-bold leading-none text-white bg-blue-600 rounded-full">
                        {formatTimerTime(ctRemaining)}
                      </span>
                    )}
                    {ctIsRunning && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse">
                        Aktif
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    leftIcon={<Square className="w-5 h-5 fill-current" />}
                    onClick={() => setShowConfirmEnd(true)}
                    className="w-full sm:w-auto font-bold"
                  >
                    Akhiri Sesi Kelas
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {quizError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{quizError}</span>
        </div>
      )}

      {pollError && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{pollError}</span>
        </div>
      )}

      {/* Live Poll HUD */}
      {(isPollActive || (isPollClosed && !pollHudDismissed)) && (
        <TeacherLivePollHud
          isPollActive={isPollActive}
          isPollClosed={isPollClosed}
          teacherSnapshot={pollSnapshot}
          distribution={pollDistribution}
          percentages={pollPercentages}
          responseCount={pollResponseCount}
          totalParticipants={pollTotalParticipants}
          responseRate={pollResponseRate}
          onClosePoll={closePoll}
          onDismiss={() => setPollHudDismissed(true)}
        />
      )}

      {/* Live Quiz HUD (Active Question or Final Podium) */}
      {(isQuizActive || (isQuizFinished && !hudDismissed)) && (
        <TeacherLiveQuizHud
          isQuizActive={isQuizActive}
          isQuestionEnded={isQuestionEnded}
          isQuizFinished={isQuizFinished}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          questionDeadline={questionDeadline}
          teacherSnapshot={teacherSnapshot}
          distribution={distribution}
          answeredCount={answeredCount}
          totalParticipants={totalParticipants}
          correctOptionId={correctOptionId}
          leaderboard={leaderboard}
          onEndQuestion={endQuestion}
          onNextQuestion={nextQuestion}
          onFinishQuiz={finishQuiz}
          onCloseQuiz={() => setHudDismissed(true)}
        />
      )}

      {/* Sesi Selesai Banner */}
      {isEnded && (
        <div className="p-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Sesi Kelas Telah Berakhir
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Semua peserta telah diputus dan sesi ini sudah ditutup secara permanen.
            </p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/teacher/sessions')}>
            Kembali ke Daftar Sesi
          </Button>
        </div>
      )}

      {/* Participant Roster Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Daftar Peserta</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Aktif Online:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              {onlineCount} Peserta
            </span>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Menunggu Peserta Bergabung
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Murid yang membuka tautan atau memasukkan kode sesi akan muncul di sini secara
              otomatis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`p-3 rounded-xl border transition-all flex flex-col items-center text-center ${
                  p.isOnline
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/40 text-slate-900 dark:text-slate-100'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      p.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>
                <span className="text-xs font-semibold truncate w-full" title={p.displayName}>
                  {p.displayName}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {p.isOnline ? 'Online' : 'Terputus'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal for End Session */}
      {showConfirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Square className="w-6 h-6 fill-current" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Akhiri Sesi Kelas Ini?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Semua peserta yang terhubung akan menerima pemberitahuan bahwa sesi telah berakhir.
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowConfirmEnd(false)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleConfirmEnd}>
                Ya, Akhiri Sesi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Picker Modal */}
      <QuizPickerModal
        isOpen={showQuizPicker}
        onClose={() => setShowQuizPicker(false)}
        onSelectQuiz={startQuiz}
      />

      {/* Poll Picker Modal */}
      <PollPickerModal
        isOpen={showPollPicker}
        onClose={() => setShowPollPicker(false)}
        onSelectPoll={startPoll}
      />

      {/* Question Box Panel */}
      <TeacherQuestionBoxPanel
        isOpen={showQuestionBox}
        onClose={() => setShowQuestionBox(false)}
        questions={qbQuestions}
        highlightedQuestionId={qbHighlightedId}
        pendingCount={qbPendingCount}
        answeredCount={qbAnsweredCount}
        totalCount={qbTotalCount}
        onHighlight={qbHighlight}
        onUnhighlight={qbUnhighlight}
        onAnswer={qbAnswer}
        onDismiss={qbDismiss}
      />

      {/* Raise Hand Panel */}
      <TeacherRaiseHandPanel
        isOpen={showRaiseHand}
        onClose={() => setShowRaiseHand(false)}
        queue={rhQueue}
        currentSpeaker={rhCurrentSpeaker}
        raisedCount={rhRaisedCount}
        onAcknowledge={rhAcknowledge}
        onStartSpeaking={rhStartSpeaking}
        onLowerParticipant={rhLowerParticipant}
        onLowerAll={rhLowerAll}
      />

      {/* Collaborative Brainstorm Board Panel */}
      <TeacherBrainstormPanel
        isOpen={showBrainstorm}
        onClose={() => setShowBrainstorm(false)}
        activity={bsActivity}
        ideas={bsIdeas}
        visibleCount={bsVisibleCount}
        hiddenCount={bsHiddenCount}
        totalCount={bsTotalCount}
        onCreateActivity={bsCreateActivity}
        onOpenActivity={bsOpenActivity}
        onPauseActivity={bsPauseActivity}
        onCloseActivity={bsCloseActivity}
        onHideIdea={bsHideIdea}
        onRestoreIdea={bsRestoreIdea}
      />

      {/* Exit Ticket / Quick Reflection Panel */}
      <TeacherExitTicketPanel
        isOpen={showExitTicket}
        onClose={() => setShowExitTicket(false)}
        activity={etActivity}
        aggregates={etAggregates}
        responseCount={etResponseCount}
        totalExpected={etTotalExpected}
        completionRate={etCompletionRate}
        onCreateActivity={etCreateActivity}
        onOpenActivity={etOpenActivity}
        onCloseActivity={etCloseActivity}
      />

      {/* Classroom Timer Panel */}
      <TeacherClassroomTimerPanel
        isOpen={showClassroomTimer}
        onClose={() => setShowClassroomTimer(false)}
        timer={ctTimer}
        remaining={ctRemaining}
        duration={ctDuration}
        progress={ctProgress}
        isRunning={ctIsRunning}
        isPaused={ctIsPaused}
        isCompleted={ctIsCompleted}
        isIdle={ctIsIdle}
        error={ctError}
        onSetTimer={ctSetTimer}
        onStartTimer={ctStartTimer}
        onPauseTimer={ctPauseTimer}
        onResumeTimer={ctResumeTimer}
        onResetTimer={ctResetTimer}
        onClearError={ctClearError}
      />
    </div>
  );
}
