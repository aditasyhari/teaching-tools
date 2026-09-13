'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Circle,
  Save,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { Button, Input, PageHeaderSection } from '@walikelas/ui';
import type { Quiz } from '@walikelas/types';
import { createQuiz, updateQuiz } from '@walikelas/api-client';
import { apiClient } from '../../lib/api';

interface QuestionFormState {
  id?: string;
  text: string;
  points: number;
  timeLimitSeconds: number;
  options: Array<{
    id?: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface QuizEditorViewProps {
  initialQuiz?: Quiz;
  isEditing?: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = [
  'border-rose-300 dark:border-rose-800 focus-within:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20',
  'border-blue-300 dark:border-blue-800 focus-within:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20',
  'border-amber-300 dark:border-amber-800 focus-within:border-amber-500 bg-amber-50/20 dark:bg-amber-950/20',
  'border-emerald-300 dark:border-emerald-800 focus-within:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20',
];

const OPTION_BADGE_COLORS = [
  'bg-rose-500 text-white',
  'bg-blue-500 text-white',
  'bg-amber-500 text-white',
  'bg-emerald-500 text-white',
];

export function QuizEditorView({
  initialQuiz,
  isEditing = false,
}: QuizEditorViewProps): React.JSX.Element {
  const router = useRouter();

  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(
    initialQuiz?.settings?.timeLimitSeconds || 30,
  );
  const [showLeaderboard, setShowLeaderboard] = useState(
    initialQuiz?.settings?.showLeaderboard ?? true,
  );
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(
    initialQuiz?.settings?.showCorrectAnswer ?? true,
  );

  const [questions, setQuestions] = useState<QuestionFormState[]>(() => {
    if (initialQuiz?.questions && initialQuiz.questions.length > 0) {
      return initialQuiz.questions.map((q) => ({
        id: q.id,
        text: q.questionText,
        points: q.points,
        timeLimitSeconds: q.timeLimitSeconds ?? 30,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.optionText,
          isCorrect: o.isCorrect ?? false,
        })),
      }));
    }
    return [
      {
        text: '',
        points: 100,
        timeLimitSeconds: 30,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add new blank question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: '',
        points: 100,
        timeLimitSeconds: defaultTimeLimit,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      setError('Kuis minimal harus memiliki 1 pertanyaan.');
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
    setError(null);
  };

  // Move question
  const handleMoveQuestion = (qIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? qIndex - 1 : qIndex + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[qIndex]!;
      copy[qIndex] = copy[targetIndex]!;
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Update question text
  const handleQuestionTextChange = (qIndex: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex]!, text };
      return copy;
    });
    setError(null);
  };

