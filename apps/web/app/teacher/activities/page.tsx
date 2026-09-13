'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, Plus, HelpCircle, BarChart2, Layers, Play, Clock } from 'lucide-react';
import { PageHeaderSection, SearchField, EmptyState, Button, Badge } from '@walikelas/ui';

interface MockActivity {
  id: string;
  title: string;
  type: 'QUIZ' | 'POLL' | 'FLASHCARDS';
  itemCount: number;
  updatedAt: string;
}

export default function TeacherActivitiesPage(): React.JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'QUIZ' | 'POLL' | 'FLASHCARDS'>('ALL');

  const [activities] = useState<MockActivity[]>([
    {
      id: 'act-1',
      title: 'Kuis Diagnostik Bab 1: Tata Surya & Gravitasi',
      type: 'QUIZ',
      itemCount: 10,
      updatedAt: 'Kemarin',
    },
    {
      id: 'act-2',
      title: 'Polling Refleksi Pemahaman Pecahan Senilai',
      type: 'POLL',
      itemCount: 4,
      updatedAt: '3 hari yang lalu',
    },
    {
      id: 'act-3',
      title: 'Kartu Kosakata Bahasa Inggris: Daily Routines',
      type: 'FLASHCARDS',
      itemCount: 25,
      updatedAt: '1 minggu yang lalu',
    },
  ]);

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
    FLASHCARDS: {
      label: 'Flashcards',
      variant: 'success' as const,
      icon: <Layers className="w-3.5 h-3.5" />,
    },
  };

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Aktivitas Tersimpan"
        description="Kelola kuis, jajak pendapat, dan kartu materi yang siap digunakan di kelas."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Aktivitas Tersimpan', current: true },
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

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {(['ALL', 'QUIZ', 'POLL', 'FLASHCARDS'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'ALL'
                ? 'Semua'
                : t === 'QUIZ'
                  ? 'Kuis'
                  : t === 'POLL'
                    ? 'Polling'
                    : 'Flashcards'}
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6 text-slate-400" />}
          title="Tidak Ada Aktivitas Ditemukan"
          description="Coba ubah kata kunci pencarian atau buat kuis baru untuk kelas Anda."
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/teacher/quizzes/new')}
            >
              Buat Kuis Baru
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant={typeBadges[item.type].variant} size="sm">
                    <span className="flex items-center gap-1">
                      {typeBadges[item.type].icon}
                      {typeBadges[item.type].label}
                    </span>
                  </Badge>
                  <span className="text-xs text-slate-400">{item.itemCount} item</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h3>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Diubah {item.updatedAt}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  onClick={() => alert(`Meluncurkan "${item.title}" di kelas.`)}
                >
                  Gunakan
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
