'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Trophy, Lock } from 'lucide-react';
import { Badge } from '@walikelas/ui';
import type { ParticipantQuestionData, QuizLeaderboardEntry } from '@walikelas/types';

interface ParticipantLiveQuizViewProps {
  isQuizActive: boolean;
  isQuestionEnded: boolean;
  isQuizFinished: boolean;
  questionNumber: number;
  totalQuestions: number;
  questionDeadline: number;
  participantQuestion: ParticipantQuestionData | null;
  hasAnswered: boolean;
  selectedOptionId: string | null;
  wasCorrect: boolean | null;
  pointsEarned: number;
  totalScore: number;
  leaderboard: QuizLeaderboardEntry[];
  participantId?: string | null;
  onSubmitAnswer: (questionId: string, optionId: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_STYLES = [
  'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100',
  'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100',
  'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100',
  'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
];
const OPTION_BADGES = ['bg-rose-600', 'bg-blue-600', 'bg-amber-600', 'bg-emerald-600'];

export function ParticipantLiveQuizView({
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
  participantId,
  onSubmitAnswer,
}: ParticipantLiveQuizViewProps): React.JSX.Element | null {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (!questionDeadline || isQuestionEnded || isQuizFinished) {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.ceil((questionDeadline - Date.now()) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [questionDeadline, isQuestionEnded, isQuizFinished]);

  if (!isQuizActive && !isQuizFinished) {
    return null;
  }

  // View: Finished Quiz Podium for Participant
  if (isQuizFinished) {
    const myEntry = participantId
      ? leaderboard.find((e) => e.participantId === participantId)
      : null;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Kuis Selesai!</h2>
          <p className="text-sm text-slate-500">
            Hasil kuis interaktif kelas telah selesai dihitung.
          </p>
        </div>

        {myEntry && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 max-w-sm mx-auto shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Peringkat Anda
            </span>
            <div className="text-4xl font-black text-indigo-700 dark:text-indigo-300">
              #{myEntry.rank}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {myEntry.score} <span className="text-sm font-normal text-slate-500">Total Poin</span>
            </div>
            <div className="text-xs text-slate-500">{myEntry.correctCount} jawaban benar</div>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length > 0 && (
          <div className="pt-4 max-w-sm mx-auto space-y-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Juara Kelas
            </h4>
            {leaderboard.slice(0, 3).map((entry, idx) => (
              <div
                key={entry.participantId}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {entry.displayName}
                  </span>
                </div>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {entry.score} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View: Active Question Screen for Participant
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Participant Quiz Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default">
            Soal {questionNumber} / {totalQuestions}
          </Badge>
          <span className="text-xs font-bold text-slate-500">
            {participantQuestion?.points ?? 100} Pts
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-black ${
              secondsRemaining <= 5 && !isQuestionEnded
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isQuestionEnded ? 'Tutup' : `${secondsRemaining}s`}</span>
          </div>

          <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800">
            Skor: {totalScore}
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug">
          {participantQuestion?.questionText || 'Menunggu pertanyaan...'}
        </h3>
      </div>

      {/* Feedback Banner when Answered */}
      {hasAnswered && !isQuestionEnded && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 flex items-center justify-center gap-2 shadow-sm text-sm font-bold animate-in fade-in">
          <Lock className="w-4 h-4" />
          <span>Jawaban Terkunci! Menunggu guru menutup soal...</span>
        </div>
      )}

      {/* Result Reveal Banner when question ended */}
      {isQuestionEnded && (
        <div
          className={`p-4 rounded-2xl border-2 shadow-md flex items-center justify-center gap-3 text-center animate-in zoom-in-95 ${
            wasCorrect === true
              ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100'
              : wasCorrect === false
                ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-800 dark:text-slate-200'
          }`}
        >
          {wasCorrect === true ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div className="text-left">
                <div className="text-base font-black">Jawaban Anda Benar! 🎉</div>
                <div className="text-xs opacity-80">+{pointsEarned} Poin berhasil diraih</div>
              </div>
            </>
          ) : wasCorrect === false ? (
            <>
              <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
              <div className="text-left">
                <div className="text-base font-black">Jawaban Kurang Tepat!</div>
                <div className="text-xs opacity-80">
                  Tetap semangat untuk pertanyaan berikutnya!
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm font-semibold">
              Waktu menjawab telah selesai. Perhatikan penjelasan guru.
            </div>
          )}
        </div>
      )}

      {/* Touch-Friendly Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {participantQuestion?.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const isButtonDisabled = hasAnswered || isQuestionEnded;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isButtonDisabled}
              onClick={() => participantQuestion && onSubmitAnswer(participantQuestion.id, opt.id)}
              className={`p-5 rounded-2xl border-2 text-left font-bold transition-all active:scale-[0.98] flex items-center gap-4 ${
                isSelected
                  ? 'ring-4 ring-indigo-500 dark:ring-indigo-400 border-indigo-600 bg-indigo-50 dark:bg-indigo-950 shadow-lg scale-[1.01]'
                  : isButtonDisabled
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400'
                    : `${OPTION_STYLES[idx % 4]} shadow-sm hover:shadow-md cursor-pointer`
              }`}
            >
              <span
                className={`w-9 h-9 rounded-xl text-sm font-black text-white flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isSelected ? 'bg-indigo-600' : OPTION_BADGES[idx % 4]
                }`}
              >
                {OPTION_LETTERS[idx]}
              </span>

              <span className="text-base flex-1 line-clamp-2">{opt.optionText}</span>

              {isSelected && (
                <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
