'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Play, X, Layers, Plus } from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { QuizSummary } from '@walikelas/types';
import { fetchTeacherQuizzes } from '@walikelas/api-client';
import { apiClient } from '../../lib/api';
import Link from 'next/link';

interface QuizPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuiz: (quizId: string) => void;
}

export function QuizPickerModal({
  isOpen,
  onClose,
  onSelectQuiz,
}: QuizPickerModalProps): React.JSX.Element | null {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchTeacherQuizzes(apiClient);
        if (mounted) {
          setQuizzes(data);
          if (data.length > 0) {
            setSelectedId(data[0]!.id);
          }
        }
      } catch {
        // Handle error silently or show empty
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleStart = () => {
    if (!selectedId) return;
    onSelectQuiz(selectedId);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-picker-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 id="quiz-picker-dialog-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Pilih Kuis untuk Dimulai
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Memuat kuis tersimpan...</span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Anda belum memiliki kuis yang siap dimainkan.
            </p>
            <Link href="/teacher/quizzes/new" onClick={onClose}>
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Buat Kuis Baru Sekarang
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {quizzes.map((quiz) => {
              const isSelected = selectedId === quiz.id;
              return (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedId(quiz.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {quiz.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        {quiz.questionCount} Soal
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Actions */}
        {quizzes.length > 0 && (
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              onClick={handleStart}
              disabled={!selectedId}
              className="font-bold bg-indigo-600 hover:bg-indigo-500"
            >
              Mulai Kuis di Sesi Ini
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
