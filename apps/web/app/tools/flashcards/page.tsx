import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Button, PageHeaderSection } from '@walikelas/ui';

export const metadata: Metadata = {
  title: 'Flashcards (Kartu Belajar Pengingat Materi)',
  description:
    'Kartu belajar dua sisi untuk pengulangan dan penguatan konsep esensial secara interaktif di kelas atau belajar mandiri.',
  alternates: {
    canonical: '/tools/flashcards',
  },
};

export default function FlashcardsToolPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans">
      <PageHeaderSection
        title="Flashcards (Kartu Pengingat Materi)"
        description="Kartu belajar dua sisi untuk pengulangan dan penguatan konsep esensial secara interaktif di kelas atau belajar mandiri."
        breadcrumbs={[
          { label: 'Katalog Perkakas', href: '/tools' },
          { label: 'Flashcards', current: true },
        ]}
      />

      {/* Showcase Card with Coming Soon Badge */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100/70 text-amber-900 border border-amber-200/60">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Segera Hadir di V1 Roadmap</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Flashcards Pembelajaran
            </h1>
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Modul flashcards sedang dipersiapkan untuk melengkapi materi dan catatan guru. Anda akan dapat menyusun dek kartu konsep, membolak-balik kartu di layar sentuh proyektor kelas, atau membagikannya ke murid untuk pengulangan mandiri.
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
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Animasi Flip Halus 3D</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Efek pembalikan kartu mulus dengan gesture klik atau geser yang optimal di layar proyektor dan gawai siswa.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Dukungan Rumus & Gambar</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Format teks kaya untuk definisi istilah, rumus sains/matematika, maupun kosakata bahasa asing.
          </p>
        </div>
      </div>
    </div>
  );
}

