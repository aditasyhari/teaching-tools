'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Tv, Zap, Smartphone } from 'lucide-react';
import { Button } from '@walikelas/ui';
import { useAuth } from '../../lib/auth-context';
import { HeroToolbox } from './hero-toolbox';
import { motion } from 'motion/react';

export function HeroSection(): React.JSX.Element {
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
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#e8e4dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column — Teacher-First Value Proposition & Primary Conversion */}
          <div className="lg:col-span-6 space-y-6">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold border border-amber-300/60 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>WaliKelas · Teaching Tools</span>
            </motion.div>

            {/* Primary Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-stone-900 leading-[1.14]"
            >
              Perkakas kecil.{' '}
              <span className="text-amber-600 block sm:inline">
                Kelas yang lebih hidup.
              </span>
            </motion.h1>

            {/* Supporting Copy — Functional & Clear */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed font-normal"
            >
              Timer, kuis, polling, pembagian kelompok, dan perkakas interaktif lainnya yang siap dipakai saat mengajar tanpa beban instalasi.
            </motion.p>

            {/* CTA Buttons — Clear Conversion Hierarchy */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleTeacherAccess}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-7 h-12 text-base shadow-xs border-amber-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Mulai Mengajar
              </Button>
              <Link href="/tools">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-stone-300 hover:bg-stone-100 text-stone-800 font-semibold px-6 h-12 text-base shadow-2xs"
                >
                  Lihat Semua Perkakas
                </Button>
              </Link>
            </motion.div>

            {/* Trust & Ease Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-stone-600 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Buka langsung dari browser</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Siap di layar proyektor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% tanpa login siswa</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column — The Product Itself as Hero (Interactive Toolbox) */}
          <div className="lg:col-span-6 w-full">
            <HeroToolbox />
          </div>
        </div>
      </div>
    </section>
  );
}
