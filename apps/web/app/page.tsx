'use client';

import React, { useState } from 'react';
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
  LogIn,
} from 'lucide-react';
import { Button, Badge } from '@walikelas/ui';
import { TOOLS } from '@walikelas/config';
import { useAuth } from '../lib/auth-context';

const toolIcons: Record<string, React.ReactNode> = {
  timer: <Clock className="w-5 h-5 text-blue-600" />,
  'random-picker': <Shuffle className="w-5 h-5 text-blue-600" />,
  'group-maker': <Users className="w-5 h-5 text-blue-600" />,
  scoreboard: <Trophy className="w-5 h-5 text-blue-600" />,
  'teacher-notes': <FileText className="w-5 h-5 text-blue-600" />,
  'live-quiz': <HelpCircle className="w-5 h-5 text-blue-600" />,
  'live-poll': <BarChart2 className="w-5 h-5 text-blue-600" />,
  'raise-hand': <Hand className="w-5 h-5 text-blue-600" />,
  'question-box': <MessageSquare className="w-5 h-5 text-blue-600" />,
  'brainstorm-board': <Lightbulb className="w-5 h-5 text-blue-600" />,
  'word-cloud': <Cloud className="w-5 h-5 text-blue-600" />,
  'exit-ticket': <CheckCircle2 className="w-5 h-5 text-blue-600" />,
  flashcards: <Layers className="w-5 h-5 text-blue-600" />,
};

