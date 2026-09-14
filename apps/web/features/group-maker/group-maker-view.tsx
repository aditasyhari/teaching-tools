'use client';

import React, { useState } from 'react';
import { Users, Copy, Check, Printer, RotateCcw, Sparkles, FileText, Layers } from 'lucide-react';
import { Button, Badge } from '@walikelas/ui';
import { useGroupMaker } from './use-group-maker';

const SAMPLE_STUDENTS = [
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
  'Kusuma Wardani',
  'Lukman Sardi',
  'Mega Utami',
  'Naufal Rizqi',
  'Olivia Salim',
  'Panji Gumilang',
  'Qori Amalia',
  'Rendra Karno',
  'Sari Indah',
  'Taufik Hidayat',
];

export function GroupMakerView(): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const {
    rawInput,
    setRawInput,
    itemCount,
    mode,
    setMode,
    targetValue,
    setTargetValue,
    groups,
    hasGenerated,
    generate,
    reset,
    formatCopyText,
  } = useGroupMaker(SAMPLE_STUDENTS.join('\n'));

  const handleCopy = async () => {
    const text = formatCopyText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:p-0">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          <h1 className="text-lg font-bold text-stone-900">Group Maker</h1>
          <Badge variant="neutral" size="sm" className="bg-teal-100/70 text-teal-900 font-semibold border-none">
            {itemCount} nama terdaftar
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRawInput(SAMPLE_STUDENTS.join('\n'))}
            leftIcon={<FileText className="w-4 h-4 text-slate-500" />}
          >
            Contoh 20 Nama
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRawInput('');
              reset();
            }}
            leftIcon={<RotateCcw className="w-4 h-4 text-slate-500" />}
          >
            Kosongkan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Left Column: Settings & Input (Hidden on Print) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5 print:hidden">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Metode Pembagian
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('BY_COUNT')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === 'BY_COUNT'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jumlah Tim
              </button>
              <button
                type="button"
                onClick={() => setMode('BY_SIZE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === 'BY_SIZE'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ukuran per Tim
              </button>
            </div>
          </div>

          {/* Target Value Number Input */}
          <div className="space-y-2">
            <label
              htmlFor="target-input"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              {mode === 'BY_COUNT' ? 'Berapa Jumlah Kelompok?' : 'Berapa Siswa per Kelompok?'}
            </label>
            <div className="flex items-center gap-3">
              <input
                id="target-input"
                type="number"
                min="1"
                max={Math.max(1, itemCount)}
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full h-11 px-4 border border-slate-300 rounded-xl text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {mode === 'BY_COUNT'
                ? `Membagi ${itemCount} siswa ke dalam ${targetValue} kelompok secara merata.`
                : `Setiap kelompok berisi sekitar ${targetValue} siswa.`}
            </p>
          </div>

          {/* Names Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="names-textarea"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Daftar Nama
              </label>
              <span className="text-xs text-slate-400 font-medium">1 nama per baris</span>
            </div>

            <textarea
              id="names-textarea"
              rows={9}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Tempel nama siswa di sini..."
              className="w-full p-3 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Generate Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base shadow-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            disabled={itemCount === 0}
            leftIcon={<Sparkles className="w-5 h-5" />}
            onClick={generate}
          >
            {hasGenerated ? 'Acak & Bagi Ulang' : 'Bagi Kelompok Sekarang'}
          </Button>
        </div>

        {/* Right Column: Generated Groups Results */}
        <div className="lg:col-span-8 space-y-4">
          {hasGenerated && groups.length > 0 ? (
            <>
              {/* Actions Bar */}
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-800">
                    Hasil: {groups.length} Kelompok Terbentuk
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )
                    }
                    onClick={handleCopy}
                  >
                    {copied ? 'Tersalin!' : 'Salin Hasil'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={handlePrint}
                  >
                    Cetak
                  </Button>
                </div>
              </div>

              {/* Print Header */}
              <div className="hidden print:block mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Pembagian Kelompok Kelas</h2>
                <p className="text-sm text-slate-500">
                  WaliKelas Teaching Tools — Total {itemCount} Siswa ({groups.length} Kelompok)
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                {groups.map((group) => (
                  <div
                    key={group.groupNumber}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3 print:border-slate-400 print:shadow-none"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="font-bold text-slate-900 text-base">
                        Kelompok {group.groupNumber}
                      </h3>
                      <Badge variant="neutral" size="sm">
                        {group.members.length} Anggota
                      </Badge>
                    </div>

                    <ol className="space-y-1.5 list-decimal list-inside text-sm text-slate-700 font-medium">
                      {group.members.map((member, mIdx) => (
                        <li key={`${group.groupNumber}-${mIdx}`} className="py-0.5">
                          <span>{member}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[360px] text-slate-400 space-y-3">
              <Users className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-medium">
                Pilih metode pembagian di sebelah kiri lalu klik tombol{' '}
                <b>Bagi Kelompok Sekarang</b>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
