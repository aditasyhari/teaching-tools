import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { BarChart2, Play, CheckSquare, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { Button, PageHeaderSection } from '@walikelas/ui';

export const metadata: Metadata = {
  title: 'Jajak Pendapat Kilat (Live Poll) — Polling Kelas',
  description:
    'Kumpulkan suara, opini, dan respon cepat dari seluruh murid di kelas secara langsung dengan grafik batang realtime yang ramah proyektor.',
  alternates: {
    canonical: '/tools/live-poll',
  },
};

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
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100/70 text-emerald-900 border border-emerald-200/60">
              Aktivitas Interaktif Kelas
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Live Poll & Feedback Engine
            </h1>
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Ukur pemahaman murid seketika tanpa jeda. Murid memilih respon pilihan tunggal atau ganda
          dari HP mereka secara anonim atau bernama, dan distribusi suara langsung divisualisasikan
          dalam diagram persentase di depan kelas.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/teacher/polls">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-xs min-h-[42px]"
            >
              Kelola & Rancang Polling (Guru)
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
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-emerald-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">1-Klik Quick Feedback Presets</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Gunakan template siap pakai seperti "Tingkat Pemahaman", "Kesiapan Lanjut", dan
            "Evaluasi Kecepatan" untuk memulai polling dalam 3 detik.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-emerald-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            Penguncian Satu Respon (Anti-Double Vote)
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Server memverifikasi kepemilikan sesi dan mengunci respon per murid secara otoritatif
            sehingga data jajak pendapat akurat dan bebas manipulasi.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-indigo-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shadow-2xs">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Distribusi Suara Realtime</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Persentase dan jumlah suara bergerak secara dinamis seiring murid mengklik opsi,
            memberikan visualisasi instan di konsol guru dan layar proyektor.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-purple-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shadow-2xs">
            <CheckSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Dukungan Single & Multiple Choice</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Pilih mode respon cepat satu pilihan (1 tap submit) atau mode banyak pilihan sesuai
            format pertanyaan diskusi Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
