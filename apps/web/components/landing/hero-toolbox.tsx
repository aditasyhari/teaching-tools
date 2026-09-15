'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Shuffle,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Users,
  Trophy,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import { Button } from '@walikelas/ui';
import { motion } from 'motion/react';

const sampleStudents = ['Budi', 'Siti', 'Ahmad', 'Dewi', 'Rian', 'Nadia'];

export function HeroToolbox(): React.JSX.Element {
  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(300); // 05:00
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

  const toggleTimer = () => {
    if (timerSeconds === 0) setTimerSeconds(300);
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(300);
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timerFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Random Picker State
  const [selectedStudent, setSelectedStudent] = useState('Siti Rahma');
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleDisplay, setShuffleDisplay] = useState('Siti Rahma');

  const pickStudent = () => {
    if (isShuffling) return;
    setIsShuffling(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * sampleStudents.length);
      setShuffleDisplay(sampleStudents[randomIdx] ?? 'Siswa');
      counter += 1;
      if (counter > 10) {
        clearInterval(interval);
        const finalStudent = sampleStudents[Math.floor(Math.random() * sampleStudents.length)] ?? 'Siti';
        setSelectedStudent(finalStudent);
        setShuffleDisplay(finalStudent);
        setIsShuffling(false);
      }
    }, 70);
  };

  // Live Quiz State
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(0);

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Floating Accent Badges (Scoreboard & Group Maker) */}
      <div className="absolute -top-3.5 left-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e8e4dc] shadow-xs text-xs font-semibold text-stone-800">
        <Trophy className="w-3.5 h-3.5 text-amber-500" />
        <span>Scoreboard: Kelompok A (+10)</span>
      </div>

      <div className="absolute -bottom-3 right-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e8e4dc] shadow-xs text-xs font-semibold text-stone-800">
        <Users className="w-3.5 h-3.5 text-teal-600" />
        <span>Group Maker: 4 Kelompok Terbentuk</span>
      </div>

      {/* Main Curated Toolbox Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        {/* Card 1: Interactive Classroom Timer (Large Anchor - col-span-7) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="sm:col-span-7 bg-white border border-[#e8e4dc] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-amber-400/80 transition-all flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Timer Kelas
              </span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Fokus Diskusi
            </span>
          </div>

          <div className="text-center py-2">
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-stone-900 select-none">
              {timerFormatted}
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(timerSeconds / 300) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={toggleTimer}
              className={`h-8 px-4 text-xs font-bold rounded-lg shadow-xs ${
                isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 mr-1" /> Jeda
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1" /> Mulai
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={resetTimer}
              className="h-8 px-3 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>

        {/* Card 2: Random Picker (Medium Anchor - col-span-5) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="sm:col-span-5 bg-white border border-[#e8e4dc] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-amber-400/80 transition-all flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200/60 flex items-center justify-center text-violet-600">
                <Shuffle className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Acak Nama
              </span>
            </div>
          </div>

          <div className="bg-[#faf8f5] border border-[#e8e4dc] rounded-xl p-3 text-center my-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-0.5">
              Giliran Maju
            </span>
            <div className="font-black text-base sm:text-lg text-stone-900 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="truncate">{isShuffling ? shuffleDisplay : selectedStudent}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={pickStudent}
            disabled={isShuffling}
            className="w-full h-8 text-xs font-bold rounded-lg shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1" />
            {isShuffling ? 'Mengacak...' : 'Pilih Siswa'}
          </Button>
        </motion.div>

        {/* Card 3: Live Quiz Question Card (Large Anchor - col-span-12) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="sm:col-span-12 bg-white border border-[#e8e4dc] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-amber-400/80 transition-all space-y-3"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-stone-900 uppercase tracking-wider block leading-tight">
                  Live Quiz Interaktif
                </span>
                <span className="text-[10px] text-stone-500">Kuis kilat pemahaman materi</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[11px] font-bold text-amber-900">
              <BarChart2 className="w-3 h-3 text-amber-600" />
              <span>28 Siswa Menjawab</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
            &ldquo;Peristiwa manakah yang tergolong perubahan fisika?&rdquo;
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 0, label: 'A. Es mencair', count: '82%', isCorrect: true },
              { id: 1, label: 'B. Kertas terbakar', count: '11%', isCorrect: false },
              { id: 2, label: 'C. Besi berkarat', count: '5%', isCorrect: false },
              { id: 3, label: 'D. Kayu melapuk', count: '2%', isCorrect: false },
            ].map((opt) => {
              const isSelected = selectedQuizOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedQuizOption(opt.id)}
                  className={`relative overflow-hidden text-left px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 text-stone-950 font-bold shadow-2xs ring-1 ring-amber-400/50'
                      : 'border-[#e8e4dc] bg-[#faf8f5] hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <span className="relative z-10 truncate pr-1 flex items-center gap-1.5">
                    {opt.isCorrect && isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    {opt.label}
                  </span>
                  <span className="relative z-10 font-mono text-[11px] text-stone-500 shrink-0">
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

