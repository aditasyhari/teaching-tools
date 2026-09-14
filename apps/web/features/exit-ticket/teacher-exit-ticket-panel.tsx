'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  X,
  Play,
  StopCircle,
  Plus,
  Trash2,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  Star,
} from 'lucide-react';
import { Button } from '@walikelas/ui';
import type {
  ExitTicketActivity,
  ExitTicketAggregates,
  ExitTicketQuestionType,
  ExitTicketScaleConfig,
  ExitTicketOption,
} from '@walikelas/types';

interface TeacherExitTicketPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ExitTicketActivity | null;
  aggregates: ExitTicketAggregates | null;
  responseCount: number;
  totalExpected: number;
  completionRate: number;
  onCreateActivity: (
    title: string,
    isAnonymous: boolean,
    questions: Array<{
      type: ExitTicketQuestionType;
      prompt: string;
      required?: boolean;
      scale?: ExitTicketScaleConfig;
      options?: ExitTicketOption[];
    }>,
  ) => void;
  onOpenActivity: () => void;
  onCloseActivity: () => void;
}

interface QuestionDraft {
  type: ExitTicketQuestionType;
  prompt: string;
  required: boolean;
  minLabel: string;
  maxLabel: string;
  options: string[];
}

function formatElapsed(ts?: number): string {
  if (!ts) return 'Baru saja';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return `${diffSec}d yang lalu`;
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin}m yang lalu`;
}

export function TeacherExitTicketPanel({
  isOpen,
  onClose,
  activity,
  aggregates,
  responseCount,
  totalExpected,
  completionRate,
  onCreateActivity,
  onOpenActivity,
  onCloseActivity,
}: TeacherExitTicketPanelProps) {
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

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('Refleksi Pembelajaran Hari Ini');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      type: 'SCALE',
      prompt: 'Seberapa paham kamu dengan materi hari ini?',
      required: true,
      minLabel: 'Belum paham',
      maxLabel: 'Sangat paham',
      options: ['Opsi 1', 'Opsi 2'],
    },
  ]);

  if (!isOpen) return null;

  const isFormActive = showCreateForm || !activity;

  const applyPresetUnderstanding = () => {
    setTitle('Cek Pemahaman Materi');
    setIsAnonymous(true);
    setQuestions([
      {
        type: 'SCALE',
        prompt: 'Seberapa paham kamu dengan materi hari ini?',
        required: true,
        minLabel: 'Belum paham',
        maxLabel: 'Sangat paham',
        options: [],
      },
      {
        type: 'SHORT_TEXT',
        prompt: 'Bagian mana yang masih membingungkan?',
        required: false,
        minLabel: '',
        maxLabel: '',
        options: [],
      },
    ]);
  };

  const applyPresetReflection = () => {
    setTitle('Refleksi Akhir Pelajaran');
    setIsAnonymous(false);
    setQuestions([
      {
        type: 'SCALE',
        prompt: 'Tingkat kepuasan & pemahaman materi:',
        required: true,
        minLabel: 'Perlu bimbingan',
        maxLabel: 'Sangat paham',
        options: [],
      },
      {
        type: 'SHORT_TEXT',
        prompt: 'Apa satu hal baru yang kamu pelajari hari ini?',
        required: true,
        minLabel: '',
        maxLabel: '',
        options: [],
      },
    ]);
  };

  const handleAddQuestion = () => {
    if (questions.length >= 3) return;
    setQuestions((prev) => [
      ...prev,
      {
        type: 'SHORT_TEXT',
        prompt: '',
        required: true,
        minLabel: 'Belum paham',
        maxLabel: 'Sangat paham',
        options: ['Opsi A', 'Opsi B'],
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = questions.map((q) => ({
      type: q.type,
      prompt: q.prompt.trim(),
      required: q.required,
      scale:
        q.type === 'SCALE'
          ? {
              min: 1,
              max: 5,
              minLabel: q.minLabel.trim() || undefined,
              maxLabel: q.maxLabel.trim() || undefined,
            }
          : undefined,
      options:
        q.type === 'MULTIPLE_CHOICE'
          ? q.options.map((optText, optIdx) => ({
              id: `opt_${optIdx + 1}`,
              text: optText.trim() || `Opsi ${optIdx + 1}`,
            }))
          : undefined,
    }));

    onCreateActivity(title.trim() || 'Exit Ticket', isAnonymous, formatted);
    setShowCreateForm(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-ticket-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex h-[90vh] max-h-[780px] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="exit-ticket-dialog-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Exit Ticket / Refleksi Akhir
                </h2>
                {activity && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      activity.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : activity.status === 'CLOSED'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {activity.status === 'OPEN' && 'Terbuka'}
                    {activity.status === 'CLOSED' && 'Ditutup'}
                    {activity.status === 'DRAFT' && 'Draf'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ukur pemahaman dan kumpulkan umpan balik singkat sebelum kelas berakhir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activity && activity.status === 'CLOSED' && !showCreateForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Exit Ticket Baru
              </Button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Tutup panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Form View */}
          {isFormActive ? (
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  Gunakan Preset Cepat:
                </span>
                <button
                  type="button"
                  onClick={applyPresetUnderstanding}
                  className="rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Cek Pemahaman (Skala + Teks)
                </button>
                <button
                  type="button"
                  onClick={applyPresetReflection}
                  className="rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Refleksi Pelajaran (Bernama)
                </button>
              </div>

              {/* Title & Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Exit Ticket
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    placeholder="Contoh: Refleksi Pembelajaran Hari Ini"
                    className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="etAnonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label
                    htmlFor="etAnonymous"
                    className="text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    Kumpulkan Secara Anonim
                  </label>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Daftar Pertanyaan ({questions.length}/3)
                  </h4>
                  {questions.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddQuestion}
                      className="text-xs gap-1 h-7 border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Pertanyaan
                    </Button>
                  )}
                </div>

                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-850/50 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            handleUpdateQuestion(idx, {
                              type: e.target.value as ExitTicketQuestionType,
                            })
                          }
                          className="text-xs font-semibold rounded-lg border border-slate-300 bg-white p-1.5 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <option value="SCALE">Skala Nilai (1–5)</option>
                          <option value="SHORT_TEXT">Teks Singkat</option>
                          <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs cursor-pointer text-slate-600 dark:text-slate-400">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) =>
                              handleUpdateQuestion(idx, { required: e.target.checked })
                            }
                            className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600"
                          />
                          Wajib
                        </label>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Hapus pertanyaan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => handleUpdateQuestion(idx, { prompt: e.target.value })}
                        maxLength={300}
                        placeholder="Tuliskan pertanyaan refleksi di sini..."
                        className="w-full text-sm rounded-lg border border-slate-300 p-2 bg-white text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Scale Extra Configuration */}
                    {q.type === 'SCALE' && (
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div>
                          <label className="text-slate-500 block mb-0.5">Label Nilai 1 (Min)</label>
                          <input
                            type="text"
                            value={q.minLabel}
                            onChange={(e) =>
                              handleUpdateQuestion(idx, { minLabel: e.target.value })
                            }
                            placeholder="Contoh: Belum paham"
                            className="w-full rounded border border-slate-300 p-1.5 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block mb-0.5">Label Nilai 5 (Max)</label>
                          <input
                            type="text"
                            value={q.maxLabel}
                            onChange={(e) =>
                              handleUpdateQuestion(idx, { maxLabel: e.target.value })
                            }
                            placeholder="Contoh: Sangat paham"
                            className="w-full rounded border border-slate-300 p-1.5 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    )}

                    {/* Multiple Choice Options Configuration */}
                    {q.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2 pt-1">
                        <span className="text-xs text-slate-500 block">Pilihan Jawaban:</span>
                        {q.options.map((optText, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={optText}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateQuestion(idx, { options: newOpts });
                              }}
                              maxLength={100}
                              placeholder={`Opsi ${optIdx + 1}`}
                              className="flex-1 text-xs rounded border border-slate-300 p-1.5 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateQuestion(idx, {
                                    options: q.options.filter((_, oIdx) => oIdx !== optIdx),
                                  });
                                }}
                                className="text-slate-400 hover:text-red-500"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        {q.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateQuestion(idx, {
                                options: [...q.options, `Opsi ${q.options.length + 1}`],
                              });
                            }}
                            className="text-xs text-teal-600 font-medium hover:underline"
                          >
                            + Tambah Opsi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {activity && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={questions.some((q) => !q.prompt.trim())}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                >
                  <Play className="h-4 w-4" />
                  Simpan & Siapkan Exit Ticket
                </Button>
              </div>
            </form>
          ) : (
            /* Active Activity & Results View */
            <div className="space-y-6">
              {/* Activity Banner */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-5 dark:border-teal-900/60 dark:bg-teal-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Topik Refleksi
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                        {activity.isAnonymous ? 'Anonim' : 'Nama Peserta'}
                      </span>
                      <span>•</span>
                      <span>{activity.questions.length} Pertanyaan</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activity.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        onClick={onOpenActivity}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Buka Exit Ticket
                      </Button>
                    )}
                    {activity.status === 'OPEN' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onCloseActivity}
                        className="gap-1.5 text-xs border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <StopCircle className="h-3.5 w-3.5" />
                        Tutup Respon
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-teal-100 dark:border-teal-900/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-teal-600" />
                      Respon Masuk: {responseCount} / {totalExpected} peserta
                    </span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {completionRate}% selesai
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-teal-600 transition-all duration-300 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Questions Aggregates */}
              <div className="space-y-6">
                {activity.questions.map((question, idx) => {
                  const qAgg = aggregates?.questionAggregates[question.id];

                  return (
                    <div
                      key={question.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80 shadow-xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Pertanyaan #{idx + 1} •{' '}
                            {question.type === 'SCALE'
                              ? 'Skala 1-5'
                              : question.type === 'MULTIPLE_CHOICE'
                                ? 'Pilihan Ganda'
                                : 'Teks Singkat'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {question.prompt}
                          </h4>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {qAgg?.totalResponses || 0} jawaban
                        </span>
                      </div>

                      {/* Scale Aggregate Visualization */}
                      {question.type === 'SCALE' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800 font-bold text-base">
                              <Star className="h-4 w-4 fill-current" />
                              {qAgg?.scaleAverage ? qAgg.scaleAverage.toFixed(1) : '0.0'}
                              <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                            </div>
                            <span className="text-xs text-slate-500">Rata-rata kelas</span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {[5, 4, 3, 2, 1].map((val) => {
                              const count = qAgg?.scaleDistribution?.[val] || 0;
                              const total = qAgg?.totalResponses || 0;
                              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                              return (
                                <div key={val} className="flex items-center gap-3 text-xs">
                                  <span className="w-10 font-bold text-slate-600 dark:text-slate-300">
                                    Nilai {val}
                                  </span>
                                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-16 text-right text-slate-500">
                                    {count} ({pct}%)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Multiple Choice Aggregate Visualization */}
                      {question.type === 'MULTIPLE_CHOICE' && (
                        <div className="space-y-2">
                          {(question.options || []).map((opt) => {
                            const optData = qAgg?.choiceDistribution?.[opt.id];
                            const count = optData?.count || 0;
                            const pct = optData?.percentage || 0;

                            return (
                              <div key={opt.id} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                                  <span>{opt.text}</span>
                                  <span className="text-slate-500">
                                    {count} ({pct}%)
                                  </span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full bg-teal-600 rounded-full transition-all duration-300"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Short Text List Visualization */}
                      {question.type === 'SHORT_TEXT' && (
                        <div>
                          {!qAgg?.textResponses || qAgg.textResponses.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">
                              Belum ada respon tertulis yang masuk.
                            </p>
                          ) : (
                            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                              {qAgg.textResponses.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                                >
                                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                                      {item.authorName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatElapsed(item.submittedAt)}
                                    </span>
                                  </div>
                                  <p className="text-slate-800 dark:text-slate-200 break-words leading-relaxed">
                                    {item.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
