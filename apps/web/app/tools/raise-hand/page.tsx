import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Hand, Play, ShieldCheck, ArrowRight, Mic, Clock, UserCheck } from 'lucide-react';
import { Button, PageHeaderSection } from '@walikelas/ui';

export const metadata: Metadata = {
  title: 'Antrean Angkat Tangan (Raise Hand Digital)',
  description:
    'Antrean angkat tangan digital realtime untuk partisipasi kelas yang tertib dan adil. Guru mengendalikan giliran berbicara murid tanpa berebut perhatian.',
  alternates: {
    canonical: '/tools/raise-hand',
  },
};

export default function RaiseHandToolPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageHeaderSection
        title="Angkat Tangan (Raise Hand / Request to Speak)"
        description="Antrean angkat tangan digital realtime untuk partisipasi kelas yang tertib, teratur, dan adil. Guru mengendalikan giliran berbicara satu per satu tanpa berebut mikrofon atau perhatian."
        breadcrumbs={[
          { label: 'Katalog Perkakas', href: '/tools' },
          { label: 'Angkat Tangan', current: true },
        ]}
      />

      {/* Hero Showcase Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Hand className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100/70 text-indigo-900 border border-indigo-200/60">
              Aktivitas Interaktif Kelas
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Angkat Tangan / Request to Speak
            </h1>
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Kelola sesi tanya jawab atau diskusi kelas dengan antrean digital yang transparan. Murid
          mengangkat tangan dari gawai masing-masing, melihat nomor antreannya, dan mendapatkan
          pemberitahuan seketika saat guru memberikan giliran berbicara.
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
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-indigo-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shadow-2xs">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Urutan Antrean Terbuka & Adil</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Antrean diurutkan secara ketat berdasarkan waktu murid menekan tombol angkat tangan.
            Murid dapat melihat nomor urut mereka secara realtime.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-emerald-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <Mic className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Aturan 1 Pembicara Aktif</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Menjaga fokus kelas dengan aturan server hanya satu murid yang dalam status berbicara
            pada satu waktu, menghindari interupsi yang tidak terkontrol.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-sky-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center shadow-2xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Konfirmasi Guru (Acknowledge)</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Guru dapat menandai tangan yang sudah dilihat agar murid tahu permohonannya telah
            diperhatikan dan segera bersiap berbicara.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-purple-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            Anti-Spam & Turunkan Tangan Sendiri
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Dilengkapi jeda 3 detik per aksi dan pencegahan duplikasi. Murid juga bebas
            membatalkan/menurunkan tangannya sendiri jika sudah tidak ingin berbicara.
          </p>
        </div>
      </div>
    </div>
  );
}
