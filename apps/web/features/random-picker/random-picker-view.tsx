'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Shuffle,
  Sparkles,
  RotateCcw,
  Trash2,
  Users,
  History,
  FileText,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from 'lucide-react';
import { Button, Badge, Card, Textarea } from '@walikelas/ui';
import { motion } from 'motion/react';
import { winnerRevealMotion } from '../../lib/motion';
import { useRandomPicker } from './use-random-picker';
import { useOptionalAuth } from '../../lib/auth-context';

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
    items,
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

  const [displayCandidate, setDisplayCandidate] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showRoster, setShowRoster] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const auth = useOptionalAuth();
  const activeClassroom = auth?.activeClassroom;
  const activeStudents = useMemo(() => {
    if (!activeClassroom?.members) return [];
    return activeClassroom.members
      .filter((m) => m.status === 'ACTIVE')
      .map((m) => m.displayName.trim())
      .filter(Boolean);
  }, [activeClassroom]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const handlePick = useCallback(() => {
    if (itemCount === 0 || isSpinning || isPicking) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || itemCount === 1) {
      const chosen = pick();
      if (chosen) {
        setDisplayCandidate(chosen);
        setAnnouncement(`Siswa terpilih: ${chosen}`);
      }
      return;
    }

    setIsSpinning(true);

    let counter = 0;
    const totalCycles = 14;
    let delay = 50;

    const runShuffleStep = () => {
      counter++;
      const randomIdx = Math.floor(Math.random() * items.length);
      if (items[randomIdx] && isMountedRef.current) {
        setDisplayCandidate(items[randomIdx]);
      }

      if (counter < totalCycles) {
        if (counter > 8) {
          delay += 25; // Smooth deceleration
        }
        spinIntervalRef.current = setTimeout(runShuffleStep, delay) as unknown as NodeJS.Timeout;
      } else {
        const finalChosen = pick();
        if (isMountedRef.current) {
          setDisplayCandidate(finalChosen);
          setIsSpinning(false);
          if (finalChosen) {
            setAnnouncement(`Siswa terpilih: ${finalChosen}`);
          }
        }
      }
    };

    // Run first step immediately at 0ms for instant button response
    runShuffleStep();
  }, [itemCount, isSpinning, isPicking, items, pick]);

  const handleLoadSample = useCallback(() => {
    setRawInput(SAMPLE_NAMES.join('\n'));
    clear();
    setDisplayCandidate(null);
    setAnnouncement('Daftar contoh 10 nama siswa dimuat');
  }, [setRawInput, clear]);

  const handleResetAll = useCallback(() => {
    resetAll();
    setDisplayCandidate(null);
    setAnnouncement('Daftar nama dikosongkan');
  }, [resetAll]);

  const handleClearHistory = useCallback(() => {
    clear();
    setDisplayCandidate(null);
    setAnnouncement('Riwayat pilihan dihapus');
  }, [clear]);

  // Global Space shortcut for quick classroom picking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isTyping) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePick();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleClearHistory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePick, handleClearHistory]);

  const currentWinner = displayCandidate || selectedItem;

  return (
    <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto space-y-6 focus:outline-none">
      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Header Bar */}
      <Card className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs border-[#e8e4dc] bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
            <Shuffle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                Random Picker
              </h1>
              <Badge variant="neutral" size="sm">
                {itemCount} nama terdaftar
              </Badge>
            </div>
            <p className="text-xs text-stone-600 hidden sm:block">
              Pilih siswa secara acak untuk giliran menjawab atau presentasi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadSample}
            aria-label="Muat daftar contoh nama siswa"
            className="text-stone-700 hover:text-stone-900 hover:bg-stone-100"
            leftIcon={<FileText className="w-4 h-4 text-stone-500" aria-hidden="true" />}
          >
            <span className="text-xs font-semibold">Contoh Nama</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            aria-label="Kosongkan seluruh daftar nama"
            className="text-stone-700 hover:text-red-700 hover:bg-red-50"
            leftIcon={<Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />}
          >
            <span className="text-xs font-semibold">Kosongkan</span>
          </Button>
        </div>
      </Card>

      {/* Main Focal Picker Stage */}
      <section
        aria-label="Area Panggung Pemilihan Acak"
        className={`bg-white rounded-3xl border-2 p-5 xs:p-8 sm:p-14 lg:p-16 shadow-xs flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[300px] xs:min-h-[340px] select-none ${
          currentWinner && !isSpinning
            ? 'border-amber-400 bg-amber-50/30 ring-4 ring-amber-100/60'
            : isSpinning
              ? 'border-amber-500 ring-4 ring-amber-200/80 animate-pulse'
              : 'border-[#e8e4dc]'
        }`}
      >
        {currentWinner ? (
          <div className="space-y-4 max-w-2xl w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-bold border border-amber-200 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>{isSpinning ? 'Mengacak Nama...' : 'Siswa Terpilih!'}</span>
            </div>

            {/* Winner Display with Massive Distance Projector Readability */}
            <motion.div
              key={isSpinning ? 'spinning' : currentWinner}
              variants={isSpinning ? undefined : winnerRevealMotion}
              initial={isSpinning ? false : 'initial'}
              animate={isSpinning ? false : 'animate'}
              role="status"
              aria-label={currentWinner}
              className={`text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-stone-900 tracking-tight break-words transition-all duration-150 ${
                isSpinning ? 'scale-95 opacity-60' : 'scale-100 opacity-100'
              }`}
            >
              {currentWinner}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-3 text-stone-400 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Users className="w-8 h-8" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-stone-600">
              {itemCount > 0
                ? 'Klik tombol di bawah untuk mengundi nama siswa'
                : 'Daftar nama masih kosong. Muat contoh atau ketik nama di bawah.'}
            </p>
          </div>
        )}

        {/* Primary Action Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Button
            variant="primary"
            size="lg"
            className="px-8 py-3.5 text-base font-bold bg-amber-500 hover:bg-amber-600 text-stone-900 border-amber-600 shadow-sm"
            disabled={itemCount === 0 || isSpinning}
            leftIcon={<Shuffle className="w-5 h-5 fill-current" aria-hidden="true" />}
            onClick={handlePick}
            aria-label="Undi nama siswa acak (Spasi)"
          >
            <span>{isSpinning ? 'Mengacak...' : currentWinner ? 'Pilih Lagi Acak' : 'Pilih Siswa Acak'}</span>
            <kbd className="hidden sm:inline-block ml-2.5 px-1.5 py-0.5 text-[11px] font-mono rounded bg-amber-600/20 text-stone-900 font-bold uppercase tracking-wider">
              Spasi
            </kbd>
          </Button>

          {currentWinner && (
            <Button
              variant="outline"
              size="lg"
              className="px-6 py-3.5 text-base font-semibold border-[#e8e4dc] bg-white text-stone-700 hover:bg-stone-50"
              leftIcon={<RotateCcw className="w-4 h-4 text-stone-600" aria-hidden="true" />}
              onClick={handleClearHistory}
              aria-label="Atur ulang pilihan (R)"
            >
              <span>Reset</span>
              <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[11px] font-mono rounded bg-stone-100 text-stone-600 font-bold border border-stone-200 uppercase tracking-wider">
                R
              </kbd>
            </Button>
          )}
        </div>
      </section>

      {/* Winner History Strip */}
      {history.length > 0 && (
        <Card className="p-4 sm:p-5 space-y-3 border-[#e8e4dc] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider">
              <History className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>Riwayat Terpilih ({history.length})</span>
            </div>
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              Hapus Riwayat
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
            {history.map((name, idx) => (
              <span
                key={`${name}-${idx}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/70"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                {name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Roster Setup / Input Card */}
      <Card className="border-[#e8e4dc] bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRoster((prev) => !prev)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-50/70 transition-colors cursor-pointer"
          aria-expanded={showRoster}
          aria-controls="roster-editor-panel"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-stone-500" aria-hidden="true" />
            <h2 className="text-sm font-bold text-stone-900">
              Daftar Nama Siswa ({itemCount})
            </h2>
            <span className="text-xs text-stone-400 hidden sm:inline">&bull; 1 nama per baris</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">
              {showRoster ? 'Sembunyikan' : 'Edit Daftar'}
            </span>
            {showRoster ? (
              <ChevronUp className="w-4 h-4 text-stone-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500" aria-hidden="true" />
            )}
          </div>
        </button>

        {showRoster && (
          <div id="roster-editor-panel" className="p-4 sm:p-5 pt-0 space-y-4 border-t border-stone-100">
            {activeClassroom && activeStudents.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs">
                <div className="flex items-center gap-2 text-stone-800">
                  <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                  <span>
                    Konteks Kelas Aktif: <strong>{activeClassroom.name}</strong> ({activeStudents.length} siswa)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-white hover:bg-amber-100 text-stone-900 border-amber-300 font-bold text-xs h-7 self-start sm:self-auto shadow-xs"
                  onClick={() => {
                    setRawInput(activeStudents.join('\n'));
                    setAnnouncement(`Daftar siswa dari kelas ${activeClassroom.name} berhasil dimuat.`);
                  }}
                >
                  Muat Siswa Kelas Ini
                </Button>
              </div>
            )}

            <Textarea
              id="names-input"
              rows={8}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Ketik atau tempel nama siswa di sini...&#10;Contoh:&#10;Ahmad&#10;Budi&#10;Citra"
              className="w-full font-medium font-sans leading-relaxed resize-y border-[#e8e4dc] focus-visible:ring-amber-500 text-stone-900 bg-[#fdfcfb]"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowRepeat}
                  onChange={(e) => setAllowRepeat(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>Boleh Terpilih Berulang Langsung</span>
              </label>

              <span className="text-xs text-stone-500 font-medium">
                Total {itemCount} siswa siap diundi
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Keyboard Helper Footer */}
      <footer className="p-3 bg-stone-100/70 border border-[#e8e4dc] rounded-2xl text-center text-xs text-stone-600">
        <span className="font-semibold text-stone-700">Pintasan Praktis:</span> Tekan{' '}
        <kbd className="px-1.5 py-0.5 font-mono text-[11px] font-bold bg-white border border-stone-200 rounded text-stone-800">
          Spasi
        </kbd>{' '}
        untuk Mengundi Nama &bull; Tekan{' '}
        <kbd className="px-1.5 py-0.5 font-mono text-[11px] font-bold bg-white border border-stone-200 rounded text-stone-800">
          R
        </kbd>{' '}
        untuk Reset
      </footer>
    </main>
  );
}
