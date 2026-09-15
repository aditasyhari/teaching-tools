'use client';

import React, { useState, useCallback } from 'react';
import {
  Users,
  Copy,
  Check,
  Printer,
  RotateCcw,
  Sparkles,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Badge, Card, Input, Textarea } from '@walikelas/ui';
import { motion } from 'motion/react';
import { staggerContainer, slideUp } from '../../lib/motion';
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
  const [showRoster, setShowRoster] = useState(true);
  const [announcement, setAnnouncement] = useState('');

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

  const handleGenerate = useCallback(() => {
    generate();
    setAnnouncement(`Berhasil membagi kelompok: ${groups.length} kelompok terbentuk`);
  }, [generate, groups.length]);

  const handleCopy = async () => {
    const text = formatCopyText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setAnnouncement('Daftar kelompok disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures in unsupported environments
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleLoadSample = useCallback(() => {
    setRawInput(SAMPLE_STUDENTS.join('\n'));
    reset();
    setAnnouncement('Daftar 20 nama contoh siswa dimuat');
  }, [setRawInput, reset]);

  const handleResetAll = useCallback(() => {
    setRawInput('');
    reset();
    setAnnouncement('Daftar siswa dikosongkan');
  }, [setRawInput, reset]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:p-0">
      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Header Bar (Hidden during printing) */}
      <Card className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs border-[#e8e4dc] bg-white print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                Group Maker
              </h1>
              <Badge variant="neutral" size="sm">
                {itemCount} siswa terdaftar
              </Badge>
            </div>
            <p className="text-xs text-stone-600 hidden sm:block">
              Bagi siswa ke dalam kelompok diskusi atau kerja tim secara adil dan acak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadSample}
            aria-label="Muat 20 contoh nama siswa"
            className="text-stone-700 hover:text-stone-900 hover:bg-stone-100"
            leftIcon={<FileText className="w-4 h-4 text-stone-500" aria-hidden="true" />}
          >
            <span className="text-xs font-semibold">Contoh 20 Nama</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            aria-label="Kosongkan daftar nama dan hasil"
            className="text-stone-700 hover:text-red-700 hover:bg-red-50"
            leftIcon={<RotateCcw className="w-4 h-4 text-stone-400" aria-hidden="true" />}
          >
            <span className="text-xs font-semibold">Kosongkan</span>
          </Button>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Left Column: Group Setup & Options (Hidden on Print) */}
        <Card className="lg:col-span-4 p-5 space-y-5 border-[#e8e4dc] bg-white shadow-xs print:hidden">
          {/* Method / Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Metode Pembagian
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100/80 rounded-xl border border-stone-200/60">
              <button
                type="button"
                onClick={() => setMode('BY_COUNT')}
                aria-pressed={mode === 'BY_COUNT'}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'BY_COUNT'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Jumlah Tim
              </button>
              <button
                type="button"
                onClick={() => setMode('BY_SIZE')}
                aria-pressed={mode === 'BY_SIZE'}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'BY_SIZE'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Ukuran per Tim
              </button>
            </div>
          </div>

          {/* Target Value Input */}
          <div className="space-y-2">
            <label
              htmlFor="target-input"
              className="text-xs font-bold text-stone-600 uppercase tracking-wider block"
            >
              {mode === 'BY_COUNT' ? 'Target Jumlah Kelompok' : 'Target Siswa per Kelompok'}
            </label>
            <Input
              id="target-input"
              type="number"
              min={1}
              max={Math.max(1, itemCount)}
              value={targetValue}
              onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="h-11 text-center font-bold text-lg border-[#e8e4dc] focus-visible:ring-amber-500"
            />
            <p className="text-[11px] text-stone-500 font-medium">
              {mode === 'BY_COUNT'
                ? `Membagi ${itemCount} siswa ke dalam ${targetValue} kelompok secara seimbang.`
                : `Setiap kelompok berisi rata-rata ${targetValue} siswa.`}
            </p>
          </div>

          {/* Roster Input Accordion */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label
                htmlFor="names-textarea"
                className="text-xs font-bold text-stone-600 uppercase tracking-wider"
              >
                Daftar Siswa ({itemCount})
              </label>
              <button
                type="button"
                onClick={() => setShowRoster((prev) => !prev)}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{showRoster ? 'Tutup' : 'Buka'}</span>
                {showRoster ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showRoster && (
              <Textarea
                id="names-textarea"
                rows={7}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Tempel nama siswa di sini...&#10;1 nama per baris"
                className="font-medium font-sans text-xs leading-relaxed resize-y border-[#e8e4dc] focus-visible:ring-amber-500 text-stone-900 bg-[#fdfcfb]"
              />
            )}
          </div>

          {/* Generate Primary CTA */}
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base font-bold bg-amber-500 hover:bg-amber-600 text-stone-900 border-amber-600 shadow-sm"
            disabled={itemCount === 0}
            leftIcon={<Sparkles className="w-5 h-5 fill-current" aria-hidden="true" />}
            onClick={handleGenerate}
            aria-label="Bagi kelompok siswa sekarang"
          >
            {hasGenerated ? 'Acak & Bagi Ulang' : 'Bagi Kelompok Sekarang'}
          </Button>
        </Card>

        {/* Right Column: Generated Group Result Cards */}
        <div className="lg:col-span-8 space-y-4">
          {hasGenerated && groups.length > 0 ? (
            <>
              {/* Action Bar (Copy, Print) */}
              <Card className="p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs border-[#e8e4dc] bg-white print:hidden">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  <span className="text-sm font-bold text-stone-900">
                    Hasil: {groups.length} Kelompok Terbentuk
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#e8e4dc] text-stone-700 hover:bg-stone-50 font-semibold"
                    leftIcon={
                      copied ? (
                        <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4 text-stone-500" aria-hidden="true" />
                      )
                    }
                    onClick={handleCopy}
                    aria-label="Salin hasil kelompok ke clipboard"
                  >
                    {copied ? 'Tersalin!' : 'Salin Hasil'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#e8e4dc] text-stone-700 hover:bg-stone-50 font-semibold"
                    leftIcon={<Printer className="w-4 h-4 text-stone-500" aria-hidden="true" />}
                    onClick={handlePrint}
                    aria-label="Cetak daftar kelompok"
                  >
                    Cetak
                  </Button>
                </div>
              </Card>

              {/* Printable Header (Visible only when printed) */}
              <div className="hidden print:block mb-6 border-b pb-3">
                <h2 className="text-2xl font-bold text-stone-900">Pembagian Kelompok Kelas</h2>
                <p className="text-xs text-stone-600 mt-1">
                  WaliKelas Teaching Tools &bull; Total {itemCount} Siswa ({groups.length} Kelompok)
                </p>
              </div>

              {/* Group Cards Grid with Dedicated Page-Break Prevention */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4"
              >
                {groups.map((group) => (
                  <motion.div key={group.groupNumber} variants={slideUp}>
                    <Card
                      className="p-5 flex flex-col justify-between gap-3 border-[#e8e4dc] bg-white shadow-xs break-inside-avoid page-break-inside-avoid print:border-stone-400 print:shadow-none"
                      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                    >
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <h3 className="font-extrabold text-stone-900 text-base tracking-tight">
                          Kelompok {group.groupNumber}
                        </h3>
                        <Badge variant="neutral" size="sm" className="bg-amber-50 text-amber-900 border-amber-200/80 font-bold">
                          {group.members.length} Anggota
                        </Badge>
                      </div>

                      <ol className="space-y-1.5 list-decimal list-inside text-sm text-stone-800 font-medium">
                        {group.members.map((member, mIdx) => (
                          <li key={`${group.groupNumber}-${mIdx}`} className="py-0.5">
                            <span>{member}</span>
                          </li>
                        ))}
                      </ol>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-[#e8e4dc] p-12 text-center flex flex-col items-center justify-center min-h-[360px] text-stone-400 space-y-3 select-none">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                <Users className="w-7 h-7" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-stone-600 max-w-sm">
                Pilih metode pembagian di sebelah kiri lalu klik tombol{' '}
                <span className="font-bold text-stone-900">Bagi Kelompok Sekarang</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
