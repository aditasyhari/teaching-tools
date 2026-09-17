'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Shuffle,
  HelpCircle,
  BarChart2,
  Plus,
  Play,
  ArrowRight,
  Radio,
  FolderPlus,
  Tv,
  Users,
  Square,
} from 'lucide-react';
import Link from 'next/link';
import {
  PageHeaderSection,
  StatsOverview,
  EmptyState,
  Button,
  Badge,
  Card,
  Spinner,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@walikelas/ui';
import {
  fetchTeacherSessions,
  fetchTeacherQuizzes,
  fetchTeacherPolls,
  fetchNotes,
  endSession,
} from '@walikelas/api-client';
import { apiClient } from '../../lib/api';
import type { TeachingSession } from '@walikelas/types';
import { useSessionModal } from '@/features/session/session-modal-context';

export default function TeacherHomePage(): React.JSX.Element {
  const { openCreateModal } = useSessionModal();
  const [sessions, setSessions] = useState<TeachingSession[]>([]);
  const [quizCount, setQuizCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [pollCount, setPollCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // State for ending session directly from dashboard
  const [sessionToEnd, setSessionToEnd] = useState<TeachingSession | null>(null);
  const [endingSession, setEndingSession] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [sessionsData, quizzesData, pollsData, notesData] = await Promise.allSettled([
          fetchTeacherSessions(apiClient),
          fetchTeacherQuizzes(apiClient),
          fetchTeacherPolls(apiClient),
          fetchNotes(apiClient),
        ]);

        if (!isMounted) return;

        if (sessionsData.status === 'fulfilled') {
          setSessions(sessionsData.value);
        }
        if (quizzesData.status === 'fulfilled') {
          const quizzes = quizzesData.value;
          setQuizCount(quizzes.length);
          const totalQ = quizzes.reduce((acc, q) => acc + (q.questionCount || 0), 0);
          setQuestionCount(totalQ);
        }
        if (pollsData.status === 'fulfilled') {
          setPollCount(pollsData.value.length);
        }
        if (notesData.status === 'fulfilled') {
          setNoteCount(notesData.value.length);
        }
      } catch {
        // Fallback silently if offline
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirmEndSession = async () => {
    if (!sessionToEnd) return;
    const targetId = sessionToEnd.id;
    setEndingSession(true);

    // Optimistic UI update: mark session as ENDED immediately
    setSessions((prev) =>
      prev.map((s) => (s.id === targetId ? { ...s, status: 'ENDED' } : s)),
    );
    setSessionToEnd(null);

    try {
      await endSession(apiClient, targetId);
    } catch {
      // Re-fetch in background if failed
      try {
        const refreshed = await fetchTeacherSessions(apiClient);
        setSessions(refreshed);
      } catch {}
    } finally {
      setEndingSession(false);
    }
  };

  const activeSession = sessions.find((s) => s.status === 'ACTIVE' || s.status === 'WAITING');
  const activeSessionCount = sessions.filter((s) => s.status === 'ACTIVE' || s.status === 'WAITING').length;

  const stats = [
    {
      label: 'Sesi Kelas Aktif',
      value: loading ? '-' : String(activeSessionCount),
      description: activeSessionCount > 0 ? 'Sesi sedang berlangsung' : 'Tidak ada sesi berjalan',
      changeType: activeSessionCount > 0 ? ('positive' as const) : undefined,
    },
    {
      label: 'Aktivitas Tersimpan',
      value: loading ? '-' : String(quizCount + pollCount),
      description: `${quizCount} Kuis, ${pollCount} Polling`,
    },
    {
      label: 'Total Pertanyaan Kuis',
      value: loading ? '-' : String(questionCount),
      description: 'Bank soal kuis siap pakai',
    },
    {
      label: 'Catatan Guru',
      value: loading ? '-' : String(noteCount),
      description: 'Catatan pengajaran tersimpan',
    },
  ];

  const quickLaunchTools = [
    {
      id: 'timer',
      name: 'Timer Kelas',
      category: 'Utilitas Lokal',
      desc: 'Hitung mundur pengerjaan tugas atau istirahat',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      href: '/teacher/tools/timer',
    },
    {
      id: 'random-picker',
      name: 'Pemilih Acak',
      category: 'Utilitas Lokal',
      desc: 'Pilih nama siswa atau giliran menjawab secara adil',
      icon: <Shuffle className="w-5 h-5 text-violet-600" />,
      href: '/teacher/tools/random-picker',
    },
    {
      id: 'live-quiz',
      name: 'Live Quiz',
      category: 'Interaktif Realtime',
      desc: 'Mulai kuis seru langsung dengan leaderboard di layar',
      icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
      href: '/teacher/quizzes',
    },
    {
      id: 'live-poll',
      name: 'Live Poll',
      category: 'Interaktif Realtime',
      desc: 'Jajak pendapat cepat untuk cek pemahaman konsep',
      icon: <BarChart2 className="w-5 h-5 text-emerald-600" />,
      href: '/teacher/polls',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Header */}
      <PageHeaderSection
        title="Selamat Datang di Ruang Guru"
        description="Pusat kendali perkakas pembelajaran interaktif di kelas Anda hari ini."
        badge={
          <Badge variant="default" size="sm">
            Tahun Ajaran Aktif
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/teacher/activities">
              <Button variant="secondary" size="md" leftIcon={<FolderPlus className="w-4 h-4" />}>
                Bank Aktivitas
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Overview */}
      <StatsOverview stats={stats} columns={4} />

      {/* Classroom Session Engine Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Sesi Kelas Berjalan</h2>
            <p className="text-xs text-stone-500">
              Hubungkan layar proyektor kelas dengan gawai murid secara realtime.
            </p>
          </div>
          {activeSession && (
            <Link
              href="/teacher/sessions"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
            >
              <span>Semua Riwayat Sesi ({sessions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-8 bg-white border border-[#e8e4dc] rounded-2xl flex items-center justify-center gap-3">
            <Spinner size="sm" />
            <span className="text-xs text-stone-500 font-medium">Memeriksa status sesi kelas...</span>
          </div>
        ) : activeSession ? (
          <Card className="p-6 border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={activeSession.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                    {activeSession.status === 'ACTIVE' ? 'Sesi Sedang Berlangsung' : 'Menunggu Dimulai'}
                  </Badge>
                  {activeSession.classroom && (
                    <span className="text-xs font-semibold text-stone-600">
                      Kelas: {activeSession.classroom.name}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">
                    {activeSession.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Dibuat {new Date(activeSession.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white border border-indigo-200 px-4 py-2 rounded-xl shadow-2xs">
                    <span className="text-xs font-bold text-stone-500 block uppercase tracking-wider">Kode Sesi</span>
                    <span className="text-2xl font-mono font-black text-indigo-600 tracking-widest">
                      {activeSession.joinCode}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Siswa dapat bergabung di: <strong className="text-indigo-600">tools.walikelas.id/join</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <Link href={`/teacher/sessions/${activeSession.id}`}>
                  <Button variant="primary" size="md" className="w-full justify-center font-bold" leftIcon={<Play className="w-4 h-4 fill-current" />}>
                    Lanjutkan Konsol Sesi
                  </Button>
                </Link>
                <a
                  href={`/projector/${activeSession.joinCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" size="md" className="w-full justify-center text-xs font-semibold" leftIcon={<Tv className="w-4 h-4 text-amber-600" />}>
                    Buka Layar Proyektor
                  </Button>
                </a>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full justify-center text-xs font-semibold"
                  leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
                  onClick={() => setSessionToEnd(activeSession)}
                >
                  Akhiri Sesi
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={<Radio className="w-6 h-6 text-slate-400" />}
            title="Tidak Ada Sesi Kelas yang Aktif"
            description="Mulai sesi baru untuk mendapatkan kode 6 digit yang dapat diproyeksikan dan dimasuki murid."
            action={
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => openCreateModal()}
              >
                Mulai Sesi Kelas Sekarang
              </Button>
            }
          />
        )}
      </div>

      {/* Quick Tool Launch Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Perkakas Cepat</h2>
            <p className="text-xs text-stone-500">
              Luncurkan perkakas yang paling sering digunakan dalam hitungan detik.
            </p>
          </div>
          <Link
            href="/teacher/tools"
            className="text-xs font-bold text-stone-700 hover:text-stone-950 hover:underline flex items-center gap-1"
          >
            <span>Lihat semua 13 perkakas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLaunchTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex"
            >
              <Card className="p-5 w-full flex flex-col justify-between group-hover:border-amber-300 group-hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/70 group-hover:bg-amber-500 group-hover:border-amber-500 flex items-center justify-center transition-all">
                      {tool.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-stone-400">{tool.category}</span>
                  </div>
                  <h3 className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{tool.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-800">
                  <span>Buka Sekarang</span>
                  <Play className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Modal: Konfirmasi Akhiri Sesi Langsung dari Dasbor */}
      <Dialog open={Boolean(sessionToEnd)} onOpenChange={(open) => !open && setSessionToEnd(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Akhiri Sesi Kelas?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengakhiri sesi &ldquo;{sessionToEnd?.title}&rdquo;? Sesi ini akan ditutup dan seluruh murid yang terhubung akan keluar dari ruang kelas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setSessionToEnd(null)}
              disabled={endingSession}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmEndSession}
              disabled={endingSession}
            >
              {endingSession ? 'Mengakhiri...' : 'Ya, Akhiri Sesi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
