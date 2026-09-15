'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@walikelas/ui';
import { useAuth } from '../../lib/auth-context';

export function ClosingCtaSection(): React.JSX.Element {
  const { isAuthenticated, loginWithGoogle } = useAuth();

  const handleTeacherAccess = () => {
    if (isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/teacher';
      }
    } else {
      loginWithGoogle();
    }
  };

  return (
    <section className="bg-slate-900 text-white py-16 sm:py-20 relative overflow-hidden border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-amber-300 text-xs font-semibold border border-slate-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>WaliKelas Teaching Tools V1</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          Siap membuat aktivitas mengajar lebih hidup dan interaktif?
        </h2>

        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Mulai sesi kelas pertama Anda sekarang. Gratis, tanpa instalasi aplikasi untuk murid, dan langsung siap ditampilkan di proyektor kelas.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row justify-center items-center gap-3.5">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-8 h-12 text-base shadow-sm border-amber-600/30"
            onClick={handleTeacherAccess}
          >
            Mulai Mengajar Gratis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Link href="/tools" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border-slate-700 h-12 text-base font-semibold"
            >
              Jelajahi Katalog Perkakas
            </Button>
          </Link>
        </div>

        <div className="pt-2">
          <Link
            href="/join"
            className="text-xs text-slate-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
          >
            Siswa yang memiliki kode sesi kelas dapat bergabung di sini &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
