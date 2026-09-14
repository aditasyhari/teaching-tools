'use client';

import React from 'react';
import {
  Shuffle,
  Sparkles,
  RotateCcw,
  Trash2,
  Users,
  History,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Button, Badge } from '@walikelas/ui';
import { useRandomPicker } from './use-random-picker';

const SAMPLE_NAMES = [
  'Ahmad Dahlan',
  'Siti Nurhaliza',
  'Budi Pratama',
  'Dewi Sartika',
  'Eko Prasetyo',
  'Fatimah Azzahra',
  'Gilang Ramadhan',
  'Hana Maulida',
  'Irfan Hakim',
  'Jasmine Putri',
];

export function RandomPickerView(): React.JSX.Element {
  const {
    rawInput,
    setRawInput,
    itemCount,
    selectedItem,
    history,
    allowRepeat,
    setAllowRepeat,
    isPicking,
    pick,
    clear,
    resetAll,
  } = useRandomPicker({
    initialRawInput: SAMPLE_NAMES.join('\n'),
    allowImmediateRepeat: false,
  });

  const handleLoadSample = () => {
    setRawInput(SAMPLE_NAMES.join('\n'));
    clear();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-xs">
        <div className="flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-violet-600" />
          <h1 className="text-lg font-bold text-stone-900">Random Picker</h1>
          <Badge variant="neutral" size="sm" className="bg-violet-100/70 text-violet-900 font-semibold border-none">
            {itemCount} nama terdaftar
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadSample}
            leftIcon={<FileText className="w-4 h-4 text-slate-500" />}
          >
            Contoh Nama
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
          >
            Kosongkan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Names */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="names-input"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Daftar Nama / Pilihan
              </label>
              <span className="text-xs text-slate-400 font-medium">1 nama per baris</span>
            </div>

            <textarea
              id="names-input"
              rows={12}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Ketik atau tempel nama siswa di sini...&#10;Contoh:&#10;Ahmad&#10;Budi&#10;Citra"
              className="w-full p-3.5 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed resize-none"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowRepeat}
                onChange={(e) => setAllowRepeat(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Boleh Terpilih Berulang Langsung</span>
            </label>
          </div>
        </div>

        {/* Right Column: Picker Display & Action */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Selected Result Box */}
          <div
            className={`bg-white rounded-3xl border-2 p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center text-center transition-all min-h-[300px] ${
              selectedItem
                ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-50'
                : 'border-slate-200 border-dashed'
            }`}
          >
            {selectedItem ? (
              <div
                className={`space-y-4 ${isPicking ? 'scale-95 opacity-50' : 'scale-100 opacity-100'} transition-all duration-300`}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>Nama Terpilih!</span>
                </div>

                <div className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight drop-shadow-xs">
                  {selectedItem}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-stone-400">
                <Users className="w-12 h-12 mx-auto text-stone-300" />
                <p className="text-sm font-medium">
                  {itemCount > 0
                    ? 'Klik tombol di bawah untuk memilih nama acak'
                    : 'Masukkan daftar nama terlebih dahulu'}
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-8 flex items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                className="px-8 text-base shadow-md bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                disabled={itemCount === 0 || isPicking}
                leftIcon={<Shuffle className="w-5 h-5" />}
                onClick={() => pick()}
              >
                {selectedItem ? 'Pilih Lagi Acak' : 'Pilih Nama Acak'}
              </Button>

              {selectedItem && (
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  onClick={clear}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Selection History */}
          {history.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Riwayat Pilihan ({history.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => clear()}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Hapus Riwayat
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {history.map((name, idx) => (
                  <span
                    key={`${name}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
