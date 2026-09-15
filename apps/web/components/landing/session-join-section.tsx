'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@walikelas/ui';

export function SessionJoinSection(): React.JSX.Element {
  const [sessionCode, setSessionCode] = useState('');

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sessionCode.trim().toUpperCase();
    if (clean && typeof window !== 'undefined') {
      window.location.href = `/join?code=${clean}`;
    }
  };

  return (
    <section className="bg-white border-b border-[#e8e4dc] py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-7 rounded-2xl bg-[#faf8f5] border border-[#e8e4dc] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Akses Cepat Siswa</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
              Punya Kode Sesi Kelas Hari Ini?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Siswa cukup memasukkan 6 huruf kode kelas tanpa mendaftar akun atau mengingat kata sandi.
            </p>
          </div>

          <form onSubmit={handleJoinSession} className="flex gap-2 w-full md:w-auto shrink-0 justify-center">
            <input
              id="session-join-code-input"
              type="text"
              maxLength={6}
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="KODE: WK-982"
              className="w-44 text-center tracking-[0.2em] font-mono font-bold text-base uppercase h-11 bg-white border border-[#e8e4dc] rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 px-3 shadow-2xs transition-colors"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 h-11 text-xs whitespace-nowrap shadow-xs"
              disabled={!sessionCode.trim()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Gabung
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

