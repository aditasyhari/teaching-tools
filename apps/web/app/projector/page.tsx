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
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kode Sesi Kelas (6 Karakter)
            </label>
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                setError(null);
              }}
              placeholder="CONTOH: AB7K42"
              className="text-center font-mono font-black text-xl tracking-widest uppercase py-3.5 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500"
              maxLength={6}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-lg shadow-indigo-600/25"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Buka Layar Proyektor
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <a href="/projector/demo">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Play className="w-4 h-4 text-indigo-400" />}
              className="text-slate-300 border-slate-800 hover:bg-slate-800 font-semibold"
            >
              Lihat Simulasi Demo Proyektor
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
