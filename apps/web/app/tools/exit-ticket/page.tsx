'use client';

import React from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Play,
  ShieldCheck,
  ArrowRight,
  EyeOff,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { Button, Badge, PageHeaderSection } from '@walikelas/ui';

export default function ExitTicketToolPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageHeaderSection
        title="Tiket Keluar (Exit Ticket / Quick Reflection)"
        description="Alat refleksi interaktif realtime di akhir pembelajaran untuk mengumpulkan pemahaman materi, umpan balik ringkas, dan sentimen murid secara terstruktur."
        breadcrumbs={[
          { label: 'Katalog Perkakas', href: '/tools' },
          { label: 'Tiket Keluar', current: true },
        ]}
      />

      {/* Hero Showcase Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-violet-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="default">Aktivitas Interaktif Realtime</Badge>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Tiket Keluar / Quick Reflection V1
            </h1>
          </div>
        </div>

        <p className="text-indigo-200 text-base sm:text-lg max-w-2xl leading-relaxed">
          Ketahui tingkat pemahaman materi kelas sebelum murid melangkah keluar. Guru dapat membuka
          1–3 pertanyaan refleksi (skala pemahaman 1–5, pilihan ganda, atau teks singkat) dan
          melihat agregasi hasil secara instan tanpa perlu pemeriksaan manual.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/teacher/sessions">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold shadow-lg"
            >
              Mulai di Sesi Kelas (Guru)
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
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">1–3 Pertanyaan Terarah</h3>
          <p className="text-sm text-muted-foreground">
            Mendukung tipe skala pemahaman 1–5 dengan label khusus, pilihan ganda tunggal, dan teks
            singkat hingga 300 karakter untuk refleksi mendalam.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Satu Respon per Murid</h3>
          <p className="text-sm text-muted-foreground">
            Setiap murid hanya dapat mengirimkan jawaban 1 kali per tiket. Dilengkapi proteksi
            cooldown 3 detik dan validasi server-authoritative yang aman.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Privasi & Opsi Anonim</h3>
          <p className="text-sm text-muted-foreground">
            Jawaban murid hanya dapat dilihat oleh guru dan tidak dibagikan ke sesama murid. Opsi
            anonim membuat murid lebih jujur dan terbuka dalam menyampaikan kesulitan.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Agregasi Realtime Instan</h3>
          <p className="text-sm text-muted-foreground">
            Guru langsung melihat statistik rata-rata skala, distribusi bintang/skor 1–5, grafik
            persentase opsi, serta completion rate terhadap jumlah murid yang hadir.
          </p>
        </div>
      </div>
    </div>
  );
}
