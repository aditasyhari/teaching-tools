'use client';

import React from 'react';
import {
  Clock,
  Shuffle,
  HelpCircle,
  BarChart2,
  Plus,
  Play,
  ArrowRight,
  Radio,
  FolderPlus,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeaderSection, StatsOverview, EmptyState, Button, Badge, Card } from '@walikelas/ui';

export default function TeacherHomePage(): React.JSX.Element {
  const stats = [
    {
      label: 'Sesi Kelas Aktif',
      value: '0',
      description: 'Tidak ada sesi berjalan',
    },
    {
      label: 'Aktivitas Tersimpan',
      value: '8',
      change: '+2 baru',
      changeType: 'positive' as const,
      description: 'Kuis, polling, dan materi',
    },
    {
      label: 'Total Pertanyaan Kuis',
      value: '42',
      description: 'Bank kuis siap pakai',
    },
    {
      label: 'Catatan Kelas',
      value: '5',
      description: 'Catatan evaluasi pengajaran',
    },
  ];

  const quickLaunchTools = [
    {
      id: 'timer',
      name: 'Timer Kelas',
      category: 'Utilitas Lokal',
      desc: 'Hitung mundur pengerjaan tugas atau istirahat',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      href: '/teacher/tools?launch=timer',
    },
    {
      id: 'random-picker',
      name: 'Pemilih Acak',
      category: 'Utilitas Lokal',
      desc: 'Pilih nama siswa atau giliran menjawab secara adil',
      icon: <Shuffle className="w-5 h-5 text-violet-600" />,
      href: '/teacher/tools?launch=random-picker',
    },
    {
      id: 'live-quiz',
      name: 'Live Quiz',
      category: 'Interaktif Realtime',
      desc: 'Mulai kuis seru langsung dengan leaderboard di layar',
      icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
      href: '/teacher/tools?launch=live-quiz',
    },
    {
      id: 'live-poll',
      name: 'Live Poll',
      category: 'Interaktif Realtime',
      desc: 'Jajak pendapat cepat untuk cek pemahaman konsep',
      icon: <BarChart2 className="w-5 h-5 text-emerald-600" />,
      href: '/teacher/tools?launch=live-poll',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Header */}
      <PageHeaderSection
        title="Selamat Datang di Ruang Guru"
        description="Pusat kendali perkakas pembelajaran interaktif di kelas Anda hari ini."
        badge={
          <Badge variant="default" size="sm">
            Tahun Ajaran Aktif
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/teacher/activities">
              <Button variant="secondary" size="md" leftIcon={<FolderPlus className="w-4 h-4" />}>
                Buat Kuis / Aktivitas
              </Button>
            </Link>
            <Link href="/teacher/sessions">
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Mulai Sesi Kelas
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Overview */}
      <StatsOverview stats={stats} columns={4} />

      {/* Quick Tool Launch Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Perkakas Cepat</h2>
            <p className="text-xs text-stone-500">
              Luncurkan perkakas yang paling sering digunakan dalam hitungan detik.
            </p>
          </div>
          <Link
            href="/teacher/tools"
            className="text-xs font-bold text-stone-700 hover:text-stone-950 hover:underline flex items-center gap-1"
          >
            <span>Lihat semua 13 perkakas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLaunchTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex"
            >
              <Card className="p-5 w-full flex flex-col justify-between group-hover:border-amber-300 group-hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/70 group-hover:bg-amber-500 group-hover:border-amber-500 flex items-center justify-center transition-all">
                      {tool.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-stone-400">{tool.category}</span>
                  </div>
                  <h3 className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{tool.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-800">
                  <span>Buka Sekarang</span>
                  <Play className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Classroom Session Engine Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Sesi Kelas Berjalan</h2>
            <p className="text-xs text-stone-500">
              Hubungkan layar proyektor kelas dengan gawai murid.
            </p>
          </div>
        </div>

        <EmptyState
          icon={<Radio className="w-6 h-6 text-slate-400" />}
          title="Tidak Ada Sesi Kelas yang Aktif"
          description="Mulai sesi baru untuk mendapatkan kode 6 digit yang dapat diproyeksikan dan dimasuki murid."
          action={
            <Link href="/teacher/sessions">
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Mulai Sesi Kelas Sekarang
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
