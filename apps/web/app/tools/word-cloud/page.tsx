import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Cloud, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Button, PageHeaderSection } from '@walikelas/ui';

export const metadata: Metadata = {
  title: 'Word Cloud (Awan Kata Interaktif)',
  description:
    'Visualisasi respon singkat dari seluruh murid di kelas untuk melihat gagasan atau kata kunci yang paling sering muncul secara instan di layar proyektor.',
  alternates: {
    canonical: '/tools/word-cloud',
  },
};

export default function WordCloudToolPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans">
      <PageHeaderSection
        title="Word Cloud (Awan Kata Dinamis)"
        description="Visualisasi respon singkat dari seluruh kelas untuk melihat gagasan atau kata kunci yang paling sering muncul secara instan."
        breadcrumbs={[
          { label: 'Katalog Perkakas', href: '/tools' },
          { label: 'Word Cloud', current: true },
        ]}
      />

      {/* Showcase Card with Coming Soon Badge */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-600 shrink-0 shadow-2xs">
            <Cloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100/70 text-amber-900 border border-amber-200/60">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Segera Hadir di V1 Roadmap</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Word Cloud Dinamis
            </h1>
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Fitur visualisasi awan kata sedang dalam tahap finalisasi kurikulum dan optimalisasi antarmuka. Perkakas ini akan memungkinkan guru mengumpulkan satu hingga dua kata kunci dari setiap murid dan menampilkannya sebagai visual interaktif di layar proyektor kelas.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/tools">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="font-bold border-[#e8e4dc] hover:bg-stone-100 hover:text-stone-900 text-stone-700 min-h-[42px]"
            >
              Kembali ke Katalog Perkakas
            </Button>
          </Link>
          <Link href="/teacher">
            <Button
              variant="primary"
              size="md"
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-xs min-h-[42px]"
            >
              Kunjungi Ruang Guru
            </Button>
          </Link>
        </div>
      </div>

      {/* Sneak Peek Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200/60 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Pembobotan Frekuensi Otomatis</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Kata yang dikirim lebih banyak murid akan otomatis berukuran lebih besar dan menonjol di tengah kanvas proyektor.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Filter Kata & Profanity Guard</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Dilengkapi daftar kata terlarang dan kemampuan guru menyembunyikan respon yang tidak sesuai sebelum tampil di proyektor.
          </p>
        </div>
      </div>
    </div>
  );
}

