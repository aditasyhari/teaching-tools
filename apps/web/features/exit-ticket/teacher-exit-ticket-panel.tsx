'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
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
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@walikelas/ui';
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] h-[780px] overflow-hidden flex flex-col p-0 gap-0 border-[#e8e4dc] bg-[#faf8f5] dark:border-stone-800 dark:bg-stone-900 shadow-xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-[#e8e4dc] px-6 py-4 space-y-0 text-left bg-white dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 shrink-0">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Exit Ticket / Refleksi Akhir
                </DialogTitle>
                {activity && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activity.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : activity.status === 'CLOSED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {activity.status === 'OPEN' && 'Terbuka'}
                    {activity.status === 'CLOSED' && 'Ditutup'}
                    {activity.status === 'DRAFT' && 'Draf'}
                  </span>
                )}
              </div>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                Ukur pemahaman dan kumpulkan umpan balik singkat sebelum kelas berakhir
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            {activity && activity.status === 'CLOSED' && !showCreateForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="text-xs font-semibold gap-1.5 border-stone-300 dark:border-stone-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Exit Ticket Baru
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Form View */}
          {isFormActive ? (
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-stone-850 p-3.5 rounded-2xl border border-[#e8e4dc] dark:border-stone-800 shadow-2xs">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mr-1">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  Preset Cepat:
                </span>
                <button
                  type="button"
                  onClick={applyPresetUnderstanding}
                  className="rounded-xl bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold border border-[#e8e4dc] dark:border-stone-700 hover:border-teal-500 text-stone-700 dark:text-stone-200 transition-colors"
                >
                  Cek Pemahaman (Skala + Teks)
                </button>
                <button
                  type="button"
                  onClick={applyPresetReflection}
                  className="rounded-xl bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold border border-[#e8e4dc] dark:border-stone-700 hover:border-teal-500 text-stone-700 dark:text-stone-200 transition-colors"
                >
                  Refleksi Pelajaran (Bernama)
                </button>
              </div>

              {/* Title & Settings */}
              <div className="rounded-2xl border border-[#e8e4dc] bg-white p-5 dark:border-stone-800 dark:bg-stone-850 shadow-2xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Judul Exit Ticket
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      placeholder="Contoh: Refleksi Pembelajaran Hari Ini"
                      className="w-full text-sm rounded-xl border border-stone-200 p-3 bg-stone-50/60 text-stone-900 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 sm:pt-6">
                    <input
                      type="checkbox"
                      id="etAnonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label
                      htmlFor="etAnonymous"
                      className="text-xs font-bold cursor-pointer text-stone-700 dark:text-stone-300"
                    >
                      Kumpulkan Secara Anonim
                    </label>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Daftar Pertanyaan ({questions.length}/3)
                  </h4>
                  {questions.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddQuestion}
                      className="text-xs font-semibold gap-1 h-8 rounded-xl border-teal-600 text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah Pertanyaan
                    </Button>
                  )}
                </div>

                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#e8e4dc] bg-white p-5 dark:border-stone-800 dark:bg-stone-850 shadow-2xs space-y-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            handleUpdateQuestion(idx, {
                              type: e.target.value as ExitTicketQuestionType,
                            })
                          }
                          className="text-xs font-bold rounded-lg border border-stone-200 bg-stone-50/70 p-2 text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                        >
                          <option value="SCALE">Skala Nilai (1–5)</option>
                          <option value="SHORT_TEXT">Teks Singkat</option>
                          <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-stone-600 dark:text-stone-400">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) =>
                              handleUpdateQuestion(idx, { required: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-stone-300 text-teal-600"
                          />
                          Wajib
                        </label>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-red-600 p-1"
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
                        className="w-full text-sm rounded-xl border border-stone-200 p-3 bg-stone-50/60 text-stone-900 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                      />
                    </div>

                    {/* Scale Extra Configuration */}
                    {q.type === 'SCALE' && (
                      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                        <div>
                          <label className="text-stone-500 font-medium block mb-1">
                            Label Nilai 1 (Min)
                          </label>
                          <input
                            type="text"
                            value={q.minLabel}
                            onChange={(e) =>
                              handleUpdateQuestion(idx, { minLabel: e.target.value })
                            }
                            placeholder="Contoh: Belum paham"
                            className="w-full rounded-lg border border-stone-200 p-2 bg-stone-50/60 text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                          />
                        </div>
                        <div>
                          <label className="text-stone-500 font-medium block mb-1">
                            Label Nilai 5 (Max)
                          </label>
                          <input
                            type="text"
                            value={q.maxLabel}
                            onChange={(e) =>
                              handleUpdateQuestion(idx, { maxLabel: e.target.value })
                            }
                            placeholder="Contoh: Sangat paham"
                            className="w-full rounded-lg border border-stone-200 p-2 bg-stone-50/60 text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                          />
                        </div>
                      </div>
                    )}

                    {/* Multiple Choice Options Configuration */}
                    {q.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2 pt-1">
                        <span className="text-xs text-stone-500 font-semibold block">
                          Pilihan Jawaban:
                        </span>
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
                              className="flex-1 text-xs rounded-lg border border-stone-200 p-2 bg-stone-50/60 text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateQuestion(idx, {
                                    options: q.options.filter((_, oIdx) => oIdx !== optIdx),
                                  });
                                }}
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-red-600"
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
                            className="text-xs text-teal-700 font-bold hover:underline pt-1"
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
                    className="text-stone-600 hover:text-stone-900 font-semibold"
                  >
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  size="md"
                  disabled={questions.some((q) => !q.prompt.trim())}
                  className="bg-teal-700 hover:bg-teal-800 text-white gap-2 font-bold px-5 rounded-xl shadow-xs"
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
              <div className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 sm:p-6 dark:border-teal-900/40 dark:bg-teal-950/20 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                      Topik Refleksi
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-3 pt-1.5 text-xs text-stone-600 dark:text-stone-400">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
                        {activity.isAnonymous ? 'Anonim' : 'Nama Peserta'}
                      </span>
                      <span>•</span>
                      <span className="font-semibold">{activity.questions.length} Pertanyaan</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activity.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        onClick={onOpenActivity}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold rounded-xl"
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
                        className="gap-1.5 text-xs font-semibold rounded-xl border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <StopCircle className="h-3.5 w-3.5" />
                        Tutup Respon
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3.5 border-t border-teal-100 dark:border-teal-900/60">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                    <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-teal-700" />
                      Respon Masuk: {responseCount} / {totalExpected} peserta
                    </span>
                    <span className="text-teal-800 dark:text-teal-400">
                      {completionRate}% selesai
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
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
                      className="rounded-2xl border border-[#e8e4dc] bg-white p-5 sm:p-6 dark:border-stone-800 dark:bg-stone-850 shadow-2xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                            Pertanyaan #{idx + 1} •{' '}
                            {question.type === 'SCALE'
                              ? 'Skala 1-5'
                              : question.type === 'MULTIPLE_CHOICE'
                                ? 'Pilihan Ganda'
                                : 'Teks Singkat'}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                            {question.prompt}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-stone-500 dark:text-stone-400 whitespace-nowrap bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full">
                          {qAgg?.totalResponses || 0} jawaban
                        </span>
                      </div>

                      {/* Scale Aggregate Visualization */}
                      {question.type === 'SCALE' && (
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 font-bold text-base shadow-2xs">
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                              {qAgg?.scaleAverage ? qAgg.scaleAverage.toFixed(1) : '0.0'}
                              <span className="text-xs font-normal text-stone-400">/ 5.0</span>
                            </div>
                            <span className="text-xs text-stone-500 font-medium">Rata-rata kelas</span>
                          </div>

                          <div className="space-y-2 pt-1">
                            {[5, 4, 3, 2, 1].map((val) => {
                              const count = qAgg?.scaleDistribution?.[val] || 0;
                              const total = qAgg?.totalResponses || 0;
                              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                              return (
                                <div key={val} className="flex items-center gap-3 text-xs">
                                  <span className="w-12 font-bold text-stone-700 dark:text-stone-300">
                                    Nilai {val}
                                  </span>
                                  <div className="flex-1 h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                                    <div
                                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-20 text-right text-stone-500 font-medium">
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
                        <div className="space-y-2.5">
                          {(question.options || []).map((opt) => {
                            const optData = qAgg?.choiceDistribution?.[opt.id];
                            const count = optData?.count || 0;
                            const pct = optData?.percentage || 0;

                            return (
                              <div key={opt.id} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                                  <span>{opt.text}</span>
                                  <span className="text-stone-500">
                                    {count} ({pct}%)
                                  </span>
                                </div>
                                <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
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
                            <p className="text-xs text-stone-400 italic py-2">
                              Belum ada respon tertulis yang masuk.
                            </p>
                          ) : (
                            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                              {qAgg.textResponses.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3.5 text-xs dark:border-stone-800 dark:bg-stone-900/60 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                                    <span className="font-bold text-stone-700 dark:text-stone-300">
                                      {item.authorName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatElapsed(item.submittedAt)}
                                    </span>
                                  </div>
                                  <p className="text-stone-800 dark:text-stone-200 break-words leading-relaxed">
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
      </DialogContent>
    </Dialog>
  );
}
