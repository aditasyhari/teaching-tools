'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, ArrowRight, Play } from 'lucide-react';
import { Button, Input } from '@walikelas/ui';

export default function ProjectorEntryPage(): React.JSX.Element {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length !== 6) {
      setError('Masukkan 6 karakter kode sesi kelas.');
      return;
    }
    router.push(`/projector/${cleanCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10">
            <Tv className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">Mode Proyektor Layar</h1>
          <p className="text-sm text-slate-400">
            Tampilkan aktivitas kelas interaktif di layar depan kelas atau proyektor.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="projector-session-code"
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Kode Sesi Kelas (6 Karakter)
            </label>
            <Input
              id="projector-session-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                setError(null);
              }}
              placeholder="CONTOH: AB7K42"
              className="text-center font-mono font-black text-xl tracking-widest uppercase py-3.5 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-amber-500/20"
              maxLength={6}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full font-bold shadow-lg shadow-amber-500/20"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Buka Layar Proyektor
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center space-y-3">
          <a href="/projector/demo" className="inline-block">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Play className="w-4 h-4 text-amber-400" />}
              className="text-slate-300 border-slate-800 hover:bg-slate-800 font-semibold"
            >
              Lihat Simulasi Demo Proyektor
            </Button>
          </a>
          <p className="text-xs text-slate-500 text-center">
            Tip: Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300">F11</kbd> pada keyboard untuk layar penuh tanpa distraksi.
          </p>
        </div>
      </div>
    </div>
  );
}
