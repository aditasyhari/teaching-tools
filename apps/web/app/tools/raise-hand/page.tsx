'use client';

import React from 'react';
import Link from 'next/link';
import { Hand, Play, ShieldCheck, ArrowRight, Mic, Clock, UserCheck } from 'lucide-react';
import { Button, Badge, PageHeaderSection } from '@walikelas/ui';

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
      <div className="bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Hand className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="default">Aktivitas Interaktif Realtime</Badge>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Angkat Tangan / Request to Speak V1
            </h1>
          </div>
        </div>

        <p className="text-amber-200 text-base sm:text-lg max-w-2xl leading-relaxed">
          Kelola sesi tanya jawab atau diskusi kelas dengan antrean digital yang transparan. Murid
          mengangkat tangan dari gawai masing-masing, melihat nomor antreannya, dan mendapatkan
          pemberitahuan seketika saat guru memberikan giliran berbicara.
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
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Urutan Antrean Terbuka & Adil</h3>
          <p className="text-sm text-muted-foreground">
            Antrean diurutkan secara ketat berdasarkan waktu murid menekan tombol angkat tangan.
            Murid dapat melihat nomor urut mereka secara realtime.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Aturan 1 Pembicara Aktif</h3>
          <p className="text-sm text-muted-foreground">
            Menjaga fokus kelas dengan aturan server hanya satu murid yang dalam status berbicara
            pada satu waktu, menghindari interupsi yang tidak terkontrol.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Konfirmasi Guru (Acknowledge)</h3>
          <p className="text-sm text-muted-foreground">
            Guru dapat menandai tangan yang sudah dilihat agar murid tahu permohonannya telah
            diperhatikan dan segera bersiap berbicara.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Anti-Spam & Turunkan Tangan Sendiri
          </h3>
          <p className="text-sm text-muted-foreground">
            Dilengkapi jeda 3 detik per aksi dan pencegahan duplikasi. Murid juga bebas
            membatalkan/menurunkan tangannya sendiri jika sudah tidak ingin berbicara.
          </p>
        </div>
      </div>
    </div>
  );
}
