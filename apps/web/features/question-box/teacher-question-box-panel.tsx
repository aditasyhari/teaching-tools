'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { HelpCircle, X, Sparkles, CheckCircle2, EyeOff, User, Clock, Search } from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { QuestionBoxItem } from '@walikelas/types';

interface TeacherQuestionBoxPanelProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionBoxItem[];
  highlightedQuestionId: string | null;
  pendingCount: number;
  answeredCount: number;
  totalCount: number;
  onHighlight: (questionId: string) => void;
  onUnhighlight: (questionId: string) => void;
  onAnswer: (questionId: string) => void;
  onDismiss: (questionId: string) => void;
}

type TabType = 'ALL' | 'PENDING' | 'ANSWERED' | 'DISMISSED';

function formatTimestamp(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m yang lalu`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}j yang lalu`;
}

export function TeacherQuestionBoxPanel({
  isOpen,
  onClose,
  questions,
  highlightedQuestionId,
  pendingCount,
  answeredCount,
  totalCount,
  onHighlight,
  onUnhighlight,
  onAnswer,
  onDismiss,
}: TeacherQuestionBoxPanelProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Tab filter
      if (activeTab === 'PENDING') {
        if (q.status !== 'PENDING' && q.status !== 'HIGHLIGHTED') return false;
      } else if (activeTab === 'ANSWERED') {
        if (q.status !== 'ANSWERED') return false;
      } else if (activeTab === 'DISMISSED') {
        if (q.status !== 'DISMISSED') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesContent = q.content.toLowerCase().includes(query);
        const matchesAuthor = q.authorName.toLowerCase().includes(query);
        return matchesContent || matchesAuthor;
      }

      return true;
    });
  }, [questions, activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-box-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex h-[90vh] max-h-[750px] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="question-box-dialog-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Kotak Pertanyaan Kelas
                </h2>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {pendingCount} baru
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola pertanyaan peserta dan sorot ke layar proyektor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats & Tabs Bar */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <span>Menunggu</span>
                <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px] font-semibold dark:bg-white/20">
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ALL')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <span>Semua</span>
                <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px] font-semibold dark:bg-white/20">
                  {totalCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ANSWERED')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'ANSWERED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <span>Terjawab</span>
                <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px] font-semibold dark:bg-white/20">
                  {answeredCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('DISMISSED')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'DISMISSED'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <span>Diabaikan</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pertanyaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <HelpCircle className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {activeTab === 'PENDING'
                  ? 'Tidak ada pertanyaan menunggu'
                  : activeTab === 'ANSWERED'
                    ? 'Belum ada pertanyaan yang dijawab'
                    : 'Belum ada pertanyaan'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Pertanyaan yang diajukan oleh siswa selama sesi aktif akan muncul di sini secara
                real time.
              </p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isHighlighted = q.id === highlightedQuestionId;

              return (
                <div
                  key={q.id}
                  className={`relative rounded-xl border p-4 transition-all ${
                    isHighlighted
                      ? 'border-amber-400 bg-amber-50/50 shadow-md dark:border-amber-500/60 dark:bg-amber-950/20'
                      : q.status === 'ANSWERED'
                        ? 'border-slate-200 bg-slate-50/60 opacity-80 dark:border-slate-800 dark:bg-slate-950/20'
                        : q.status === 'DISMISSED'
                          ? 'border-slate-200 bg-slate-100/50 opacity-50 dark:border-slate-800 dark:bg-slate-950/40'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {q.isAnonymous ? 'Anonim' : q.authorName}
                      </span>
                      {q.isAnonymous && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">
                          Dirahasiakan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(q.createdAt)}
                      </span>

                      {isHighlighted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                          <Sparkles className="h-2.5 w-2.5" />
                          Di Layar
                        </span>
                      ) : q.status === 'ANSWERED' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Terjawab
                        </span>
                      ) : q.status === 'DISMISSED' ? (
                        <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Diabaikan
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Card Body */}
                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {q.content}
                  </p>

                  {/* Card Actions */}
                  <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    {isHighlighted ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onUnhighlight(q.id)}
                        className="text-xs h-7 px-2.5"
                      >
                        Batal Sorot
                      </Button>
                    ) : q.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onHighlight(q.id)}
                        className="text-xs h-7 px-2.5 bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Sorot ke Layar
                      </Button>
                    ) : null}

                    {q.status !== 'ANSWERED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onAnswer(q.id)}
                        className="text-xs h-7 px-2.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Tandai Selesai
                      </Button>
                    )}

                    {q.status !== 'DISMISSED' && (
                      <button
                        onClick={() => onDismiss(q.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                        title="Abaikan pertanyaan"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-right text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
          Pertanyaan bersifat sementara untuk sesi ini dan terlindungi privasi antar peserta.
        </div>
      </div>
    </div>
  );
}
