'use client';

import React from 'react';
import Link from 'next/link';
import { Lightbulb, Play, ArrowRight, ShieldCheck, Users, Eye, Sparkles } from 'lucide-react';
import { Button, Badge, PageHeaderSection } from '@walikelas/ui';

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
      <div className="bg-gradient-to-br from-violet-900 via-purple-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/30 border border-violet-400/30 flex items-center justify-center text-violet-300">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="default">Aktivitas Interaktif Realtime</Badge>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">Papan Ide Kolaboratif V1</h1>
          </div>
        </div>

        <p className="text-violet-200 text-base sm:text-lg max-w-2xl leading-relaxed">
          Kumpulkan ide kreatif, jawaban cepat, atau pendapat dari seluruh siswa di kelas dalam
          hitungan detik. Guru dapat mengatur pertanyaan pemantik, mengaktifkan mode anonim,
          mengatur visibilitas ide bersama, dan memoderasi ide yang masuk.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/teacher/sessions">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold shadow-lg"
            >
              Mulai di Sesi Kelas (Guru)
            </Button>
          </Link>
          <Link href="/join">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="font-bold border-violet-700 bg-violet-900/50 text-white hover:bg-violet-800"
            >
              Gabung sebagai Murid
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Pemantik Diskusi Fleksibel</h3>
          <p className="text-sm text-muted-foreground">
            Guru menentukan pertanyaan atau topik pemantik (hingga 300 karakter), mengontrol status
            penerimaan (Terbuka, Dijeda, atau Ditutup) kapan saja.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Moderasi Penuh Guru</h3>
          <p className="text-sm text-muted-foreground">
            Guru dapat menyembunyikan ide yang kurang pantas atau duplikat secara instan dari papan
            kelas, dan memulihkannya kembali sewaktu-waktu.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Perlindungan Anonimitas & Privasi</h3>
          <p className="text-sm text-muted-foreground">
            Dapat dikonfigurasi anonim agar peserta bebas berekspresi tanpa takut dihakimi, tanpa
            membocorkan identitas teknis di jaringan.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Kontrol Batas & Anti-Spam</h3>
          <p className="text-sm text-muted-foreground">
            Pengaturan batas 1 ide per siswa atau hingga 5 ide, dilengkapi jeda pengiriman 3 detik
            dan pencegahan pesan ganda otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}
