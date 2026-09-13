'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchQuiz } from '@walikelas/api-client';
import type { Quiz } from '@walikelas/types';
import { QuizEditorView } from '../../../../../features/quiz/quiz-editor-view';
import { apiClient } from '../../../../../lib/api';
import { EmptyState, Button } from '@walikelas/ui';
import { ArrowLeft } from 'lucide-react';

export default function EditQuizPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchQuiz(apiClient, quizId);
        if (mounted) {
          setQuiz(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Kuis tidak ditemukan');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Memuat data kuis...
        </p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <EmptyState
          title="Kuis Tidak Ditemukan"
          description={
            error || 'Kuis yang ingin Anda edit tidak ditemukan atau Anda tidak memiliki akses.'
          }
          action={
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/teacher/quizzes')}
            >
              Kembali ke Daftar Kuis
            </Button>
          }
        />
      </div>
    );
  }

  return <QuizEditorView initialQuiz={quiz} isEditing={true} />;
}
