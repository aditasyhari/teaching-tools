'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Play, Edit2, Trash2, Search, BarChart2, AlertCircle } from 'lucide-react';
import { Button, PageHeaderSection, EmptyState } from '@walikelas/ui';
import type { PollSummary } from '@walikelas/types';
import { fetchTeacherPolls, deletePoll } from '@walikelas/api-client';
import { apiClient } from '../../lib/api';

export function PollListView(): React.JSX.Element {
  const router = useRouter();
  const [polls, setPolls] = useState<PollSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<PollSummary | null>(null);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const data = await fetchTeacherPolls(apiClient);
      setPolls(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar polling');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    setDeletingId(showDeleteModal.id);
    try {
      await deletePoll(apiClient, showDeleteModal.id);
      setPolls((prev) => prev.filter((p) => p.id !== showDeleteModal.id));
      setShowDeleteModal(null);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus polling');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = polls.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.question.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <PageHeaderSection
        title="Live Poll & Feedback"
        description="Kelola jajak pendapat kilat untuk memeriksa pemahaman kelas, mengumpulkan opini, dan mendapatkan feedback seketika."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Live Poll', current: true },
        ]}
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/teacher/polls/new')}
          >
            Buat Polling Baru
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari judul atau pertanyaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 bg-muted/40 animate-pulse rounded-xl border border-border"
            />
          ))}
        </div>
      ) : polls.length === 0 ? (
        <EmptyState
          icon={<BarChart2 className="w-12 h-12 text-muted-foreground" />}
          title="Belum Ada Polling"
          description="Anda belum memiliki polling yang tersimpan. Buat polling pertama Anda atau gunakan preset quick feedback untuk memeriksa pemahaman kelas."
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/teacher/polls/new')}
            >
              Buat Polling Pertama
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground text-sm">
            Tidak ada polling yang cocok dengan pencarian "{search}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((poll) => (
            <div
              key={poll.id}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      poll.type === 'MULTIPLE_CHOICE'
                        ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {poll.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Pilihan Tunggal'}
                  </span>
                  <span className="text-xs text-muted-foreground">{poll.optionCount} opsi</span>
                </div>

                <h3 className="font-semibold text-foreground text-base line-clamp-1 mb-1">
                  {poll.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{poll.question}</p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  onClick={() => router.push(`/teacher/sessions?startPoll=${poll.id}`)}
                  className="flex-1 text-xs"
                >
                  Mulai Polling
                </Button>
                <Link href={`/teacher/polls/${poll.id}/edit`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteModal(poll)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Hapus Polling?</h3>
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus polling{' '}
              <strong className="text-foreground">"{showDeleteModal.title}"</strong>? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(null)}
                disabled={deletingId !== null}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deletingId !== null}
              >
                {deletingId !== null ? 'Menghapus...' : 'Hapus Polling'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
