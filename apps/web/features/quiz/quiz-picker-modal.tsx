'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Play, Layers, Plus } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@walikelas/ui';
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {/* Modal Header */}
        <DialogHeader className="border-b border-border pb-3 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Pilih Kuis untuk Dimulai
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pilih kuis dari bank soal yang ingin dimainkan bersama siswa di sesi ini.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Memuat kuis tersimpan...</span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
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
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm'
                      : 'border-border hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground">
                      {quiz.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-blue-500" />
                        {quiz.questionCount} Soal
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-border'
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
          <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              onClick={handleStart}
              disabled={!selectedId}
              className="font-bold bg-blue-600 hover:bg-blue-500"
            >
              Mulai Kuis di Sesi Ini
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
