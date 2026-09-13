'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Play, Trophy, ShieldCheck, Zap, BarChart2, ArrowRight } from 'lucide-react';
import { Button, Badge, PageHeaderSection } from '@walikelas/ui';

export default function LiveQuizToolPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageHeaderSection
        title="Kuis Interaktif (Live Quiz)"
        description="Perkakas asesmen formatif realtime untuk kelas yang aktif, seru, dan kompetitif secara positif."
        breadcrumbs={[
          { label: 'Katalog Perkakas', href: '/tools' },
          { label: 'Kuis Interaktif', current: true },
        ]}
      />

      {/* Hero Showcase Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="default">Aktivitas Interaktif Realtime</Badge>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">Live Quiz Engine V1</h1>
          </div>
        </div>

        <p className="text-indigo-200 text-base sm:text-lg max-w-2xl leading-relaxed">
          Tingkatkan keterlibatan murid di kelas dengan kuis pilihan ganda yang interaktif. Murid
          bergabung tanpa login menggunakan kode sesi singkat, menjawab langsung dari HP/laptop, dan
          melihat distribusi jawaban serta papan peringkat secara langsung.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/teacher/quizzes">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg"
            >
              Kelola & Rancang Kuis (Guru)
            </Button>
          </Link>
          <Link href="/join">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="font-bold border-indigo-700 bg-indigo-900/50 text-white hover:bg-indigo-800"
            >
              Gabung sebagai Murid
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Sinkronisasi Realtime
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Didukung WebSocket terintegrasi. Pergantian soal, penghitungan mundur, dan penutupan
            soal terjadi serempak pada seluruh perangkat murid.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Anti-Cheat & Server-Authoritative
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Kunci jawaban tidak pernah dibocorkan ke browser murid. Penilaian poin dan validasi
            batas waktu dilakukan secara ketat di server.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Distribusi Jawaban Langsung
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Guru dapat langsung melihat berapa persen murid yang memilih opsi A, B, C, atau D untuk
            mendeteksi miskonsepsi secara akurat.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Leaderboard Podium
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Papan peringkat transparan yang mengapresiasi partisipasi murid dengan medali juara di
            akhir permainan.
          </p>
        </div>
      </div>
    </div>
  );
}
