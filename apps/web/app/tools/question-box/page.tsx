'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Play, ShieldCheck, ArrowRight, EyeOff, Clock, Tv } from 'lucide-react';
import { Button, Badge, PageHeaderSection } from '@walikelas/ui';

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
      <div className="bg-gradient-to-br from-amber-900 via-orange-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="default">Aktivitas Interaktif Realtime</Badge>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Kotak Pertanyaan / Ask Teacher V1
            </h1>
          </div>
        </div>

        <p className="text-amber-200 text-base sm:text-lg max-w-2xl leading-relaxed">
          Beri kesempatan bagi setiap murid—termasuk yang pemalu—untuk bertanya langsung dari gawai
          mereka tanpa ragu. Guru memoderasi pertanyaan yang masuk, menandai yang telah selesai, dan
          menyorot pertanyaan pilihan ke layar utama kelas.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/teacher/sessions">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg"
            >
              Mulai di Sesi Kelas (Guru)
            </Button>
          </Link>
          <Link href="/join">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="font-bold border-amber-700 bg-amber-900/50 text-white hover:bg-amber-800"
            >
              Gabung sebagai Murid
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Privasi Aman & Opsi Anonim</h3>
          <p className="text-sm text-muted-foreground">
            Pertanyaan yang baru diajukan langsung dikirim ke antrean guru dan tidak dapat dibaca
            oleh sesama murid, dengan opsi pengiriman nama anonim.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Tv className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Sorot ke Layar Proyektor</h3>
          <p className="text-sm text-muted-foreground">
            Guru dapat menyorot satu pertanyaan pilihan untuk dibahas bersama di depan kelas dengan
            tipografi besar dan kontras tinggi.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Anti-Spam & Batas Otomatis</h3>
          <p className="text-sm text-muted-foreground">
            Dilengkapi jeda pengiriman (cooldown 5 detik), batas maksimal 5 pertanyaan aktif per
            murid, dan pencegahan duplikasi pertanyaan.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Sinkronisasi Realtime & Pemulihan Reconnect
          </h3>
          <p className="text-sm text-muted-foreground">
            Saat koneksi terputus dan terhubung kembali, snapshot otomatis memulihkan daftar
            pertanyaan guru dan status pertanyaan milik murid.
          </p>
        </div>
      </div>
    </div>
  );
}
