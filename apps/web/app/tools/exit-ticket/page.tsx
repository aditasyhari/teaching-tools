import type { Metadata } from 'next';
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
import { Button, PageHeaderSection } from '@walikelas/ui';

export const metadata: Metadata = {
  title: 'Tiket Keluar (Exit Ticket) — Refleksi Akhir Kelas',
  description:
    'Alat refleksi interaktif realtime di akhir sesi belajar untuk mengevaluasi pemahaman materi dan umpan balik murid secara terstruktur.',
  alternates: {
    canonical: '/tools/exit-ticket',
  },
};

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
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100/70 text-rose-900 border border-rose-200/60">
              Aktivitas Interaktif Kelas
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Tiket Keluar / Quick Reflection
            </h1>
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Ketahui tingkat pemahaman materi kelas sebelum murid melangkah keluar. Guru dapat membuka
          1–3 pertanyaan refleksi (skala pemahaman 1–5, pilihan ganda, atau teks singkat) dan
          melihat agregasi hasil secara instan tanpa perlu pemeriksaan manual.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/teacher/sessions">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-xs min-h-[42px]"
            >
              Mulai di Sesi Kelas (Guru)
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
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-rose-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">1–3 Pertanyaan Terarah</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Mendukung tipe skala pemahaman 1–5 dengan label khusus, pilihan ganda tunggal, dan teks
            singkat hingga 300 karakter untuk refleksi mendalam.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-emerald-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Satu Respon per Murid</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Setiap murid hanya dapat mengirimkan jawaban 1 kali per tiket. Dilengkapi proteksi
            cooldown 3 detik dan validasi server-authoritative yang aman.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-blue-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-2xs">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Privasi & Opsi Anonim</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Jawaban murid hanya dapat dilihat oleh guru dan tidak dibagikan ke sesama murid. Opsi
            anonim membuat murid lebih jujur dan terbuka dalam menyampaikan kesulitan.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-purple-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shadow-2xs">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Agregasi Realtime Instan</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Guru langsung melihat statistik rata-rata skala, distribusi bintang/skor 1–5, grafik
            persentase opsi, serta completion rate terhadap jumlah murid yang hadir.
          </p>
        </div>
      </div>
    </div>
  );
}
