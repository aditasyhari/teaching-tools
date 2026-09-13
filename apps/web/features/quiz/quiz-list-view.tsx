'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Play, Edit2, Trash2, Search, Layers, AlertCircle } from 'lucide-react';
import { Button, PageHeaderSection, EmptyState } from '@walikelas/ui';
import type { QuizSummary } from '@walikelas/types';
import { fetchTeacherQuizzes, deleteQuiz } from '@walikelas/api-client';
import { apiClient } from '../../lib/api';

export function QuizListView(): React.JSX.Element {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<QuizSummary | null>(null);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await fetchTeacherQuizzes(apiClient);
      setQuizzes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar kuis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    setDeletingId(showDeleteModal.id);
    try {
      await deleteQuiz(apiClient, showDeleteModal.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== showDeleteModal.id));
      setShowDeleteModal(null);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus kuis');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <PageHeaderSection
        title="Kuis Interaktif"
        description="Kelola kuis pilihan ganda yang dapat dimainkan bersama seluruh siswa secara realtime."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Kuis Interaktif', current: true },
        ]}
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/teacher/quizzes/new')}
          >
            Buat Kuis Baru
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul kuis..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium w-full sm:w-auto text-right">
          Total:{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">{quizzes.length}</span>{' '}
          Kuis
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Memuat daftar kuis...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12">
          <EmptyState
            title={search ? 'Kuis Tidak Ditemukan' : 'Belum Ada Kuis'}
            description={
              search
                ? 'Tidak ada kuis yang cocok dengan kata kunci pencarian Anda.'
                : 'Buat kuis pilihan ganda pertama Anda untuk mulai mengajar secara interaktif di kelas.'
            }
            action={
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => router.push('/teacher/quizzes/new')}
              >
                Buat Kuis Sekarang
              </Button>
            }
          />
        </div>
      ) : (
        /* Quizzes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {quiz.questionCount} Pertanyaan
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href="/teacher/sessions"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Mulai di Sesi
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/teacher/quizzes/${quiz.id}/edit`)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Kuis"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(quiz)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus Kuis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Hapus Kuis Ini?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Kuis{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  &ldquo;{showDeleteModal.title}&rdquo;
                </span>{' '}
                beserta seluruh pertanyaannya akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(null)}
                disabled={Boolean(deletingId)}
              >
                Batal
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={Boolean(deletingId)}>
                {deletingId ? 'Menghapus...' : 'Ya, Hapus Kuis'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
