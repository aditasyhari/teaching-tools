'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Shuffle,
  Users,
  Trophy,
  FileText,
  HelpCircle,
  BarChart2,
  Hand,
  MessageSquare,
  Lightbulb,
  Cloud,
  CheckCircle2,
  Layers,
  Monitor,
  Smartphone,
  ShieldCheck,
  Check,
  Menu,
  X,
  Laptop,
  Tv,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { Button, Badge } from '@walikelas/ui';
import { TOOLS } from '@walikelas/config';
import { useAuth } from '../lib/auth-context';

const toolIcons: Record<string, React.ReactNode> = {
  timer: <Clock className="w-5 h-5 text-amber-600" />,
  'random-picker': <Shuffle className="w-5 h-5 text-violet-600" />,
  'group-maker': <Users className="w-5 h-5 text-teal-600" />,
  scoreboard: <Trophy className="w-5 h-5 text-amber-600" />,
  'teacher-notes': <FileText className="w-5 h-5 text-rose-600" />,
  'live-quiz': <HelpCircle className="w-5 h-5 text-blue-600" />,
  'live-poll': <BarChart2 className="w-5 h-5 text-emerald-600" />,
  'raise-hand': <Hand className="w-5 h-5 text-indigo-600" />,
  'question-box': <MessageSquare className="w-5 h-5 text-sky-600" />,
  'brainstorm-board': <Lightbulb className="w-5 h-5 text-amber-600" />,
  'word-cloud': <Cloud className="w-5 h-5 text-cyan-600" />,
  'exit-ticket': <CheckCircle2 className="w-5 h-5 text-rose-600" />,
  flashcards: <Layers className="w-5 h-5 text-emerald-600" />,
};

const toolClassroomDescriptions: Record<string, string> = {
  timer: 'Atur durasi pengerjaan soal dan diskusi kelompok tanpa perlu berganti aplikasi.',
  'random-picker': 'Pilih siswa secara acak dan adil untuk giliran presentasi atau tanya jawab.',
  'group-maker': 'Bagi kelompok belajar siswa secara merata dan instan dalam hitungan detik.',
  scoreboard: 'Catat perolehan skor antartim saat sesi permainan atau kuis cerdas cermat kelas.',
  'teacher-notes': 'Catat poin penting dan observasi perilaku siswa selama pelajaran berlangsung.',
  'live-quiz': 'Uji pemahaman materi dengan kuis kilat, leaderboard otomatis, dan pembahasan langsung.',
  'live-poll': 'Ketahui opini dan pemahaman kelas seketika melalui jajak pendapat interaktif.',
  'raise-hand': 'Atur antrean bertanya siswa secara tertib saat sesi diskusi kelas sedang berjalan.',
  'question-box': 'Beri ruang aman bagi siswa untuk mengajukan pertanyaan tanpa ragu atau cemas.',
  'brainstorm-board': 'Kumpulkan ide dan curah pendapat seluruh siswa pada satu papan bersama.',
  'word-cloud': 'Visualisasikan kata kunci atau kesimpulan singkat dari seluruh kelas di proyektor.',
  'exit-ticket': 'Cek pemahaman inti 3 menit sebelum kelas berakhir untuk evaluasi mengajar berikutnya.',
  flashcards: 'Tampilkan kartu konsep di layar proyektor untuk mengingat kembali materi esensial.',
};

const sampleStudents = [
  'Budi Santoso',
  'Siti Rahma',
  'Ahmad Fauzi',
  'Dewi Lestari',
  'Rian Pratama',
  'Nadia Putri',
];

