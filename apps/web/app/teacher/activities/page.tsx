'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  HelpCircle,
  BarChart2,
  Play,
  Clock,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { PageHeaderSection, SearchField, EmptyState, Button, Badge, Spinner } from '@walikelas/ui';
import { fetchTeacherQuizzes, fetchTeacherPolls } from '@walikelas/api-client';
import { apiClient } from '../../../lib/api';

interface RealActivityItem {
  id: string;
  title: string;
  type: 'QUIZ' | 'POLL';
  itemCount: number;
  itemLabel: string;
  updatedAt: string;
  launchUrl: string;
  editUrl: string;
}

export default function TeacherActivitiesPage(): React.JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'QUIZ' | 'POLL'>('ALL');
  const [activities, setActivities] = useState<RealActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const [quizzesRes, pollsRes] = await Promise.allSettled([
        fetchTeacherQuizzes(apiClient),
        fetchTeacherPolls(apiClient),
      ]);

      const items: RealActivityItem[] = [];

      if (quizzesRes.status === 'fulfilled') {
        quizzesRes.value.forEach((q) => {
          items.push({
            id: q.id,
            title: q.title,
            type: 'QUIZ',
            itemCount: q.questionCount || 0,
            itemLabel: 'pertanyaan',
            updatedAt: new Date(q.updatedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            }),
            launchUrl: `/teacher/sessions?startQuiz=${q.id}`,
            editUrl: `/teacher/quizzes/${q.id}/edit`,
          });
        });
      }

      if (pollsRes.status === 'fulfilled') {
        pollsRes.value.forEach((p) => {
          items.push({
            id: p.id,
            title: p.title,
            type: 'POLL',
            itemCount: p.optionCount || 0,
            itemLabel: 'opsi jawaban',
            updatedAt: new Date(p.updatedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            }),
            launchUrl: `/teacher/sessions?startPoll=${p.id}`,
            editUrl: `/teacher/polls/${p.id}/edit`,
          });
        });
      }

      setActivities(items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat aktivitas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const filtered = activities.filter((act) => {
    if (typeFilter !== 'ALL' && act.type !== typeFilter) return false;
    if (search && !act.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeBadges = {
    QUIZ: {
      label: 'Kuis Interaktif',
      variant: 'default' as const,
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    POLL: {
      label: 'Polling Cepat',
      variant: 'neutral' as const,
      icon: <BarChart2 className="w-3.5 h-3.5" />,
    },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <PageHeaderSection
        title="Bank Aktivitas Pembelajaran"
        description="Kelola seluruh kuis dan jajak pendapat interaktif yang siap dimainkan langsung di hadapan siswa."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Bank Aktivitas', current: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/teacher/polls/new')}
            >
              Buat Polling
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/teacher/quizzes/new')}
            >
              Buat Kuis
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {(['ALL', 'QUIZ', 'POLL'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'ALL' ? 'Semua Aktivitas' : t === 'QUIZ' ? 'Kuis' : 'Polling'}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <SearchField
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Cari judul aktivitas..."
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-500">Memuat bank aktivitas...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6 text-slate-400" />}
          title={search ? 'Aktivitas Tidak Ditemukan' : 'Belum Ada Aktivitas'}
          description={
            search
              ? 'Tidak ditemukan kuis atau polling dengan kata kunci tersebut.'
              : 'Buat kuis pilihan ganda atau polling cepat pertama Anda untuk mulai berinteraksi dengan siswa.'
          }
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => router.push('/teacher/polls/new')}
              >
                Buat Polling
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => router.push('/teacher/quizzes/new')}
              >
                Buat Kuis Baru
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-sm transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant={typeBadges[item.type].variant} size="sm">
                    <span className="flex items-center gap-1">
                      {typeBadges[item.type].icon}
                      {typeBadges[item.type].label}
                    </span>
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {item.itemCount} {item.itemLabel}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                  {item.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.updatedAt}
                </span>

                <div className="flex items-center gap-1.5">
                  <Link href={item.editUrl}>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Aktivitas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                    onClick={() => router.push(item.launchUrl)}
                  >
                    Mulai di Sesi
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
