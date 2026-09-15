'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Radio, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import {
  PageHeaderSection,
  EmptyState,
  Button,
  Badge,
  Card,
  Input,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@walikelas/ui';
import type { TeachingSession } from '@walikelas/types';
import { apiClient } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { fetchTeacherSessions, createSession } from '@walikelas/api-client';

export default function TeacherSessionsPage(): React.JSX.Element {
  const router = useRouter();
  const { classrooms } = useAuth();
  const [sessions, setSessions] = useState<TeachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setModalError('Judul sesi kelas wajib diisi');
      return;
    }

    setCreating(true);
    setModalError(null);

    try {
      const created = await createSession(apiClient, {
        title: newTitle.trim(),
        classroomId: selectedClassroomId ? selectedClassroomId : undefined,
      });

      setIsCreateOpen(false);
      setNewTitle('');
      setSelectedClassroomId('');

      // Navigate directly to the new session's console
      router.push(`/teacher/sessions/${created.id}`);
    } catch (err: any) {
      setModalError(err.message || 'Gagal membuat sesi');
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Sesi Kelas"
        description="Kelola sesi interaksi kelas aktif dan lihat riwayat sesi yang telah selesai."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Sesi Kelas', current: true },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Buat Sesi Kelas Baru
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Memuat sesi kelas...</p>
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<Radio className="w-6 h-6 text-slate-400" />}
          title="Belum Ada Sesi Kelas"
          description="Mulai sesi kelas baru untuk menghubungkan perangkat siswa dan memulai aktivitas interaktif."
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Mulai Sesi Kelas Pertama
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((sess) => {
            const isWaiting = sess.status === 'WAITING';
            const isActive = sess.status === 'ACTIVE';
            const isEnded = sess.status === 'ENDED';

            return (
              <Card
                key={sess.id}
                className="p-5 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-mono font-bold">
                        {sess.joinCode}
                      </span>
                      {sess.classroom && (
                        <span className="text-xs text-slate-500 truncate max-w-[120px]">
                          {sess.classroom.name}
                        </span>
                      )}
                    </div>
                    {isWaiting && <Badge variant="warning">Menunggu</Badge>}
                    {isActive && <Badge variant="success">Aktif</Badge>}
                    {isEnded && <Badge variant="neutral">Selesai</Badge>}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {sess.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Dibuat pada:{' '}
                      {new Date(sess.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/teacher/sessions/${sess.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200"
                  >
                    <span>{isEnded ? 'Lihat Detail' : 'Buka Konsol Sesi'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Buat Sesi Baru */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-bold text-foreground">
              Buat Sesi Kelas Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Mulai sesi interaktif langsung yang dapat dimasuki murid melalui kode sesi atau QR.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Judul Sesi
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Kuis Bab 3 Biologi, Polling Diskusi..."
                required
                autoFocus
              />
            </div>

            {classrooms && classrooms.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kaitkan dengan Kelas (Opsional)
                </label>
                <Select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  options={[
                    { label: 'Tanpa Kelas (Umum)', value: '' },
                    ...classrooms.map((c) => ({
                      label: c.name,
                      value: c.id,
                    })),
                  ]}
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-border">
              <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={creating}>
                {creating ? 'Membuat Sesi...' : 'Mulai Sesi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
