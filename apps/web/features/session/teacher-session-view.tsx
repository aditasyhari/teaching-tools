'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Button,
  Badge,
  Card,
  PageHeaderSection,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@walikelas/ui';
import type { SessionSnapshot, RaisedHandItem, QuestionBoxItem } from '@walikelas/types';
import { TeacherSessionAlerts, type ClassroomAlertItem } from './teacher-session-alerts';
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

  // Realtime Classroom Notification Alerts
  const [activeAlerts, setActiveAlerts] = useState<ClassroomAlertItem[]>([]);

  const handleDismissAlert = useCallback((id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addClassroomAlert = useCallback((alert: Omit<ClassroomAlertItem, 'id' | 'timestamp'>) => {
    const id = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newAlert: ClassroomAlertItem = {
      ...alert,
      id,
      timestamp: Date.now(),
    };
    setActiveAlerts((prev) => [newAlert, ...prev.slice(0, 2)]);

    setTimeout(() => {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 6500);
  }, []);

  const handleHandRaisedAlert = useCallback(
    (hand: RaisedHandItem, queueCount: number) => {
      addClassroomAlert({
        type: 'RAISE_HAND',
        title: 'Siswa Mengangkat Tangan',
        author: hand.displayName,
        message: `${hand.displayName} mengangkat tangan (antrean #${queueCount})`,
        actionLabel: 'Lihat Antrean',
        onAction: () => setShowRaiseHand(true),
      });
    },
    [addClassroomAlert],
  );

  const handleQuestionCreatedAlert = useCallback(
    (question: QuestionBoxItem) => {
      addClassroomAlert({
        type: 'NEW_QUESTION',
        title: 'Pertanyaan Baru Masuk',
        author: question.isAnonymous ? 'Anonim' : question.authorName,
        message: question.content,
        actionLabel: 'Buka Kotak Pertanyaan',
        onAction: () => setShowQuestionBox(true),
      });
    },
    [addClassroomAlert],
  );

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
    onQuestionCreated: handleQuestionCreatedAlert,
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
    onHandRaised: handleHandRaisedAlert,
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

            {/* Quick Alert Notice Chips */}
            {rhRaisedCount > 0 && (
              <button
                type="button"
                onClick={() => setShowRaiseHand(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs animate-bounce cursor-pointer transition-transform active:scale-95"
                title={`${rhRaisedCount} siswa mengangkat tangan. Klik untuk membuka.`}
              >
                <Hand className="w-3.5 h-3.5" />
                <span>{rhRaisedCount} Angkat Tangan</span>
              </button>
            )}

            {qbPendingCount > 0 && (
              <button
                type="button"
                onClick={() => setShowQuestionBox(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-transform active:scale-95"
                title={`${qbPendingCount} pertanyaan baru belum dijawab. Klik untuk membuka.`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{qbPendingCount} Tanya</span>
              </button>
            )}

            {/* Session Status Badge */}
            {isWaiting && <Badge variant="warning">Menunggu Dimulai</Badge>}
            {isActive && <Badge variant="success">Sesi Sedang Berlangsung</Badge>}
            {isEnded && <Badge variant="neutral">Selesai</Badge>}
          </div>
        }
      />

      {/* Floating Realtime Classroom Activity Alerts */}
      <TeacherSessionAlerts alerts={activeAlerts} onDismiss={handleDismissAlert} />

      {socketError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{socketError}</span>
        </div>
      )}

      {/* Hero Join & Controls Card */}
      {!isEnded && (
        <Card className="p-6 sm:p-7 border-[#e8e4dc] bg-white shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Join Code & Quick Actions */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                <span>Kode Masuk Sesi Kelas</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-stone-50 px-5 py-2.5 rounded-xl border border-[#e8e4dc]">
                  <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-stone-900">
                    {session.joinCode}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />
                    }
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? 'Tersalin' : 'Salin Kode'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />
                    }
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? 'Link Tersalin' : 'Salin Link'}
                  </Button>
                  <a
                    href={`/projector/${session.joinCode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Tv className="w-3.5 h-3.5 text-amber-600" />}
                    >
                      Layar Proyektor
                    </Button>
                  </a>
                </div>
              </div>
              <p className="text-xs text-stone-500">
                Murid dapat membuka <span className="font-semibold text-stone-800 underline">tools.walikelas.id/join</span> di ponsel lalu memasukkan kode di atas.
              </p>
            </div>

            {/* Session Actions / Tools Toolbar */}
            <div className="lg:col-span-6 flex flex-col gap-3 lg:border-l border-[#e8e4dc] lg:pl-6 pt-4 lg:pt-0">
              {isWaiting && (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Play className="w-4 h-4 fill-current" />}
                    onClick={startSession}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Mulai Sesi Sekarang
                  </Button>
                  <span className="text-xs text-stone-500">
                    Peserta yang telah bergabung akan otomatis memasuki sesi saat dimulai.
                  </span>
                </div>
              )}

              {isActive && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                    <span>Menu Alat Interaktif</span>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
                      onClick={() => setShowConfirmEnd(true)}
                    >
                      Akhiri Sesi
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {!isQuizActive && !isPollActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPollHudDismissed(false);
                          setShowPollPicker(true);
                        }}
                        className="justify-start font-medium"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <BarChart2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate">Polling</span>
                        </span>
                      </Button>
                    )}

                    {!isQuizActive && !isPollActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setHudDismissed(false);
                          setShowQuizPicker(true);
                        }}
                        className="justify-start font-medium"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="truncate">Kuis</span>
                        </span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQuestionBox(true)}
                      className="justify-between font-medium"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">Tanya Guru</span>
                      </span>
                      {qbPendingCount > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-amber-500 rounded-full shrink-0">
                          {qbPendingCount}
                        </span>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRaiseHand(true)}
                      className="justify-between font-medium"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Hand className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">Angkat Tangan</span>
                      </span>
                      {rhRaisedCount > 0 ? (
                        <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-amber-500 rounded-full animate-pulse shrink-0">
                          {rhRaisedCount}
                        </span>
                      ) : rhCurrentSpeaker ? (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-500 p-0.5 text-white shrink-0">
                          <Mic className="h-3 w-3 animate-pulse" />
                        </span>
                      ) : null}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBrainstorm(true)}
                      className="justify-between font-medium"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Lightbulb className="w-4 h-4 text-violet-600 shrink-0" />
                        <span className="truncate">Papan Ide</span>
                      </span>
                      {bsActivity?.status === 'OPEN' ? (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shrink-0">
                          Aktif
                        </span>
                      ) : bsTotalCount > 0 ? (
                        <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-stone-700 bg-stone-100 rounded-full shrink-0">
                          {bsVisibleCount}
                        </span>
                      ) : null}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExitTicket(true)}
                      className="justify-between font-medium"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <ClipboardCheck className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="truncate">Tiket Keluar</span>
                      </span>
                      {etActivity?.status === 'OPEN' ? (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shrink-0">
                          Aktif
                        </span>
                      ) : etResponseCount > 0 ? (
                        <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-stone-700 bg-stone-100 rounded-full shrink-0">
                          {etResponseCount}
                        </span>
                      ) : null}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClassroomTimer(true)}
                      className="justify-between font-medium"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">Timer</span>
                      </span>
                      {(ctIsRunning || ctIsPaused || ctIsCompleted) && (
                        <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-stone-700 bg-stone-100 rounded-full shrink-0">
                          {formatTimerTime(ctRemaining)}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
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
        <Card className="p-6 border-[#e8e4dc] bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              Sesi Kelas Telah Berakhir
            </h3>
            <p className="text-sm text-stone-600">
              Semua peserta telah diputus dan sesi ini sudah ditutup secara permanen.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/teacher/sessions')}>
            Kembali ke Daftar Sesi
          </Button>
        </Card>
      )}

      {/* Participant Roster Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e8e4dc] pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-900">Daftar Peserta</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Aktif Online:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200/60">
              {onlineCount} Peserta
            </span>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400 border border-[#e8e4dc]">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">
              Menunggu Peserta Bergabung
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
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
                    ? 'bg-stone-50/80 border-[#e8e4dc] text-stone-900 hover:border-amber-300'
                    : 'bg-stone-50/40 border-stone-200 text-stone-400 opacity-60'
                }`}
              >
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center shadow-xs">
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      p.isOnline ? 'bg-emerald-500' : 'bg-stone-400'
                    }`}
                  />
                </div>
                <span className="text-xs font-semibold truncate w-full text-stone-800" title={p.displayName}>
                  {p.displayName}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5">
                  {p.isOnline ? 'Online' : 'Terputus'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmation Modal for End Session */}
      <Dialog open={showConfirmEnd} onOpenChange={setShowConfirmEnd}>
        <DialogContent className="max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Square className="w-6 h-6 fill-current" />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-bold text-foreground">
                Akhiri Sesi Kelas Ini?
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Semua peserta yang terhubung akan menerima pemberitahuan bahwa sesi telah berakhir.
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowConfirmEnd(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleConfirmEnd}>
              Ya, Akhiri Sesi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
