'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '../common/brand-logo';

export function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }): React.JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function TeacherLoginView(): React.JSX.Element {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Top Utility Header */}
      <header className="w-full border-b border-[#e8e4dc] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center focus:outline-none"
          >
            <BrandLogo size="sm" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-stone-100/80"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="max-w-md w-full space-y-6">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-[#e8e4dc] shadow-xs p-6 sm:p-8 space-y-6 text-center">
            {/* Brand Emblem */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-[#e8e4dc] p-2.5 flex items-center justify-center shadow-xs">
              <img src="/logo.png" alt="WaliKelas" className="w-11 h-11 object-contain" />
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100/70 text-amber-900 border border-amber-200/60">
                Ruang Guru
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Masuk ke Ruang Guru
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                Kelola kuis interaktif, polling kelas, buka kendali proyektor, dan simpan catatan mengajar Anda.
              </p>
            </div>

            {/* Google Sign In Button */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/90 text-stone-800 font-bold text-sm transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 cursor-pointer"
              >
                <GoogleIcon className="w-5 h-5 shrink-0" />
                <span>Masuk dengan Akun Google</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Google OAuth 2.0 Resmi &bull; Tanpa kata sandi terpisah</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="pt-5 border-t border-stone-100 text-left space-y-2.5">
              <div className="flex items-start gap-2 text-xs text-stone-600">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Akses Sesi & Proyektor:</strong> Sambungkan kendali laptop guru langsung ke layar proyektor kelas.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-stone-600">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Data Aktivitas Tersimpan:</strong> Kuis, polling, dan catatan guru tersimpan aman di akun Anda.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-stone-600">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Nol Login Siswa:</strong> Siswa tetap bergabung dengan kode sesi tanpa perlu membuat akun.
                </span>
              </div>
            </div>

            {/* Alternative Direct Tool Access */}
            <div className="pt-4 border-t border-[#e8e4dc]/60 bg-[#faf8f5] -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 rounded-b-2xl">
              <p className="text-xs text-stone-500 mb-1.5">
                Hanya butuh perkakas cepat tanpa login?
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
              >
                Buka Katalog Perkakas (Timer, Acak Nama, Kelompok)
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <p className="text-center text-[11px] text-stone-400">
            WaliKelas Teaching Tools V1 &bull; tools.walikelas.id
          </p>
        </div>
      </main>

      {/* Empty Footer Spacer */}
      <div className="h-6" />
    </div>
  );
}

