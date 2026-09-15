'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Wifi,
  WifiOff,
  LogOut,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button, Input, Badge } from '@walikelas/ui';
import type { ParticipantSessionSnapshot } from '@walikelas/types';
import { useSessionSocket } from './use-session-socket';
import { apiClient } from '../../lib/api';
import { verifyJoinCode } from '@walikelas/api-client';
import { useLiveQuiz } from '../quiz/use-live-quiz';
import { ParticipantLiveQuizView } from '../quiz/participant-live-quiz-view';
import { useLivePoll } from '../poll/use-live-poll';
import { ParticipantLivePollView } from '../poll/participant-live-poll-view';
import { useQuestionBox } from '../question-box/use-question-box';
import { ParticipantQuestionBoxView } from '../question-box/participant-question-box-view';
import { useRaiseHand, ParticipantRaiseHandView } from '../raise-hand';
import { useBrainstorm, ParticipantBrainstormView } from '../brainstorm';
import { useExitTicket, ParticipantExitTicketView } from '../exit-ticket';
import { useClassroomTimer, ParticipantClassroomTimerBanner } from '../classroom-timer';
import { HelpCircle, Hand, Mic, Lightbulb, ClipboardCheck } from 'lucide-react';

interface ParticipantJoinViewProps {
  initialCode?: string;
}

