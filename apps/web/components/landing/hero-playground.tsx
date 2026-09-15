'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Shuffle,
  Clock,
  BarChart2,
  Volume2,
  Zap,
} from 'lucide-react';
import { Button } from '@walikelas/ui';
import { motion, AnimatePresence } from 'motion/react';

const sampleStudents = [
  'Budi Santoso',
  'Siti Rahma',
  'Ahmad Fauzi',
  'Dewi Lestari',
  'Rian Pratama',
  'Nadia Putri',
];

export function HeroPlayground(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'poll' | 'timer' | 'picker'>('poll');

  // Interactive Poll state
  const [pollVotes, setPollVotes] = useState<number[]>([22, 3, 2, 1]);
  const [selectedVoteIndex, setSelectedVoteIndex] = useState<number | null>(null);
  const [voteSubmittedToast, setVoteSubmittedToast] = useState(false);

  const totalVotes = pollVotes.reduce((a, b) => a + b, 0);
  const pollOptions = [
    { label: 'A. Es mencair', count: pollVotes[0] ?? 0 },
    { label: 'B. Kertas terbakar', count: pollVotes[1] ?? 0 },
    { label: 'C. Besi berkarat', count: pollVotes[2] ?? 0 },
    { label: 'D. Kayu melapuk', count: pollVotes[3] ?? 0 },
  ];

  const handleCastVote = (index: number) => {
    if (selectedVoteIndex === index) return;
    const newVotes = [...pollVotes];
    if (selectedVoteIndex !== null && newVotes[selectedVoteIndex] !== undefined) {
      newVotes[selectedVoteIndex] = Math.max(0, (newVotes[selectedVoteIndex] as number) - 1);
    }
    if (newVotes[index] !== undefined) {
      newVotes[index] = (newVotes[index] as number) + 1;
    }
    setPollVotes(newVotes);
    setSelectedVoteIndex(index);
    setVoteSubmittedToast(true);
    setTimeout(() => setVoteSubmittedToast(false), 3500);
  };

  // Interactive Timer state
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleToggleTimer = () => {
    if (timerSeconds === 0) setTimerSeconds(45);
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(45);
  };

  // Interactive Random Picker state
  const [pickerStudents] = useState<string[]>(sampleStudents);
  const [selectedStudent, setSelectedStudent] = useState<string>('Ahmad Fauzi');
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleDisplay, setShuffleDisplay] = useState<string>('Ahmad Fauzi');

  const handlePickRandom = () => {
    if (isShuffling) return;
    setIsShuffling(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * pickerStudents.length);
      const studentName = pickerStudents[randomIdx] ?? 'Siswa';
      setShuffleDisplay(studentName);
      counter += 1;
      if (counter > 12) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * pickerStudents.length);
        const finalStudent = pickerStudents[finalIdx] ?? 'Siswa';
        setSelectedStudent(finalStudent);
        setShuffleDisplay(finalStudent);
        setIsShuffling(false);
      }
    }, 75);
  };

  return (
    <div className="w-full bg-[#0c1322] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-white">
      {/* Top Simulated Projection Status */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
            Sesi Proyektor Aktif
          </span>
          <span className="font-mono bg-amber-500/10 text-amber-300 font-bold px-2 py-0.5 rounded text-[11px] border border-amber-500/30">
            MK-78
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>28 Siswa</span>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('poll')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'poll'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Live Poll</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'timer'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timer</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('picker')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'picker'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Acak Nama</span>
        </button>
      </div>

      {/* Tab Content Stage */}
      <div className="min-h-[290px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'poll' && (
            <motion.div
              key="poll"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  Coba klik jawaban di bawah &darr;
                </span>
                <span className="font-mono text-slate-400 text-[11px]">Total: {totalVotes} respon</span>
              </div>

              <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs sm:text-sm font-bold text-white leading-snug">
                &ldquo;Manakah dari contoh berikut yang merupakan perubahan fisika?&rdquo;
              </div>

              <div className="space-y-2">
                {pollOptions.map((opt, idx) => {
                  const percentage = totalVotes > 0 ? Math.round((opt.count / totalVotes) * 100) : 0;
                  const isSelected = selectedVoteIndex === idx;

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleCastVote(idx)}
                      className={`w-full relative overflow-hidden text-left p-3 rounded-xl border transition-all duration-150 flex items-center justify-between text-xs sm:text-sm ${
                        isSelected
                          ? 'border-amber-500/80 bg-amber-500/15 ring-1 ring-amber-500/50 text-white'
                          : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40 text-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out ${
                          isSelected ? 'bg-amber-500/30' : 'bg-slate-800/40'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="relative z-10 font-semibold truncate pr-2 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-500'}`} />
                        {opt.label}
                      </span>
                      <span className="relative z-10 font-mono font-bold text-slate-300 shrink-0 text-xs">
                        {percentage}% <span className="text-slate-400 font-normal">({opt.count})</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {voteSubmittedToast && (
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
                  <span>✓ Respon Anda terkirim &amp; terupdate di proyektor!</span>
                </div>
              )}

              {/* Bottom Footer Info inside Poll */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Zap className="w-3.5 h-3.5" /> Respons langsung terakumulasi
                </span>
                <span className="text-slate-500">Bisa dicoba langsung oleh guru</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="bg-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center space-y-4"
            >
              <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
                <span className="font-bold text-amber-400 uppercase tracking-wider">
                  Timer Diskusi Soal
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-mono">
                  <Volume2 className="w-3.5 h-3.5" /> Bel Siap
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <div className="font-mono text-5xl font-black tracking-widest text-amber-400 drop-shadow-xs">
                  00:{timerSeconds.toString().padStart(2, '0')}
                </div>
                <div className="w-48 bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(timerSeconds / 60) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleToggleTimer}
                  className={`font-bold px-5 h-9 text-xs rounded-lg flex items-center gap-1.5 ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Jeda Timer
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Mulai Hitung Mundur
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResetTimer}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 h-9 px-3 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                </Button>
              </div>

              <div className="pt-2 flex items-center justify-between w-full text-[11px] text-slate-400 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Kontrol ritme fokus siswa
                </span>
                <span className="text-slate-500">Otomatis berdering saat habis</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'picker' && (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="bg-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center space-y-4"
            >
              <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
                <span className="font-bold text-amber-400 uppercase tracking-wider">
                  Pemilih Giliran Siswa
                </span>
                <span className="text-stone-300 font-mono">6 Siswa Aktif</span>
              </div>

              <div className="w-full flex flex-col items-center justify-center py-2">
                <div
                  className={`w-full text-center py-4 px-3 rounded-xl border transition-all duration-150 ${
                    isShuffling
                      ? 'bg-amber-500/15 border-amber-500/60 scale-[1.02]'
                      : 'bg-slate-900 border-slate-700/80 shadow-inner'
                  }`}
                >
                  <span className="text-xs text-slate-400 block mb-1">Siswa Terpilih:</span>
                  <div className="font-black text-2xl text-amber-400 tracking-tight flex items-center justify-center gap-2">
                    <Sparkles
                      className={`w-5 h-5 text-amber-300 ${
                        isShuffling ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{isShuffling ? shuffleDisplay : selectedStudent}</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 mt-3 max-w-xs">
                  {pickerStudents.map((s) => (
                    <span
                      key={s}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                        s === selectedStudent && !isShuffling
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {s.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handlePickRandom}
                disabled={isShuffling}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 h-9 text-xs shadow-xs"
              >
                <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                {isShuffling ? 'Mengacak...' : 'Acak Giliran Baru'}
              </Button>

              <div className="pt-2 flex items-center justify-between w-full text-[11px] text-slate-400 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Shuffle className="w-3.5 h-3.5" /> Adil &amp; transparan
                </span>
                <span className="text-slate-500">Tanpa bias pemilihan</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
