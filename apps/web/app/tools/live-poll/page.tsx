'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart2, Play, CheckSquare, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { Button, Badge, PageHeaderSection } from '@walikelas/ui';

export default function LivePollToolPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageHeaderSection
        title="Jajak Pendapat Kilat (Live Poll)"
        description="Perkakas interaksi instan untuk mengukur pemahaman kelas, mengumpulkan suara opini, dan mendapatkan feedback seketika."
        breadcrumbs={[
          { label: 'Katalog Perkakas', href: '/tools' },
          { label: 'Live Poll', current: true },
        ]}
      />

      {/* Hero Showcase Card */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="default">Aktivitas Interaktif Realtime</Badge>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">Live Poll & Feedback Engine V1</h1>
          </div>
        </div>

        <p className="text-blue-200 text-base sm:text-lg max-w-2xl leading-relaxed">
          Ukur pemahaman murid seketika tanpa jeda. Murid memilih respon pilihan tunggal atau ganda
          dari HP mereka secara anonim atau bernama, dan distribusi suara langsung divisualisasikan
          dalam diagram persentase di depan kelas.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/teacher/polls">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold shadow-lg"
            >
              Kelola & Rancang Polling (Guru)
            </Button>
          </Link>
          <Link href="/join">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="font-bold border-blue-700 bg-blue-900/50 text-white hover:bg-blue-800"
            >
              Gabung sebagai Murid
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">1-Klik Quick Feedback Presets</h3>
          <p className="text-sm text-muted-foreground">
            Gunakan template siap pakai seperti "Tingkat Pemahaman", "Kesiapan Lanjut", dan
            "Evaluasi Kecepatan" untuk memulai polling dalam 3 detik.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Penguncian Satu Respon (Anti-Double Vote)
          </h3>
          <p className="text-sm text-muted-foreground">
            Server memverifikasi kepemilikan sesi dan mengunci respon per murid secara otoritatif
            sehingga data jajak pendapat akurat dan bebas manipulasi.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Distribusi Suara Realtime</h3>
          <p className="text-sm text-muted-foreground">
            Persentase dan jumlah suara bergerak secara dinamis seiring murid mengklik opsi,
            memberikan visualisasi instan di konsol guru dan layar proyektor.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Dukungan Single & Multiple Choice</h3>
          <p className="text-sm text-muted-foreground">
            Pilih mode respon cepat satu pilihan (1 tap submit) atau mode banyak pilihan sesuai
            format pertanyaan diskusi Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
