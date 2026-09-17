'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Radio, Plus, AlertCircle, Tv } from 'lucide-react';
import {
  PageHeaderSection,
  EmptyState,
  Button,
  Badge,
  Card,
  Spinner,
} from '@walikelas/ui';
import type { TeachingSession } from '@walikelas/types';
import { apiClient } from '../../../lib/api';
import { fetchTeacherSessions } from '@walikelas/api-client';
import { useSessionModal } from '@/features/session/session-modal-context';

function TeacherSessionsContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const { openCreateModal } = useSessionModal();
  const [sessions, setSessions] = useState<TeachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startQuizParam = searchParams.get('startQuiz');
  const startPollParam = searchParams.get('startPoll');

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await fetchTeacherSessions(apiClient);
      setSessions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar sesi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Handle incoming query params to auto-open create modal
  useEffect(() => {
    if (startQuizParam) {
      openCreateModal({
        defaultTitle: 'Sesi Kuis Langsung',
        redirectQuery: `?autoStartQuiz=${startQuizParam}`,
      });
    } else if (startPollParam) {
      openCreateModal({
        defaultTitle: 'Sesi Polling Langsung',
        redirectQuery: `?autoStartPoll=${startPollParam}`,
      });
    }
  }, [startQuizParam, startPollParam, openCreateModal]);

  const activeSession = sessions.find((s) => s.status === 'ACTIVE' || s.status === 'WAITING');

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Sesi Kelas"
        description="Pusat kendali sesi interaksi langsung yang terhubung dengan perangkat murid."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Sesi Kelas', current: true },
        ]}
        actions={
          !activeSession ? (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => openCreateModal()}
            >
              Buat Sesi Kelas Baru
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500 font-medium">Memuat status sesi kelas...</p>
        </div>
      ) : activeSession ? (
        <Card className="p-6 border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 shadow-xs max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-mono font-bold">
                  {activeSession.joinCode}
                </span>
                {activeSession.classroom && (
                  <span className="text-xs font-semibold text-stone-600">
                    Kelas: {activeSession.classroom.name}
                  </span>
                )}
              </div>
              <Badge variant={activeSession.status === 'ACTIVE' ? 'success' : 'warning'}>
                {activeSession.status === 'ACTIVE' ? 'Sedang Berlangsung' : 'Menunggu Dimulai'}
              </Badge>
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900">{activeSession.title}</h2>
              <p className="text-xs text-stone-500 mt-1">
                Dibuat pada:{' '}
                {new Date(activeSession.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                WIB
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link href={`/teacher/sessions/${activeSession.id}`} className="w-full sm:w-auto flex-1">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  leftIcon={<Radio className="w-4 h-4 animate-pulse" />}
                >
                  Lanjutkan Konsol Sesi
                </Button>
              </Link>
              <a
                href={`/projector/${activeSession.joinCode}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="md"
                  className="w-full justify-center text-xs font-semibold"
                  leftIcon={<Tv className="w-4 h-4 text-amber-600" />}
                >
                  Mode Proyektor
                </Button>
              </a>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Radio className="w-6 h-6 text-slate-400" />}
          title="Tidak Ada Sesi Kelas yang Aktif"
          description="Setiap guru hanya memiliki 1 sesi aktif dalam satu waktu. Mulai sesi kelas baru untuk menghubungkan murid ke aktivitas pembelajaran."
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => openCreateModal()}
            >
              Mulai Sesi Kelas Sekarang
            </Button>
          }
        />
      )}
    </div>
  );
}

export default function TeacherSessionsPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <TeacherSessionsContent />
    </Suspense>
  );
}
