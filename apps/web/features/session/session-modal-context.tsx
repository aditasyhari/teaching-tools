'use client';

import React, { createContext, useContext, useState, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Select,
} from '@walikelas/ui';
import { AlertCircle, Plus } from 'lucide-react';
import { createSession } from '@walikelas/api-client';
import type { TeachingSession } from '@walikelas/types';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export interface OpenCreateModalOptions {
  defaultTitle?: string;
  classroomId?: string;
  onSuccess?: (session: TeachingSession) => void;
  redirectOnSuccess?: boolean;
  redirectQuery?: string;
}

interface SessionModalContextValue {
  openCreateModal: (options?: OpenCreateModalOptions) => void;
  closeCreateModal: () => void;
  isCreateOpen: boolean;
}

const SessionModalContext = createContext<SessionModalContextValue | null>(null);

export function useSessionModal(): SessionModalContextValue {
  const ctx = useContext(SessionModalContext);
  if (!ctx) {
    throw new Error('useSessionModal must be used within a SessionModalProvider');
  }
  return ctx;
}

export function SessionModalProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const router = useRouter();
  const { classrooms, activeClassroom } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOptions, setModalOptions] = useState<OpenCreateModalOptions | null>(null);

  const openCreateModal = useCallback(
    (options?: OpenCreateModalOptions) => {
      setModalOptions(options || null);
      setTitle(options?.defaultTitle || '');
      setSelectedClassroomId(options?.classroomId || activeClassroom?.id || '');
      setError(null);
      setIsOpen(true);
    },
    [activeClassroom?.id]
  );

  const closeCreateModal = useCallback(() => {
    if (creating) return;
    setIsOpen(false);
    setError(null);
    setModalOptions(null);
  }, [creating]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul sesi kelas wajib diisi');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const created = await createSession(apiClient, {
        title: title.trim(),
        classroomId: selectedClassroomId ? selectedClassroomId : undefined,
      });

      const currentOptions = modalOptions;
      setIsOpen(false);
      setTitle('');
      setSelectedClassroomId('');
      setModalOptions(null);

      if (currentOptions?.onSuccess) {
        currentOptions.onSuccess(created);
      }

      if (currentOptions?.redirectOnSuccess !== false) {
        const query = currentOptions?.redirectQuery ? currentOptions.redirectQuery : '';
        router.push(`/teacher/sessions/${created.id}${query}`);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal membuat sesi kelas baru');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SessionModalContext.Provider
      value={{
        openCreateModal,
        closeCreateModal,
        isCreateOpen: isOpen,
      }}
    >
      {children}

      {/* Global Create Session Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeCreateModal() : undefined)}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span>Buat Sesi Kelas Baru</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Mulai sesi interaktif langsung yang dapat dimasuki murid melalui kode sesi 6 digit atau QR di layar kelas.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Judul Sesi Pembelajaran <span className="text-rose-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                    { label: 'Tanpa Kelas Khusus (Sesi Bebas / Terbuka)', value: '' },
                    ...classrooms.map((c) => ({
                      label: c.name + (c.grade ? ` (${c.grade})` : ''),
                      value: c.id,
                    })),
                  ]}
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                onClick={closeCreateModal}
                disabled={creating}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {creating ? 'Membuat Sesi...' : 'Mulai Sesi Sekarang'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SessionModalContext.Provider>
  );
}

