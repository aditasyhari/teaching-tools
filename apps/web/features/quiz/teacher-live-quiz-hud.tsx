'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle2, ArrowRight, StopCircle, Trophy } from 'lucide-react';
import { Button, Badge } from '@walikelas/ui';
import type { QuizLeaderboardEntry, TeacherLiveQuizSnapshot } from '@walikelas/types';

interface TeacherLiveQuizHudProps {
  isQuizActive: boolean;
  isQuestionEnded: boolean;
  isQuizFinished: boolean;
  questionNumber: number;
  totalQuestions: number;
  questionDeadline: number;
  teacherSnapshot: TeacherLiveQuizSnapshot | null;
  distribution: Record<string, number>;
  answeredCount: number;
  totalParticipants: number;
  correctOptionId: string | null;
  leaderboard: QuizLeaderboardEntry[];
  onEndQuestion: () => void;
  onNextQuestion: () => void;
  onFinishQuiz: () => void;
  onCloseQuiz?: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_BG_COLORS = [
  'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50',
  'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50',
  'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50',
  'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50',
];
const OPTION_BADGES = ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'];

export function TeacherLiveQuizHud({
  isQuizActive,
  isQuestionEnded,
  isQuizFinished,
  questionNumber,
  totalQuestions,
  questionDeadline,
  teacherSnapshot,
  distribution,
  answeredCount,
  totalParticipants,
  correctOptionId,
  leaderboard,
  onEndQuestion,
  onNextQuestion,
  onFinishQuiz,
  onCloseQuiz,
}: TeacherLiveQuizHudProps): React.JSX.Element | null {
  // Remaining countdown timer in seconds
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

  const currentQ = teacherSnapshot?.currentQuestion;

  // View: Finished Quiz Podium
  if (isQuizFinished) {
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Kuis Selesai! Papan Peringkat Akhir
          </h2>
          <p className="text-sm text-slate-500">
            Selamat kepada seluruh murid yang telah berpartisipasi dengan hebat!
          </p>
        </div>

        {/* Podium Top 3 */}
        {leaderboard.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
            {leaderboard.slice(0, 3).map((entry, idx) => (
              <div
                key={entry.participantId}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between ${
                  idx === 0
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 order-first sm:order-2 sm:-translate-y-2'
                    : idx === 1
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 order-2 sm:order-1'
                      : 'bg-orange-50/60 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 order-3'
                }`}
              >
                <div className="text-2xl mb-1">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 truncate w-full text-base">
                  {entry.displayName}
                </div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {entry.score} <span className="text-xs font-normal">poin</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{entry.correctCount} benar</div>
              </div>
            ))}
          </div>
        )}

        {/* Full Leaderboard Table */}
        {leaderboard.length > 3 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Peringkat & Nama</span>
              <span>Skor</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
              {leaderboard.slice(3).map((entry) => (
                <div
                  key={entry.participantId}
                  className="px-4 py-2.5 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-slate-400">#{entry.rank}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {entry.displayName}
                    </span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {entry.score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {onCloseQuiz && (
          <div className="flex justify-center pt-4">
            <Button variant="secondary" onClick={onCloseQuiz}>
              Tutup Tampilan Kuis
            </Button>
          </div>
        )}
      </div>
    );
  }

  // View: Active Question HUD
  const isLastQuestion = questionNumber >= totalQuestions;
  const answerPercentage =
    totalParticipants > 0 ? Math.round((answeredCount / totalParticipants) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 dark:border-indigo-600 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-sm tracking-wide">
            PERTANYAAN {questionNumber} / {totalQuestions}
          </span>
          <Badge variant="neutral">{currentQ?.points ?? 100} Poin</Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Timer Pill */}
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-sm font-black ${
              secondsRemaining <= 5 && !isQuestionEnded
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isQuestionEnded ? 'WAKTU SELESAI' : `${secondsRemaining} Detik`}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFinishQuiz}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            Akhiri Kuis
          </Button>
        </div>
      </div>

      {/* Question Text */}
      <div className="text-center py-2">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 leading-snug">
          {currentQ?.questionText || 'Memuat pertanyaan...'}
        </h3>
      </div>

      {/* Answer Progress Bar */}
      <div className="space-y-1.5 max-w-xl mx-auto">
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Partisipasi Menjawab
          </span>
          <span>
            {answeredCount} dari {totalParticipants} murid ({answerPercentage}%)
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${answerPercentage}%` }}
          />
        </div>
      </div>

      {/* Options Distribution Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {currentQ?.options.map((opt, idx) => {
          const optCount = distribution[opt.id] || 0;
          const isCorrect = isQuestionEnded && opt.id === correctOptionId;
          const isWrongRevealed = isQuestionEnded && opt.id !== correctOptionId;

          return (
            <div
              key={opt.id}
              className={`p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-lg ring-2 ring-emerald-400/40'
                  : isWrongRevealed
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                    : `${OPTION_BG_COLORS[idx % 4]}`
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-black text-white flex items-center justify-center shadow-sm ${
                      isCorrect ? 'bg-emerald-600' : OPTION_BADGES[idx % 4]
                    }`}
                  >
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {opt.optionText}
                  </span>
                </div>

                {isCorrect && (
                  <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                  </span>
                )}
              </div>

              {/* Vote Count Indicator */}
              <div className="pt-4 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{optCount} Murid Memilih</span>
                {totalParticipants > 0 && (
                  <span>{Math.round((optCount / totalParticipants) * 100)}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {isQuestionEnded ? (
            <Badge variant="default">Pertanyaan Ditutup - Kunci Jawaban Terbuka</Badge>
          ) : (
            <Badge variant="warning">Menerima Jawaban Murid...</Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isQuestionEnded ? (
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<StopCircle className="w-5 h-5 text-rose-600" />}
              onClick={onEndQuestion}
              className="font-bold"
            >
              Tutup Pertanyaan
            </Button>
          ) : !isLastQuestion ? (
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={onNextQuestion}
              className="font-bold bg-indigo-600 hover:bg-indigo-500"
            >
              Pertanyaan Berikutnya
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Trophy className="w-5 h-5" />}
              onClick={onFinishQuiz}
              className="font-bold bg-emerald-600 hover:bg-emerald-500"
            >
              Lihat Hasil Akhir Kuis
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
