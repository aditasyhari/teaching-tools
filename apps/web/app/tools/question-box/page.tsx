import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { HelpCircle, Play, ShieldCheck, ArrowRight, EyeOff, Clock, Tv } from 'lucide-react';
import { Button, PageHeaderSection } from '@walikelas/ui';

export const metadata: Metadata = {
  title: 'Kotak Pertanyaan Siswa (Question Box / Ask Teacher)',
  description:
    'Kanal tanya-jawab interaktif realtime yang memungkinkan murid mengajukan pertanyaan secara nyaman (bisa anonim) dan guru menyorot ke layar proyektor.',
  alternates: {
    canonical: '/tools/question-box',
  },
};

export default function QuestionBoxToolPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageHeaderSection
        title="Kotak Pertanyaan (Question Box / Ask Teacher)"
        description="Kanal tanya-jawab interaktif realtime yang memungkinkan murid mengajukan pertanyaan secara nyaman (bisa anonim) dan guru memoderasi serta menyorot ke proyektor."
        breadcrumbs={[
          { label: 'Katalog Perkakas', href: '/tools' },
          { label: 'Kotak Pertanyaan', current: true },
        ]}
      />

      {/* Hero Showcase Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100/70 text-sky-900 border border-sky-200/60">
              Aktivitas Interaktif Kelas
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Kotak Pertanyaan / Ask Teacher
            </h1>
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Beri kesempatan bagi setiap murid—termasuk yang pemalu—untuk bertanya langsung dari gawai
          mereka tanpa ragu. Guru memoderasi pertanyaan yang masuk, menandai yang telah selesai, dan
          menyorot pertanyaan pilihan ke layar utama kelas.
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
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-sky-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center shadow-2xs">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Privasi Aman & Opsi Anonim</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Pertanyaan yang baru diajukan langsung dikirim ke antrean guru dan tidak dapat dibaca
            oleh sesama murid, dengan opsi pengiriman nama anonim.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-blue-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-2xs">
            <Tv className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Sorot ke Layar Proyektor</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Guru dapat menyorot satu pertanyaan pilihan untuk dibahas bersama di depan kelas dengan
            tipografi besar dan kontras tinggi.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-emerald-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">Anti-Spam & Batas Otomatis</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Dilengkapi jeda pengiriman (cooldown 5 detik), batas maksimal 5 pertanyaan aktif per
            murid, dan pencegahan duplikasi pertanyaan.
          </p>
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-purple-300/70 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shadow-2xs">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            Sinkronisasi Realtime & Pemulihan Reconnect
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Saat koneksi terputus dan terhubung kembali, snapshot otomatis memulihkan daftar
            pertanyaan guru dan status pertanyaan milik murid.
          </p>
        </div>
      </div>
    </div>
  );
}
