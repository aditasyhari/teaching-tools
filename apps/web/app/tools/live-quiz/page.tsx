import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { HelpCircle, Play, Trophy, ShieldCheck, Zap, BarChart2, ArrowRight } from 'lucide-react';
import { Button, PageHeaderSection } from '@walikelas/ui';

export const metadata: Metadata = {
  title: 'Kuis Interaktif (Live Quiz) — Asesmen Realtime',
  description:
    'Ajak seluruh siswa menjawab soal kuis pilihan ganda secara serentak dari ponsel tanpa akun dengan papan peringkat podium dan visualisasi realtime.',
  alternates: {
    canonical: '/tools/live-quiz',
  },
};

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
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100/70 text-blue-900 border border-blue-200/60">
              Aktivitas Interaktif Kelas
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Live Quiz Engine
            </h1>
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Tingkatkan keterlibatan murid di kelas dengan kuis pilihan ganda yang interaktif. Murid
          bergabung tanpa login menggunakan kode sesi singkat, menjawab langsung dari HP/laptop, dan
          melihat distribusi jawaban serta papan peringkat secara langsung.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/teacher/quizzes">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-xs min-h-[42px]"
            >
              Kelola & Rancang Kuis (Guru)
            </Button>
          </Link>
          <Link href="/join">
            <Button
              variant="secondary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold border-[#e8e4dc] hover:bg-stone-100 hover:text-stone-900 text-stone-700 min-h-[42px]"
            >
              Gabung Sesi sebagai Murid
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-blue-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-2xs">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            Sinkronisasi Realtime
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Didukung WebSocket terintegrasi. Pergantian soal, penghitungan mundur, dan penutupan
            soal terjadi serempak pada seluruh perangkat murid.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-emerald-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            Anti-Cheat & Server-Authoritative
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Kunci jawaban tidak pernah dibocorkan ke browser murid. Penilaian poin dan validasi
            batas waktu dilakukan secara ketat di server.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-blue-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-2xs">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            Distribusi Jawaban Langsung
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Guru dapat langsung melihat berapa persen murid yang memilih opsi A, B, C, atau D untuk
            mendeteksi miskonsepsi secara akurat.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-amber-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shadow-2xs">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            Leaderboard Podium
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Papan peringkat transparan yang mengapresiasi partisipasi murid dengan medali juara di
            akhir permainan.
          </p>
        </div>
      </div>
    </div>
  );
}