export default function HomePage(): React.JSX.Element {
  const [sessionCode, setSessionCode] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, loginWithGoogle } = useAuth();

  // --- Interactive Hero Playground State ---
  const [activeTab, setActiveTab] = useState<'poll' | 'timer' | 'picker'>('poll');

  // Interactive Poll state
  const [pollVotes, setPollVotes] = useState<number[]>([22, 3, 2, 1]);
  const [selectedVoteIndex, setSelectedVoteIndex] = useState<number | null>(null);
  const [voteSubmittedToast, setVoteSubmittedToast] = useState(false);

  const totalVotes = pollVotes.reduce((a, b) => a + b, 0);
  const pollOptions = [
    { label: 'A. Es mencair', count: pollVotes[0] ?? 0, correct: true },
    { label: 'B. Kertas terbakar', count: pollVotes[1] ?? 0, correct: false },
    { label: 'C. Besi berkarat', count: pollVotes[2] ?? 0, correct: false },
    { label: 'D. Kayu melapuk', count: pollVotes[3] ?? 0, correct: false },
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
    if (timerSeconds === 0) {
      setTimerSeconds(60);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(60);
  };

  // Interactive Random Picker state
  const [shuffling, setShuffling] = useState(false);
  const [pickedStudent, setPickedStudent] = useState<string | null>('Budi Santoso');

  const handleShuffleStudent = () => {
    setShuffling(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randomName = sampleStudents[Math.floor(Math.random() * sampleStudents.length)] ?? 'Budi Santoso';
      setPickedStudent(randomName);
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        setShuffling(false);
      }
    }, 100);
  };

  // --- General Form Actions ---
  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionCode.trim()) {
      window.location.href = `/join/${sessionCode.trim().toUpperCase()}`;
    }
  };

  const handleTeacherAccess = () => {
    if (isAuthenticated) {
      window.location.href = '/teacher';
    } else {
      loginWithGoogle();
    }
  };

  const localTools = TOOLS.filter((tool) => tool.category === 'LOCAL' && tool.status === 'AVAILABLE');
  const interactiveTools = TOOLS.filter(
    (tool) => tool.category === 'INTERACTIVE' && tool.status === 'AVAILABLE'
  );
  const reflectionTools = TOOLS.filter(
    (tool) => tool.id === 'exit-ticket' || tool.id === 'teacher-notes' || tool.id === 'flashcards'
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 group-hover:from-blue-700 group-hover:to-indigo-800 transition-all flex items-center justify-center text-white font-bold text-base shadow-sm">
                WK
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg leading-tight text-stone-900 tracking-tight">
                  WaliKelas
                </span>
                <span className="text-[11px] font-semibold text-stone-500 leading-tight">
                  Teaching Tools
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-1 ml-8 pl-6 border-l border-[#e8e4dc]">
              <a
                href="#perkakas"
                className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-blue-600 hover:bg-white/80 rounded-lg transition-colors"
              >
                Perkakas
              </a>
              <a
                href="#cara-kerja"
                className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-blue-600 hover:bg-white/80 rounded-lg transition-colors"
              >
                Cara Kerja
              </a>
              <a
                href="#untuk-guru"
                className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-blue-600 hover:bg-white/80 rounded-lg transition-colors"
              >
                Untuk Guru
              </a>
              <a
                href="/tools"
                className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-blue-600 hover:bg-white/80 rounded-lg transition-colors"
              >
                Katalog Lengkap
              </a>
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {isAuthenticated ? (
              <a href="/teacher">
                <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  Halo, {user?.name.split(' ')[0]} (Buka Ruang Guru)
                </Button>
              </a>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loginWithGoogle}
                  className="text-stone-700 hover:text-stone-900 hover:bg-stone-200/60"
                >
                  Masuk
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTeacherAccess}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
                >
                  Mulai Mengajar
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-[#e8e4dc] bg-[#faf8f5] px-4 pt-2 pb-5 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-1">
              <a
                href="#perkakas"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200/60 rounded-lg"
              >
                Perkakas
              </a>
              <a
                href="#cara-kerja"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200/60 rounded-lg"
              >
                Cara Kerja
              </a>
              <a
                href="#untuk-guru"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200/60 rounded-lg"
              >
                Untuk Guru
              </a>
              <a
                href="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200/60 rounded-lg"
              >
                Katalog Lengkap
              </a>
            </nav>
            <div className="pt-3 border-t border-[#e8e4dc] flex flex-col gap-2">
              {isAuthenticated ? (
                <a href="/teacher" className="w-full">
                  <Button variant="primary" size="md" className="w-full bg-blue-600 hover:bg-blue-700">
                    Buka Ruang Guru ({user?.name.split(' ')[0]})
                  </Button>
                </a>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center border-stone-300"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      loginWithGoogle();
                    }}
                  >
                    Masuk Akun Guru
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleTeacherAccess();
                    }}
                  >
                    Mulai Mengajar Gratis
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden border-b border-[#e8e4dc] bg-gradient-to-b from-[#faf8f5] via-[#f7f3eb] to-[#f4eee2] py-12 sm:py-16 lg:py-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Storytelling & Conversion */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Teaching Tools V1 &bull; Praktis, Ringan, Siap Mengajar</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 leading-[1.15]">
                Tools praktis untuk membuat kegiatan mengajar lebih{' '}
                <span className="relative inline-block text-blue-700">
                  hidup &amp; interaktif.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Dirancang khusus untuk ritme kelas nyata di Indonesia. Guru cukup menyalakan proyektor,
                dan siswa langsung berpartisipasi dari peramban ponsel tanpa unduh aplikasi, tanpa login, dan hemat kuota.
              </p>

              {/* Primary Action Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-md bg-blue-600 hover:bg-blue-700 text-white text-base h-12 px-7 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5"
                  onClick={handleTeacherAccess}
                >
                  <span>Mulai Mengajar Gratis</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="#hero-join" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto h-12 text-base px-5 rounded-xl border border-stone-300 bg-white/90 hover:bg-white text-stone-800 shadow-xs"
                  >
                    Punya Kode Sesi? Masuk Kelas
                  </Button>
                </a>
              </div>

              {/* Product Trust Signals */}
              <div className="pt-4 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-5 text-xs font-semibold text-stone-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <span>Tanpa instalasi untuk siswa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <Monitor className="w-3.5 h-3.5" />
                  </div>
                  <span>Siap di layar proyektor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>Interaksi respons realtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Praktis untuk aktivitas harian</span>
                </div>
              </div>
            </div>

            {/* Right: Authentic Interactive Hero Playground */}
            <div className="lg:col-span-5" id="hero-join">
              <div className="bg-[#0e1626] text-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-stone-800 flex flex-col gap-4 relative">
                {/* Top Classroom Projector HUD Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      SESI PROYEKTOR AKTIF
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-extrabold border border-slate-700">
                      WK-7B
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>28 Siswa</span>
                  </div>
                </div>

                {/* Interactive Tool Selector Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('poll')}
                    className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'poll'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Live Poll</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('timer')}
                    className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'timer'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('picker')}
                    className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'picker'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Acak Nama</span>
                  </button>
                </div>

                {/* --- TAB 1: LIVE POLL --- */}
                {activeTab === 'poll' && (
                  <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider">
                        Coba Klik Jawaban Di Bawah &darr;
                      </span>
                      <span>Total: {totalVotes} respon</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100 leading-snug">
                      &ldquo;Manakah dari contoh berikut yang merupakan perubahan fisika?&rdquo;
                    </p>

                    {/* Interactive Option Cards */}
                    <div className="space-y-2 pt-1 text-xs">
                      {pollOptions.map((opt, idx) => {
                        const count = opt.count ?? 0;
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const isSelected = selectedVoteIndex === idx;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleCastVote(idx)}
                            className={`w-full text-left p-2.5 rounded-lg border transition-all duration-300 relative overflow-hidden group ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40 text-slate-200'
                            }`}
                          >
                            <div
                              className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out opacity-25 ${
                                idx === 0 ? 'bg-emerald-500' : 'bg-slate-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />

                            <div className="relative flex justify-between items-center font-medium">
                              <span className="flex items-center gap-1.5">
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-slate-400" />
                                )}
                                <span className={isSelected ? 'font-bold text-white' : ''}>{opt.label}</span>
                              </span>
                              <span className="font-mono text-[11px] font-bold text-slate-300">
                                {pct}% ({count})
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {voteSubmittedToast && (
                      <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                        <span>✓ Respon Anda terkirim &amp; terupdate di proyektor!</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Zap className="w-3 h-3" /> Respons langsung terakumulasi
                      </span>
                      <span>Bisa dicoba langsung oleh guru</span>
                    </div>
                  </div>
                )}

                {/* --- TAB 2: TIMER KELAS --- */}
                {activeTab === 'timer' && (
                  <div className="bg-slate-950/70 rounded-xl p-5 border border-slate-800/80 flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
                      <span className="font-bold text-amber-400 uppercase tracking-wider">
                        Timer Diskusi Soal
                      </span>
                      <span className="flex items-center gap-1 text-amber-300 font-mono">
                        <Volume2 className="w-3.5 h-3.5" /> Suara Bel Aktif
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="font-mono text-5xl sm:text-6xl font-black tracking-widest text-amber-400 drop-shadow-md">
                        00:{timerSeconds.toString().padStart(2, '0')}
                      </div>
                      <div className="w-48 bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
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
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
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

                    <p className="text-[11px] text-slate-400 text-center">
                      Coba tekan tombol di atas untuk melihat bagaimana timer mengawal fokus kelas.
                    </p>
                  </div>
                )}

                {/* --- TAB 3: RANDOM PICKER --- */}
                {activeTab === 'picker' && (
                  <div className="bg-slate-950/70 rounded-xl p-5 border border-slate-800/80 flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
                      <span className="font-bold text-violet-400 uppercase tracking-wider">
                        Pemilih Giliran Presentasi
                      </span>
                      <span>6 Siswa Siap</span>
                    </div>

                    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                      <span className="text-xs text-slate-400 block mb-1">
                        {shuffling ? 'Mengacak nama murid...' : 'Siswa Terpilih:'}
                      </span>
                      <div
                        className={`text-2xl font-extrabold transition-all duration-150 ${
                          shuffling ? 'text-amber-400 scale-95' : 'text-white scale-100'
                        }`}
                      >
                        {pickedStudent}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleShuffleStudent}
                      disabled={shuffling}
                      className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-10 px-6 rounded-lg text-xs flex items-center gap-2 shadow-md"
                    >
                      <Shuffle className={`w-3.5 h-3.5 ${shuffling ? 'animate-spin' : ''}`} />
                      {shuffling ? 'Mengacak...' : 'Putar Acak Siswa'}
                    </Button>

                    <p className="text-[11px] text-slate-400 text-center">
                      Adil, transparan, dan menghilangkan rasa sungkan saat menunjuk giliran tanya jawab.
                    </p>
                  </div>
                )}

                {/* Integrated Student Join Form (Matches Test Expectation) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <form onSubmit={handleJoinSession} className="space-y-2">
                    <label
                      htmlFor="hero-session-code"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                    >
                      Punya Kode Sesi Kelas Hari Ini?
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="hero-session-code"
                        type="text"
                        maxLength={6}
                        value={sessionCode}
                        onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                        placeholder="KODE: WK-982"
                        className="flex-1 text-center tracking-[0.2em] font-mono text-base uppercase h-10 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 font-bold px-4 h-10 text-xs whitespace-nowrap"
                        disabled={!sessionCode.trim()}
                      >
                        Gabung
                      </Button>
                    </div>
                  </form>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Siswa cukup membuka browser dan memasukkan kode kelas tanpa mendaftar akun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product in Action: The Classroom Orchestration Stage */}
      <section className="py-16 bg-[#f4eee2] border-b border-[#e8e4dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-3 py-1 rounded-full uppercase tracking-wider">
              Alur Mengajar Nyata
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2.5 tracking-tight">
              Tiga Titik Temu Tanpa Hambatan Teknis
            </h2>
            <p className="text-stone-600 mt-2 text-sm sm:text-base">
              Menyatukan apa yang ada di meja guru, layar besar kelas, dan tangan siswa menjadi satu pengalaman yang seru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Screen 1: Laptop Guru */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    Meja Guru
                  </span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">1. Kendali Penuh di Laptop Guru</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Guru mengontrol jalannya kuis, mengatur durasi timer, menyembunyikan kunci jawaban, dan memantau siswa yang aktif tanpa perlu berdiri lama di depan papan.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-semibold text-blue-600">
                <Check className="w-4 h-4 mr-1.5" /> Privasi jawaban &amp; catatan aman
              </div>
            </div>

            {/* Screen 2: Layar Proyektor */}
            <div className="bg-white rounded-2xl p-6 border border-amber-300 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-full pointer-events-none" />
              <div className="space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                    <Tv className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Layar Proyektor
                  </span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">2. Tampilan Bersama yang Memikat</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Tampilan khusus proyektor dengan kontras tinggi, font besar, dan visual bersih. Seluruh kelas dapat melihat kode sesi, grafik respon, dan leaderboard bersama-sama.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-semibold text-amber-700">
                <Check className="w-4 h-4 mr-1.5" /> Terbaca jelas hingga bangku belakang
              </div>
            </div>

            {/* Screen 3: Ponsel Siswa */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Gawai Siswa
                  </span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">3. Respons Instan dari Ponsel</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Siswa cukup memindai QR code atau mengetik kode 6 karakter. Antarmuka sentuh besar dan sederhana, dirancang hemat baterai dan ringan di sinyal seluler sekolah.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-semibold text-emerald-600">
                <Check className="w-4 h-4 mr-1.5" /> 100% tanpa login atau password
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Cara Kerja Section */}
      <section id="cara-kerja" className="py-16 sm:py-20 border-b border-[#e8e4dc] bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Kemudahan Implementasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1.5 tracking-tight">
              Tiga Langkah Sederhana Menghidupkan Kelas
            </h2>
            <p className="text-stone-600 mt-2 text-sm sm:text-base">
              Tidak butuh pelatihan berminggu-minggu. Siapa pun dapat langsung mempraktikkannya di kelas hari ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="p-7 rounded-2xl border border-[#e8e4dc] bg-white shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-amber-500 font-mono tracking-tight">
                    01
                  </span>
                  <Badge variant="neutral" size="sm" className="bg-amber-100/60 text-amber-900 border-none font-semibold">
                    Langkah Awal
                  </Badge>
                </div>
                <h3 className="font-bold text-lg text-stone-900">Pilih Aktivitas Belajar</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Pilih apakah ingin membuka Live Quiz untuk tes pemahaman, Live Poll untuk voting opini, atau Timer &amp; Random Picker untuk mengelola ritme tugas kelompok.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 flex items-center text-xs text-stone-500 font-medium">
                <Check className="w-4 h-4 text-amber-600 mr-1.5" /> Tanpa berkas Excel rumit
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-7 rounded-2xl border border-[#e8e4dc] bg-white shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-blue-600 font-mono tracking-tight">
                    02
                  </span>
                  <Badge variant="neutral" size="sm" className="bg-blue-100/60 text-blue-900 border-none font-semibold">
                    Tampilan Bersama
                  </Badge>
                </div>
                <h3 className="font-bold text-lg text-stone-900">Tampilkan ke Layar Kelas</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Buka tab Mode Proyektor di layar besar kelas. Tampilan otomatis menyesuaikan skala resolusi proyektor agar kode sesi dan pertanyaan terbaca tajam dari seluruh sudut ruangan.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 flex items-center text-xs text-stone-500 font-medium">
                <Check className="w-4 h-4 text-blue-600 mr-1.5" /> Mode proyektor otomatis
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-7 rounded-2xl border border-[#e8e4dc] bg-white shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight">
                    03
                  </span>
                  <Badge variant="success" size="sm" className="bg-emerald-100/60 text-emerald-900 border-none font-semibold">
                    Hasil Seketika
                  </Badge>
                </div>
                <h3 className="font-bold text-lg text-stone-900">Interaksi &amp; Evaluasi Realtime</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Siswa mengirim jawaban langsung dari ponsel. Guru dapat langsung membahas opsi yang paling sering salah dipilih sebelum loncat ke topik bab berikutnya.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 flex items-center text-xs text-stone-500 font-medium">
                <Check className="w-4 h-4 text-emerald-600 mr-1.5" /> Umpan balik pedagogis seketika
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Teacher's Toolkit Showcase (Rich Colorful Cards) */}
      <section id="perkakas" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Teacher&apos;s Toolkit
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 tracking-tight">
              Koleksi Perkakas Mengajar Terpadu
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-xl">
              Setiap alat memiliki warna dan karakternya sendiri, dirancang untuk beragam momen di dalam kelas.
            </p>
          </div>
          <a href="/tools">
            <Button variant="outline" size="sm" className="whitespace-nowrap border-stone-300 bg-white shadow-xs">
              Lihat Semua di Katalog
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </a>
        </div>

        {/* Featured Interactive Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spotlight 1: Live Quiz */}
          <div className="bg-gradient-to-br from-[#121c33] via-[#0e1628] to-[#0a101f] text-white p-6 sm:p-7 rounded-2xl shadow-lg border border-blue-900/60 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
            <div className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 shadow-xs">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <Badge variant="default" size="sm" className="bg-blue-500/20 text-blue-200 border-blue-400/30 font-semibold">
                  Aktivitas Interaktif Unggulan
                </Badge>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Live Quiz</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Uji pemahaman materi secara kompetitif dan menggugah semangat belajar. Dilengkapi leaderboard otomatis, batas waktu dinamis per soal, dan rekap skor kelas.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-blue-200">
                <span className="px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800/80 font-medium">
                  &bull; Leaderboard Realtime
                </span>
                <span className="px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800/80 font-medium">
                  &bull; Timer Fleksibel
                </span>
                <span className="px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800/80 font-medium">
                  &bull; Pembahasan Bersama
                </span>
              </div>
            </div>
            <a href="/tools/live-quiz" className="pt-2">
              <Button variant="primary" size="md" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 shadow-sm">
                Buka Live Quiz
              </Button>
            </a>
          </div>

          {/* Spotlight 2: Live Poll */}
          <div className="bg-gradient-to-br from-[#0c1f1a] via-[#091714] to-[#07120f] text-white p-6 sm:p-7 rounded-2xl shadow-lg border border-emerald-900/60 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            <div className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-xs">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <Badge variant="neutral" size="sm" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 font-semibold">
                  Cek Pemahaman Cepat
                </Badge>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Live Poll</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Tahu apa yang dipikirkan kelas dalam 10 detik. Tampilkan grafik batang yang bergerak dinamis saat setiap murid mengirimkan pilihannya dari ponsel.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/80 font-medium">
                  &bull; Grafik Batang Dinamis
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/80 font-medium">
                  &bull; Opsi Anonim / Bernama
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/80 font-medium">
                  &bull; Evaluasi Opini Cepat
                </span>
              </div>
            </div>
            <a href="/tools/live-poll" className="pt-2">
              <Button variant="primary" size="md" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 shadow-sm">
                Buka Live Poll
              </Button>
            </a>
          </div>
        </div>

        {/* Shelf 1: Utilitas Cepat & Spontan (Amber & Violet Tones) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2.5">
            <Badge variant="warning" size="md" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
              Utilitas Cepat &amp; Spontan
            </Badge>
            <span className="text-xs text-stone-500 hidden sm:inline">
              Langsung jalan di browser tanpa butuh setup atau login
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {localTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white p-5 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-50/90 flex items-center justify-center border border-amber-200/80">
                    {toolIcons[tool.id]}
                  </div>
                  <h4 className="font-bold text-stone-900 text-base">{tool.name}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {toolClassroomDescriptions[tool.id] || tool.description}
                  </p>
                </div>
                <a href={tool.route}>
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-stone-300 hover:border-amber-500 hover:bg-amber-50/50">
                    Gunakan Alat
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Shelf 2: Partisipasi & Suara Siswa (Teal & Indigo Tones) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5">
            <Badge variant="default" size="md" className="bg-blue-100 text-blue-900 border-blue-300 font-bold">
              Partisipasi &amp; Diskusi Kelas
            </Badge>
            <span className="text-xs text-stone-500 hidden sm:inline">
              Membangun keterlibatan aktif dan budaya berani berpendapat
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {interactiveTools
              .filter((tool) => tool.id !== 'live-quiz' && tool.id !== 'live-poll' && tool.id !== 'exit-ticket')
              .map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white p-5 rounded-xl border border-stone-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50/90 flex items-center justify-center border border-blue-200/80">
                        {toolIcons[tool.id]}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900">{tool.name}</h4>
                        <span className="text-[11px] text-blue-700 font-semibold">
                          &bull; Realtime Kelas
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {toolClassroomDescriptions[tool.id] || tool.description}
                    </p>
                  </div>
                  <a href={tool.route}>
                    <Button variant="secondary" size="sm" className="w-full text-xs font-semibold bg-stone-100 hover:bg-blue-50 hover:text-blue-700">
                      Buka di Kelas
                    </Button>
                  </a>
                </div>
              ))}
          </div>
        </div>

        {/* Shelf 3: Refleksi & Evaluasi Akhir (Rose & Coral Tones) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5">
            <Badge variant="neutral" size="md" className="bg-rose-100 text-rose-900 border-rose-300 font-bold">
              Refleksi &amp; Penutup Pembelajaran
            </Badge>
            <span className="text-xs text-stone-500 hidden sm:inline">
              Memastikan materi esensial terangkum sebelum bel berbunyi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reflectionTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white p-5 rounded-xl border border-stone-200 hover:border-rose-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50/90 flex items-center justify-center border border-rose-200/80">
                      {toolIcons[tool.id]}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">{tool.name}</h4>
                      <span className="text-[11px] text-rose-700 font-semibold">Evaluasi Pelajaran</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {toolClassroomDescriptions[tool.id] || tool.description}
                  </p>
                </div>
                <a href={tool.route}>
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-stone-300 hover:border-rose-500 hover:bg-rose-50/50">
                    Jelajahi Perkakas
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. "Dirancang untuk Situasi Kelas Nyata" Section */}
      <section id="untuk-guru" className="py-16 sm:py-20 border-y border-[#e8e4dc] bg-[#f4eee2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-800 bg-amber-200/70 px-3 py-1 rounded-full uppercase tracking-wider">
              Dukungan Praktis Guru
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 tracking-tight">
              Dirancang untuk Situasi Kelas Nyata di Indonesia
            </h2>
            <p className="text-stone-600 mt-2 text-sm sm:text-base">
              Kami merancang perkakas ini berdasarkan kendala sehari-hari: jam mengajar yang padat, ponsel murid yang bervariasi, dan sinyal wifi sekolah yang tidak menentu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">
                Tiga Titik Temu Tanpa Ribet
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Laptop guru untuk kendali penuh, proyektor kelas untuk visualisasi besar yang mudah dibaca, dan ponsel murid sebagai papan input interaktif.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">
                Nol Hambatan Registrasi Siswa
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Tidak ada login murid, kata sandi yang terlupa, atau verifikasi akun yang memakan waktu belajar. Cukup masukkan kode 6 huruf dan aktivitas langsung dimulai.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">
                Ringan &amp; Hemat Kuota Internet
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Aplikasi siswa sangat ringan, kompatibel dengan browser HP bawaan apa pun, dan tetap stabil bahkan dengan bandwidth sekolah yang terbatas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Closing CTA Section (Warm Midnight Atmosphere) */}
      <section className="bg-gradient-to-br from-[#0c1322] via-[#090e1a] to-[#060912] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 text-amber-300 text-xs font-semibold border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>WaliKelas Teaching Tools V1</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Siap membuat aktivitas mengajar lebih hidup dan interaktif?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Mulai sesi kelas pertama Anda sekarang. Gratis, tanpa instalasi aplikasi untuk murid, dan langsung siap ditampilkan di proyektor kelas.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row justify-center items-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 font-bold px-8 h-12 text-base shadow-lg"
              onClick={handleTeacherAccess}
            >
              Mulai Mengajar Gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a href="/tools" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border-slate-700 h-12 text-base font-semibold"
              >
                Jelajahi Katalog Perkakas
              </Button>
            </a>
          </div>

          <div className="pt-2">
            <a
              href="/join"
              className="text-xs text-slate-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
            >
              Siswa yang memiliki kode sesi kelas dapat bergabung di sini &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-white border-t border-[#e8e4dc] py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  WK
                </div>
                <span className="font-bold text-base text-stone-900 tracking-tight">
                  WaliKelas Teaching Tools
                </span>
                <Badge variant="neutral" size="sm" className="bg-stone-100 text-stone-700">
                  V1
                </Badge>
              </div>
              <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                Platform perkakas mengajar mandiri untuk menciptakan ruang kelas tatap muka yang aktif, interaktif, dan teratur.
              </p>
              <p className="text-xs font-mono text-stone-400">
                tools.walikelas.id
              </p>
            </div>

            {/* Nav links 1 */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Perkakas</h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li>
                  <a href="/tools/timer" className="hover:text-blue-600 transition-colors">
                    Timer &amp; Stopwatch
                  </a>
                </li>
                <li>
                  <a href="/tools/random-picker" className="hover:text-blue-600 transition-colors">
                    Random Picker
                  </a>
                </li>
                <li>
                  <a href="/tools/live-quiz" className="hover:text-blue-600 transition-colors">
                    Live Quiz
                  </a>
                </li>
                <li>
                  <a href="/tools/live-poll" className="hover:text-blue-600 transition-colors">
                    Live Poll
                  </a>
                </li>
                <li>
                  <a href="/tools" className="text-blue-600 font-semibold hover:underline">
                    Lihat Semua Perkakas &rarr;
                  </a>
                </li>
              </ul>
            </div>

            {/* Nav links 2 */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Navigasi</h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li>
                  <a href="/teacher" className="hover:text-blue-600 transition-colors">
                    Ruang Guru
                  </a>
                </li>
                <li>
                  <a href="/projector" className="hover:text-blue-600 transition-colors">
                    Mode Proyektor
                  </a>
                </li>
                <li>
                  <a href="/join" className="hover:text-blue-600 transition-colors">
                    Akses Siswa
                  </a>
                </li>
                <li>
                  <a href="/admin" className="hover:text-blue-600 transition-colors">
                    Admin Console
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <p>
              &copy; {new Date().getFullYear()} WaliKelas. Seluruh hak cipta dilindungi undang-undang.
            </p>
            <p className="text-[11px] text-stone-400">
              Bukan LMS &bull; Murni perkakas interaktif kegiatan belajar mengajar
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
