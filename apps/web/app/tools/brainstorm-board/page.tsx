import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Lightbulb, Play, ArrowRight, ShieldCheck, Users, Eye, Sparkles } from 'lucide-react';
import { Button, PageHeaderSection } from '@walikelas/ui';

export const metadata: Metadata = {
  title: 'Papan Curah Pendapat (Brainstorm Board Kolaboratif)',
  description:
    'Ruang curah pendapat interaktif realtime yang memungkinkan murid mengirim ide dan jawaban singkat dari ponsel dengan moderasi penuh oleh guru.',
  alternates: {
    canonical: '/tools/brainstorm-board',
  },
};

export default function BrainstormBoardToolPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageHeaderSection
        title="Papan Ide Kolaboratif (Collaborative Brainstorm Board)"
        description="Ruang curah pendapat interaktif realtime yang memungkinkan murid mengirim ide dan jawaban singkat dari gawai mereka dengan moderasi penuh oleh guru."
        breadcrumbs={[
          { label: 'Katalog Perkakas', href: '/tools' },
          { label: 'Papan Ide Kolaboratif', current: true },
        ]}
      />

      {/* Hero Showcase Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100/70 text-amber-900 border border-amber-200/60">
              Aktivitas Interaktif Kelas
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Papan Ide Kolaboratif
            </h1>
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Kumpulkan ide kreatif, jawaban cepat, atau pendapat dari seluruh siswa di kelas dalam
          hitungan detik. Guru dapat mengatur pertanyaan pemantik, mengaktifkan mode anonim,
          mengatur visibilitas ide bersama, dan memoderasi ide yang masuk.
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
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-amber-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Pemantik Diskusi Fleksibel</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Guru menentukan pertanyaan atau topik pemantik (hingga 300 karakter), mengontrol status
            penerimaan (Terbuka, Dijeda, atau Ditutup) kapan saja.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-emerald-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Moderasi Penuh Guru</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Guru dapat menyembunyikan ide yang kurang pantas atau duplikat secara instan dari papan
            kelas, dan memulihkannya kembali sewaktu-waktu.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-amber-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Perlindungan Anonimitas & Privasi</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Dapat dikonfigurasi anonim agar peserta bebas berekspresi tanpa takut dihakimi, tanpa
            membocorkan identitas teknis di jaringan.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-blue-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Kontrol Batas & Anti-Spam</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Pengaturan batas 1 ide per siswa atau hingga 5 ide, dilengkapi jeda pengiriman 3 detik
            dan pencegahan pesan ganda otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}