export function ParticipantJoinView({
  initialCode = '',
}: ParticipantJoinViewProps): React.JSX.Element {
  // Restore session from sessionStorage to survive page refresh / app switch
  const [code, setCode] = useState(() => {
    if (initialCode) return initialCode.toUpperCase();
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('wk_participant_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          return (parsed.code || '').toUpperCase();
        }
      } catch {}
    }
    return '';
  });

  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('wk_participant_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!initialCode || initialCode.toUpperCase() === (parsed.code || '').toUpperCase()) {
            return parsed.displayName || '';
          }
        }
      } catch {}
    }
    return '';
  });

  const [joined, setJoined] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('wk_participant_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.code && parsed.displayName) {
            if (!initialCode || initialCode.toUpperCase() === (parsed.code || '').toUpperCase()) {
              return true;
            }
          }
        }
      } catch {}
    }
    return false;
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [viewMode, setViewMode] = useState<
    'ACTIVITY' | 'QUESTIONS' | 'RAISE_HAND' | 'BRAINSTORM' | 'EXIT_TICKET'
  >('ACTIVITY');

  // Auto uppercase code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    setCode(val);
    setFormError(null);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value.slice(0, 30));
    setFormError(null);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setFormError('Masukkan 6 karakter kode sesi kelas.');
      return;
    }
    if (!displayName.trim()) {
      setFormError('Masukkan nama lengkap atau panggilan Anda.');
      return;
    }

    setVerifying(true);
    setFormError(null);

    try {
      // First verify code via REST API
      await verifyJoinCode(apiClient, code);
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('wk_participant_session');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.code && parsed.code.toUpperCase() !== code.trim().toUpperCase()) {
              sessionStorage.removeItem('wk_participant_id');
              sessionStorage.removeItem('wk_reconnect_token');
            }
          } catch {}
        }
        sessionStorage.setItem(
          'wk_participant_session',
          JSON.stringify({ code: code.trim().toUpperCase(), displayName: displayName.trim() }),
        );
      }
      setJoined(true);
    } catch (err: any) {
      setFormError(err.message || 'Kode sesi tidak valid atau sesi telah berakhir.');
    } finally {
      setVerifying(false);
    }
  };

  // Realtime socket connection once joined
  const {
    connectionStatus,
    snapshot: liveSnapshot,
    error: socketError,
    leaveSession,
    participantId,
    socket,
  } = useSessionSocket({
    isTeacher: false,
    joinCode: joined ? code : undefined,
    displayName: joined ? displayName : undefined,
    onSessionEnded: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('wk_participant_session');
        sessionStorage.removeItem('wk_participant_id');
        sessionStorage.removeItem('wk_reconnect_token');
      }
    },
  });

  const snapshot = liveSnapshot as ParticipantSessionSnapshot | null;

  // Live Quiz Hook for Participant
  const {
    isQuizActive,
    isQuestionEnded,
    isQuizFinished,
    questionNumber,
    totalQuestions,
    questionDeadline,
    participantQuestion,
    hasAnswered,
    selectedOptionId,
    wasCorrect,
    pointsEarned,
    totalScore,
    leaderboard,
    submitAnswer,
  } = useLiveQuiz({
    socket,
    sessionId: snapshot?.id,
    isTeacher: false,
  });

  // Live Poll Hook for Participant
  const {
    isPollActive,
    isPollClosed,
    pollId,
    title: pollTitle,
    question: pollQuestion,
    options: pollOptions,
    settings: pollSettings,
    hasResponded: pollHasResponded,
    selectedOptionIds: pollSelectedOptionIds,
    distribution: pollDistribution,
    percentages: pollPercentages,
    responseCount: pollResponseCount,
    submitResponse: submitPollResponse,
  } = useLivePoll({
    socket,
    sessionId: snapshot?.id,
    isTeacher: false,
  });

  // Question Box Hook for Participant
  const {
    myQuestions,
    highlightedQuestion,
    isSubmitting: isSubmittingQuestion,
    error: questionBoxError,
    successMessage: questionBoxSuccess,
    submitQuestion,
    clearError: clearQuestionBoxError,
    clearSuccess: clearQuestionBoxSuccess,
  } = useQuestionBox({
    socket,
    sessionId: snapshot?.id,
    isTeacher: false,
  });

  // Raise Hand Hook for Participant
  const {
    myHand,
    queuePosition,
    totalRaisedCount,
    participantCurrentSpeaker,
    isLoading: isRaiseHandLoading,
    error: raiseHandError,
    successMessage: raiseHandSuccess,
    cooldown: raiseHandCooldown,
    raiseHand,
    lowerHand,
    clearError: clearRaiseHandError,
    clearSuccess: clearRaiseHandSuccess,
  } = useRaiseHand({
    socket,
    sessionId: snapshot?.id,
    isTeacher: false,
    participantId,
  });

  // Collaborative Brainstorm Board Hook for Participant
  const {
    participantActivity: bsActivity,
    myIdeas: bsMyIdeas,
    sharedIdeas: bsSharedIdeas,
    canSubmit: bsCanSubmit,
    totalIdeasCount: bsTotalIdeasCount,
    submitIdea: bsSubmitIdea,
    isSubmitting: bsIsSubmitting,
    cooldown: bsCooldown,
    error: bsError,
    successMessage: bsSuccessMessage,
    clearError: bsClearError,
    clearSuccessMessage: bsClearSuccess,
  } = useBrainstorm({
    socket,
    sessionId: snapshot?.id,
    isTeacher: false,
  });

  // Exit Ticket / Quick Reflection Hook for Participant
  const {
    participantActivity: etActivity,
    hasSubmitted: etHasSubmitted,
    submittedAt: etSubmittedAt,
    submitResponse: submitExitTicketResponse,
    isSubmitting: isSubmittingExitTicket,
    cooldown: exitTicketCooldown,
    error: exitTicketError,
    successMessage: exitTicketSuccessMessage,
    clearError: clearExitTicketError,
    clearSuccessMessage: clearExitTicketSuccessMessage,
  } = useExitTicket({
    socket,
    sessionId: snapshot?.id,
    isTeacher: false,
  });

  // Classroom Timer Hook for Participant
  const {
    timer: ctTimer,
    remaining: ctRemaining,
    progress: ctProgress,
    isRunning: ctIsRunning,
    isPaused: ctIsPaused,
    isCompleted: ctIsCompleted,
  } = useClassroomTimer({
    socket,
    sessionId: snapshot?.id,
    isTeacher: false,
  });

  const handleLeave = () => {
    leaveSession();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('wk_participant_session');
      sessionStorage.removeItem('wk_participant_id');
      sessionStorage.removeItem('wk_reconnect_token');
    }
    setJoined(false);
  };

  // If not yet joined, render the Join Form
  if (!joined) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8 focus:outline-none">
        <div className="w-full max-w-md bg-white border border-[#e8e4dc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-xs ring-4 ring-amber-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Gabung Sesi Kelas
            </h1>
            <p className="text-sm text-stone-600">
              Masukkan kode sesi yang diberikan guru dan nama Anda untuk memulai.
            </p>
          </div>

          {(formError || socketError) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError || socketError}</span>
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="join-session-code"
                className="text-xs font-bold uppercase tracking-wider text-stone-600"
              >
                Kode Sesi (6 Karakter)
              </label>
              <Input
                id="join-session-code"
                value={code}
                onChange={handleCodeChange}
                placeholder="CONTOH: AB7K42"
                className="text-center font-mono font-bold text-lg tracking-widest uppercase py-3 border-[#e8e4dc] focus:border-amber-500"
                autoFocus={!initialCode}
                maxLength={6}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="participant-display-name"
                className="text-xs font-bold uppercase tracking-wider text-stone-600"
              >
                Nama Anda
              </label>
              <Input
                id="participant-display-name"
                value={displayName}
                onChange={handleDisplayNameChange}
                placeholder="Nama panggilan atau lengkap"
                className="py-2.5 text-base border-[#e8e4dc] focus:border-amber-500"
                autoFocus={Boolean(initialCode)}
                maxLength={30}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold justify-center"
              disabled={verifying}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {verifying ? 'Memeriksa Kode...' : 'Masuk ke Kelas'}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-[#e8e4dc]">
            <Link
              href="/"
              className="text-xs text-stone-600 hover:text-stone-900 hover:underline font-semibold"
            >
              Kembali ke Beranda WaliKelas
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Once joined: Live Participant Screen
  const isWaiting = snapshot?.status === 'WAITING';
  const isActive = snapshot?.status === 'ACTIVE';
  const isEnded = snapshot?.status === 'ENDED';

  return (
    <main id="main-content" tabIndex={-1} className="min-h-[85vh] flex flex-col justify-between max-w-xl mx-auto px-4 py-5 focus:outline-none">
      {/* Top Participant Navigation Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#e8e4dc]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shadow-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-stone-900 leading-tight">
              {displayName}
            </div>
            <div className="text-xs text-stone-500">Kode: {code}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Status Pill */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              connectionStatus === 'CONNECTED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : connectionStatus === 'RECONNECTING'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {connectionStatus === 'CONNECTED' ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">
              {connectionStatus === 'CONNECTED' ? 'Terhubung' : 'Menghubungkan...'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-stone-500" />}
            title="Keluar dari sesi"
            className="text-stone-600 hover:text-rose-600"
          >
            Keluar
          </Button>
        </div>
      </div>

      {/* Main Body per Status */}
      <div className="my-auto py-6">
        {/* Connecting or Error State before Initial Snapshot */}
        {!snapshot && (
          <div className="text-center space-y-5 bg-white border border-[#e8e4dc] rounded-3xl p-8 shadow-xs max-w-md mx-auto">
            {socketError ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <Badge variant="destructive">Koneksi Gagal</Badge>
                  <h2 className="text-xl font-black text-stone-900">
                    Gagal Terhubung ke Sesi
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {socketError}
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => {
                      leaveSession();
                      setJoined(false);
                      setFormError(socketError);
                    }}
                  >
                    Kembali ke Form Masuk
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                  <Clock className="w-7 h-7 animate-spin text-amber-600" />
                </div>
                <div className="space-y-2">
                  <Badge variant="neutral">Menyambungkan</Badge>
                  <h2 className="text-xl font-black text-stone-900">
                    Menghubungkan ke Ruang Kelas...
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Menyiapkan ruang kelas untuk kode <span className="font-mono font-bold text-stone-900">{code}</span>. Mohon tunggu sebentar.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={handleLeave}
                  >
                    Batal & Keluar
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {isWaiting && (
          <div className="text-center space-y-5 bg-white border border-[#e8e4dc] rounded-3xl p-8 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-2">
              <Badge variant="warning">Ruang Tunggu</Badge>
              <h2 className="text-2xl font-black text-stone-900">
                Menunggu Guru Memulai Sesi
              </h2>
              <p className="text-sm text-stone-600 max-w-sm mx-auto">
                Anda sudah terhubung ke sesi{' '}
                <span className="font-semibold text-stone-900">
                  {snapshot?.title || 'Kelas'}
                </span>
                . Tetap di halaman ini, aktivitas akan dimulai sebentar lagi.
              </p>
            </div>

            <div className="pt-4 border-t border-[#e8e4dc] flex items-center justify-center gap-2 text-xs text-stone-500">
              <Users className="w-4 h-4 text-amber-600" />
              <span>{snapshot?.participantCount ?? 1} murid sedang bersiap</span>
            </div>
          </div>
        )}

        {isActive && (
          <div className="space-y-4">
            {/* Mobile-first Segmented Dock */}
            <div className="flex items-center justify-between gap-1 p-1 bg-stone-100 rounded-2xl border border-[#e8e4dc] overflow-x-auto">
              <button
                type="button"
                onClick={() => setViewMode('ACTIVITY')}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'ACTIVITY'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xs:inline">Aktivitas</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('RAISE_HAND')}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  viewMode === 'RAISE_HAND'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Hand className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden xs:inline">Angkat</span>
                {myHand?.status === 'SPEAKING' && (
                  <span className="inline-flex items-center rounded-full bg-emerald-600 text-white px-1 py-0.2 text-[9px] font-bold animate-pulse">
                    <Mic className="w-2.5 h-2.5" />
                  </span>
                )}
                {(myHand?.status === 'RAISED' || myHand?.status === 'ACKNOWLEDGED') &&
                  queuePosition !== null && (
                    <span className="rounded-full bg-amber-100 text-amber-900 px-1.5 py-0.2 text-[10px] font-bold border border-amber-200/60">
                      #{queuePosition}
                    </span>
                  )}
                {!myHand && totalRaisedCount > 0 && (
                  <span className="rounded-full bg-stone-200 text-stone-700 px-1.5 py-0.2 text-[10px] font-bold">
                    {totalRaisedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('QUESTIONS')}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  viewMode === 'QUESTIONS'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden xs:inline">Tanya</span>
                {myQuestions.length > 0 && (
                  <span className="rounded-full bg-stone-200 text-stone-700 px-1.5 py-0.2 text-[10px] font-semibold">
                    {myQuestions.length}
                  </span>
                )}
                {highlightedQuestion && viewMode !== 'QUESTIONS' && (
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('BRAINSTORM')}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  viewMode === 'BRAINSTORM'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-violet-600" />
                <span className="hidden xs:inline">Ide</span>
                {bsMyIdeas.length > 0 && (
                  <span className="rounded-full bg-stone-200 text-stone-700 px-1.5 py-0.2 text-[10px] font-semibold">
                    {bsMyIdeas.length}
                  </span>
                )}
                {bsActivity && bsActivity.status === 'OPEN' && viewMode !== 'BRAINSTORM' && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('EXIT_TICKET')}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  viewMode === 'EXIT_TICKET'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden xs:inline">Refleksi</span>
                {etActivity &&
                  etActivity.status === 'OPEN' &&
                  !etHasSubmitted &&
                  viewMode !== 'EXIT_TICKET' && (
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                  )}
                {etHasSubmitted && <Check className="w-3 h-3 text-emerald-600" />}
              </button>
            </div>

            {/* Realtime Classroom Timer Banner (if active & shared by teacher) */}
            <ParticipantClassroomTimerBanner
              timer={ctTimer}
              remaining={ctRemaining}
              progress={ctProgress}
              isRunning={ctIsRunning}
              isPaused={ctIsPaused}
              isCompleted={ctIsCompleted}
            />

            {/* Speaking banner if participant is granted turn while on another tab */}
            {myHand?.status === 'SPEAKING' && viewMode !== 'RAISE_HAND' && (
              <button
                type="button"
                onClick={() => setViewMode('RAISE_HAND')}
                className="w-full text-left mb-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-3.5 shadow-xs hover:bg-emerald-100/80 transition-colors animate-pulse"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Mic className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Giliran Anda Berbicara!
                  </span>
                </div>
                <p className="text-xs font-bold text-stone-900">
                  Silakan berbicara sekarang. Buka tab Angkat Tangan &rarr;
                </p>
              </button>
            )}

            {/* Exit Ticket active banner if participant hasn't submitted yet */}
            {etActivity?.status === 'OPEN' && !etHasSubmitted && viewMode !== 'EXIT_TICKET' && (
              <button
                type="button"
                onClick={() => setViewMode('EXIT_TICKET')}
                className="w-full text-left mb-3 rounded-2xl border-2 border-teal-500 bg-teal-50 p-3.5 shadow-xs hover:bg-teal-100/80 transition-colors animate-pulse"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ClipboardCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                    Tiket Keluar Telah Dibuka Guru!
                  </span>
                </div>
                <p className="text-xs font-bold text-stone-900">
                  {etActivity.title || 'Isi refleksi pembelajaran sekarang'}. Buka tab Refleksi
                  &rarr;
                </p>
              </button>
            )}

            {viewMode === 'EXIT_TICKET' ? (
              <ParticipantExitTicketView
                activity={etActivity}
                hasSubmitted={etHasSubmitted}
                submittedAt={etSubmittedAt}
                onSubmit={submitExitTicketResponse}
                isSubmitting={isSubmittingExitTicket}
                cooldown={exitTicketCooldown}
                error={exitTicketError}
                successMessage={exitTicketSuccessMessage}
                onClearError={clearExitTicketError}
                onClearSuccess={clearExitTicketSuccessMessage}
              />
            ) : viewMode === 'RAISE_HAND' ? (
              <ParticipantRaiseHandView
                myHand={myHand}
                queuePosition={queuePosition}
                totalRaisedCount={totalRaisedCount}
                currentSpeaker={participantCurrentSpeaker}
                isLoading={isRaiseHandLoading}
                error={raiseHandError}
                successMessage={raiseHandSuccess}
                cooldown={raiseHandCooldown}
                onRaiseHand={raiseHand}
                onLowerHand={lowerHand}
                onClearError={clearRaiseHandError}
                onClearSuccess={clearRaiseHandSuccess}
              />
            ) : viewMode === 'QUESTIONS' ? (
              <ParticipantQuestionBoxView
                myQuestions={myQuestions}
                highlightedQuestion={highlightedQuestion}
                isSubmitting={isSubmittingQuestion}
                error={questionBoxError}
                successMessage={questionBoxSuccess}
                onSubmit={submitQuestion}
                onClearError={clearQuestionBoxError}
                onClearSuccess={clearQuestionBoxSuccess}
              />
            ) : viewMode === 'BRAINSTORM' ? (
              <ParticipantBrainstormView
                activity={bsActivity}
                myIdeas={bsMyIdeas}
                sharedIdeas={bsSharedIdeas}
                canSubmit={bsCanSubmit}
                totalIdeasCount={bsTotalIdeasCount}
                onSubmitIdea={bsSubmitIdea}
                isSubmitting={bsIsSubmitting}
                cooldown={bsCooldown}
                error={bsError}
                successMessage={bsSuccessMessage}
                onClearError={bsClearError}
                onClearSuccess={bsClearSuccess}
              />
            ) : (
              <div>
                {/* Notice if a question is currently highlighted while viewing activity */}
                {highlightedQuestion && (
                  <button
                    type="button"
                    onClick={() => setViewMode('QUESTIONS')}
                    className="w-full text-left mb-4 rounded-2xl border-2 border-amber-400 bg-amber-50/80 p-3.5 shadow-sm hover:bg-amber-100/70 transition-colors dark:border-amber-500/60 dark:bg-amber-950/30"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Guru Sedang Membahas Pertanyaan
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                      &ldquo;{highlightedQuestion.content}&rdquo;
                    </p>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium underline mt-1 inline-block">
                      Buka Kotak Pertanyaan &rarr;
                    </span>
                  </button>
                )}

                {/* Live Poll Activity for Participant */}
                {(isPollActive || isPollClosed) && (
                  <ParticipantLivePollView
                    isPollActive={isPollActive}
                    isPollClosed={isPollClosed}
                    pollId={pollId}
                    title={pollTitle}
                    question={pollQuestion}
                    options={pollOptions}
                    settings={pollSettings}
                    hasResponded={pollHasResponded}
                    selectedOptionIds={pollSelectedOptionIds}
                    distribution={pollDistribution}
                    percentages={pollPercentages}
                    responseCount={pollResponseCount}
                    onSubmitResponse={submitPollResponse}
                  />
                )}

                {/* Live Quiz Activity for Participant */}
                {!isPollActive && !isPollClosed && (isQuizActive || isQuizFinished) && (
                  <ParticipantLiveQuizView
                    isQuizActive={isQuizActive}
                    isQuestionEnded={isQuestionEnded}
                    isQuizFinished={isQuizFinished}
                    questionNumber={questionNumber}
                    totalQuestions={totalQuestions}
                    questionDeadline={questionDeadline}
                    participantQuestion={participantQuestion}
                    hasAnswered={hasAnswered}
                    selectedOptionId={selectedOptionId}
                    wasCorrect={wasCorrect}
                    pointsEarned={pointsEarned}
                    totalScore={totalScore}
                    leaderboard={leaderboard}
                    participantId={participantId}
                    onSubmitAnswer={submitAnswer}
                  />
                )}

                {/* Waiting for next activity */}
                {!isPollActive && !isPollClosed && !isQuizActive && !isQuizFinished && (
                  <div className="text-center space-y-6 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 border border-indigo-100 dark:border-slate-800 rounded-3xl p-8 shadow-md">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <Badge variant="success">Sesi Aktif</Badge>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                        {snapshot?.title || 'Sesi Kelas Sedang Berlangsung'}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                        Perhatikan instruksi dari guru di depan kelas atau layar proyektor.
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      Siap untuk menerima aktivitas interaktif selanjutnya.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isEnded && (
          <div className="text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <Badge variant="neutral">Sesi Selesai</Badge>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Sesi Kelas Telah Berakhir
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Terima kasih atas partisipasi aktif Anda dalam sesi kelas ini!
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-3">
              <Button variant="secondary" onClick={handleLeave}>
                Gabung Sesi Lain
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400">
        WaliKelas Teaching Tools • Realtime Classroom
      </div>
    </main>
  );
}