  // Update question options
  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = copy[qIndex]!;
      const opts = [...q.options];
      opts[optIndex] = { ...opts[optIndex]!, text };
      copy[qIndex] = { ...q, options: opts };
      return copy;
    });
    setError(null);
  };

  // Pick correct option
  const handleSelectCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = copy[qIndex]!;
      const opts = q.options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === optIndex,
      }));
      copy[qIndex] = { ...q, options: opts };
      return copy;
    });
  };

  // Form submit
  const handleSave = async () => {
    if (!title.trim()) {
      setError('Judul kuis tidak boleh kosong.');
      return;
    }

    if (questions.length === 0) {
      setError('Kuis harus memiliki minimal 1 pertanyaan.');
      return;
    }

    // Validate questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      if (!q.text.trim()) {
        setError(`Pertanyaan #${i + 1} belum memiliki teks pertanyaan.`);
        return;
      }
      const filledOptions = q.options.filter((o) => o.text.trim().length > 0);
      if (filledOptions.length < 2) {
        setError(`Pertanyaan #${i + 1} harus memiliki minimal 2 pilihan jawaban yang terisi.`);
        return;
      }
      const correctCount = q.options.filter((o) => o.isCorrect && o.text.trim().length > 0).length;
      if (correctCount !== 1) {
        setError(`Pertanyaan #${i + 1} harus memiliki tepat 1 pilihan jawaban benar yang terisi.`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      settings: {
        timeLimitSeconds: defaultTimeLimit,
        showLeaderboard,
        showCorrectAnswer,
      },
      questions: questions.map((q) => ({
        text: q.text.trim(),
        points: q.points,
        timeLimitSeconds: q.timeLimitSeconds,
        options: q.options
          .filter((o) => o.text.trim().length > 0)
          .map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          })),
      })),
    };

    try {
      if (isEditing && initialQuiz) {
        await updateQuiz(apiClient, initialQuiz.id, payload);
      } else {
        await createQuiz(apiClient, payload);
      }
      router.push('/teacher/quizzes');
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kuis');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <PageHeaderSection
        title={isEditing ? 'Edit Kuis Interaktif' : 'Buat Kuis Baru'}
        description="Rancang pertanyaan pilihan ganda yang menarik untuk kuis realtime di kelas."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Kuis Interaktif', href: '/teacher/quizzes' },
          { label: isEditing ? 'Edit Kuis' : 'Buat Baru', current: true },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/teacher/quizzes')}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan Kuis'}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Informasi Utama Kuis
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Judul Kuis <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="Contoh: Kuis Harian IPA - Bab 3 Sistem Pencernaan"
              required
              className="text-base font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Deskripsi Singkat (Opsional)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: 10 soal pilihan ganda materi pencernaan manusia"
            />
          </div>

          {/* Settings grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Batas Waktu Standar
              </label>
              <select
                value={defaultTimeLimit}
                onChange={(e) => setDefaultTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10 Detik</option>
                <option value={15}>15 Detik</option>
                <option value={20}>20 Detik</option>
                <option value={30}>30 Detik</option>
                <option value={45}>45 Detik</option>
                <option value={60}>60 Detik</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4 sm:pt-6">
              <input
                type="checkbox"
                id="showLeaderboard"
                checked={showLeaderboard}
                onChange={(e) => setShowLeaderboard(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <label
                htmlFor="showLeaderboard"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Tampilkan Leaderboard
              </label>
            </div>

            <div className="flex items-center gap-3 pt-4 sm:pt-6">
              <input
                type="checkbox"
                id="showCorrectAnswer"
                checked={showCorrectAnswer}
                onChange={(e) => setShowCorrectAnswer(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <label
                htmlFor="showCorrectAnswer"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Ungkap Kunci Jawaban
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Daftar Pertanyaan
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold">
            {questions.length} Pertanyaan
          </span>
        </h2>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleAddQuestion}
        >
          Tambah Pertanyaan
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 relative"
          >
            {/* Question Card Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {qIndex + 1}
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Pertanyaan #{qIndex + 1}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Reorder buttons */}
                <button
                  type="button"
                  onClick={() => handleMoveQuestion(qIndex, 'up')}
                  disabled={qIndex === 0}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Geser ke atas"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveQuestion(qIndex, 'down')}
                  disabled={qIndex === questions.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Geser ke bawah"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-2"
                  title="Hapus pertanyaan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Teks Pertanyaan
              </label>
              <Input
                value={q.text}
                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                placeholder="Ketikkan teks pertanyaan di sini..."
                className="text-base"
              />
            </div>

            {/* Options Builder */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Pilihan Jawaban (Pilih satu lingkaran sebagai Kunci Jawaban Benar)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, optIndex) => (
                  <div
                    key={optIndex}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      OPTION_COLORS[optIndex % 4]
                    } ${opt.isCorrect ? 'ring-2 ring-emerald-500 shadow-sm' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectCorrectOption(qIndex, optIndex)}
                      className="p-1 rounded-full text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                      title={opt.isCorrect ? 'Jawaban Benar' : 'Jadikan Jawaban Benar'}
                    >
                      {opt.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                        OPTION_BADGE_COLORS[optIndex % 4]
                      }`}
                    >
                      {OPTION_LABELS[optIndex]}
                    </span>

                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                      placeholder={`Pilihan ${OPTION_LABELS[optIndex]}`}
                      className="w-full bg-transparent border-none text-sm font-medium focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Add Question Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="secondary"
          size="lg"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={handleAddQuestion}
        >
          Tambah Pertanyaan Baru
        </Button>
      </div>
    </div>
  );
}