export default function HomePage(): React.JSX.Element {
  const [sessionCode, setSessionCode] = useState('');
  const { user, isAuthenticated, loginWithGoogle, devLogin } = useAuth();

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

  const localTools = TOOLS.filter((tool) => tool.category === 'LOCAL');
  const interactiveTools = TOOLS.filter((tool) => tool.category === 'INTERACTIVE');
  const contentTools = TOOLS.filter((tool) => tool.category === 'CONTENT');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                WK
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg leading-tight text-slate-900">
                  WaliKelas
                </span>
                <span className="text-[11px] font-medium text-slate-500 leading-tight">
                  Teaching Tools
                </span>
              </div>
            </a>
            <div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-slate-200">
              <a
                href="/tools"
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Katalog Perkakas
              </a>
              <a
                href="/teacher"
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Ruang Guru
              </a>
              <a
                href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Admin
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {process.env.NODE_ENV !== 'production' && !isAuthenticated && (
              <div className="hidden lg:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  leftIcon={<LogIn className="w-3 h-3" />}
                  onClick={() => devLogin('TEACHER')}
                >
                  Dev Guru
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-700"
                  onClick={() => devLogin('ADMIN')}
                >
                  Dev Admin
                </Button>
              </div>
            )}

            {isAuthenticated ? (
              <a href="/teacher">
                <Button variant="primary" size="sm">
                  Halo, {user?.name.split(' ')[0]} (Buka Ruang Guru)
                </Button>
              </a>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loginWithGoogle}
                  leftIcon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
                >
                  Masuk dengan Google
                </Button>
                <Button variant="primary" size="sm" onClick={handleTeacherAccess}>
                  Mulai Mengajar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Teaching Tools V1 &bull; Cepat, Ringan &amp; Praktis</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Perkakas Mengajar Modern untuk Kelas yang{' '}
                <span className="text-blue-600 underline decoration-blue-200 decoration-wavy underline-offset-8">
                  Lebih Hidup
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Kelola interaktivitas kelas secara instan. Mulai dari utilitas lokal seperti
                penghitung waktu dan pemilih acak, hingga kuis langsung dan curah pendapat realtime
                tanpa instalasi aplikasi bagi siswa.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-sm"
                  onClick={handleTeacherAccess}
                >
                  <span>Mulai Mengajar Gratis</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="/tools" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Jelajahi 13 Perkakas
                  </Button>
                </a>
              </div>

              {/* Badges / Assurance */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Google OAuth Resmi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>Siap Tampil di Proyektor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>Siswa Cukup Buka Browser HP</span>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Student Join */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
                    Akses Langsung Siswa
                  </span>
                  <Badge
                    variant="default"
                    size="sm"
                    className="bg-blue-800 text-blue-100 border-none"
                  >
                    Realtime Session
                  </Badge>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Punya Kode Sesi Kelas?</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Masukkan 6 karakter kode yang ditampilkan guru di layar proyektor kelas untuk
                  bergabung langsung.
                </p>

                <form onSubmit={handleJoinSession} className="space-y-4">
                  <div>
                    <label
                      htmlFor="join-code-input"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      KODE SESI KELAS
                    </label>
                    <input
                      id="join-code-input"
                      type="text"
                      maxLength={6}
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      placeholder="CONTOH: WK-982"
                      className="w-full text-center tracking-[0.2em] font-mono text-2xl uppercase h-14 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-500 font-semibold text-base h-12"
                    disabled={!sessionCode.trim()}
                  >
                    Gabung Sesi Kelas Sekarang
                  </Button>
                </form>

                <p className="text-[11px] text-slate-400 text-center mt-4">
                  Siswa tidak perlu membuat akun atau mendaftar kata sandi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-14 sm:py-20 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Cara Kerja Sederhana &amp; Efisien
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Dirancang khusus untuk ritme mengajar di dalam ruang kelas nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">
                1
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Pilih Perkakas</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pilih alat lokal seperti Timer atau buka aktivitas interaktif seperti Live Quiz dan
                Live Poll langsung dari Teacher Console.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">
                2
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Tampilkan di Proyektor</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Buka Mode Proyektor di layar besar kelas. Tampilkan kode sesi kelas atau kode QR
                untuk dipindai murid.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">
                3
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Interaksi Realtime</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Murid menjawab dari ponsel mereka. Hasil, jawaban, dan papan peringkat terupdate
                secara otomatis dan menyenangkan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Showcase */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Koleksi Lengkap V1
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              13 Perkakas Mengajar Terpadu
            </h2>
          </div>
          <a href="/tools">
            <Button variant="outline" size="sm">
              Lihat Semua di Katalog
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </a>
        </div>

        {/* Local Tools */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="md">
              Utilitas Lokal ({localTools.length})
            </Badge>
            <span className="text-xs text-slate-500">
              Dapat dipakai tanpa login &bull; Berjalan langsung di browser
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {localTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                      {toolIcons[tool.id]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{tool.name}</h4>
                      <span className="text-[11px] text-slate-400">Alat Bantu Kelas</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{tool.description}</p>
                </div>
                <a href={`/teacher/tools?launch=${tool.id}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Buka Perkakas
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tools */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <Badge variant="default" size="md">
              Aktivitas Interaktif ({interactiveTools.length})
            </Badge>
            <span className="text-xs text-slate-500">
              Realtime Session Engine &bull; Partisipasi dua arah murid &amp; proyektor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {interactiveTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                        {toolIcons[tool.id]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{tool.name}</h4>
                        <span className="text-[11px] text-emerald-600 font-medium">
                          &bull; Realtime Kelas
                        </span>
                      </div>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {tool.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{tool.description}</p>
                </div>
                <a href={`/teacher/tools?launch=${tool.id}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    Mulai di Kelas
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Content Tools */}
        {contentTools.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="md">
                Konten &amp; Penguatan ({contentTools.length})
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {contentTools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        {toolIcons[tool.id]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{tool.name}</h4>
                        <span className="text-[11px] text-slate-400">Flashcards</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{tool.description}</p>
                  </div>
                  <a href={`/teacher/tools?launch=${tool.id}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Buka Kartu Materi
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Siap Menghidupkan Suasana Belajar di Kelas Anda?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            WaliKelas Teaching Tools dirancang fokus pada interaktivitas tatap muka guru dan siswa.
            Buka langsung sekarang.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleTeacherAccess}
            >
              Buka Teacher Console
            </Button>
            <a href="/tools">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Lihat Semua Perkakas
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">WaliKelas Teaching Tools V1</span>
                <Badge variant="neutral" size="sm">
                  Standalone
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Produk mandiri perkakas interaktif kelas &bull; Domain: tools.walikelas.id
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-600">
              <a href="/tools" className="hover:text-blue-600 transition-colors">
                Katalog Perkakas
              </a>
              <a href="/teacher" className="hover:text-blue-600 transition-colors">
                Ruang Guru
              </a>
              <a href="/admin" className="hover:text-blue-600 transition-colors">
                Admin Console
              </a>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} WaliKelas. Seluruh hak cipta dilindungi
              undang-undang.
            </p>
            <p>Bukan LMS &bull; Murni perkakas interaktif ruang kelas</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
