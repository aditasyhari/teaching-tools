'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Pin,
  Calendar,
  Lock,
  Search,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Badge,
  Spinner,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Textarea,
  Card,
} from '@walikelas/ui';
import type { TeacherNote } from '@walikelas/types';
import { useAuth } from '../../lib/auth-context';
import { useTeacherNotes } from './use-teacher-notes';
import { GoogleIcon } from '@/components/auth/teacher-login-view';

export function TeacherNotesView(): React.JSX.Element {
  const { isAuthenticated, classrooms, loginWithGoogle } = useAuth();
  const {
    notes,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedClassroomId,
    setSelectedClassroomId,
    filterPinnedOnly,
    setFilterPinnedOnly,
    reloadNotes,
    createNote,
    updateNote,
    togglePin,
    deleteNote,
  } = useTeacherNotes();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<TeacherNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<TeacherNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formClassroomId, setFormClassroomId] = useState<string>('');
  const [formTags, setFormTags] = useState('');
  const [formPinned, setFormPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openNewNoteModal = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormClassroomId(selectedClassroomId || '');
    setFormTags('');
    setFormPinned(false);
    setFormError(null);
    setIsEditorOpen(true);
  };

  const openEditNoteModal = (note: TeacherNote) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormClassroomId(note.classroomId || '');
    setFormTags(note.tags?.join(', ') || '');
    setFormPinned(note.pinned);
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    setFormError(null);

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          title: formTitle.trim(),
          content: formContent.trim(),
          classroomId: formClassroomId || null,
          tags: tagsArray,
          pinned: formPinned,
        });
      } else {
        await createNote({
          title: formTitle.trim(),
          content: formContent.trim(),
          classroomId: formClassroomId || null,
          tags: tagsArray,
          pinned: formPinned,
        });
      }
      setIsEditorOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan catatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (note: TeacherNote) => {
    setNoteToDelete(note);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    } catch {
      // Handled by hook error state
    } finally {
      setIsDeleting(false);
    }
  };

  // Auth Guard Screen for Teacher Notes
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#e8e4dc] p-8 shadow-xs text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200/80 shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100/70 text-amber-900 border border-amber-200/60">
            Akses Privat
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Catatan Guru Privat</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Catatan guru tersimpan aman di server dan bersifat privat. Masuk dengan akun Google
            untuk mengakses dan mengelola catatan pembelajaran Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/90 text-stone-800 font-bold text-sm transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
        >
          <GoogleIcon className="w-5 h-5 shrink-0" />
          <span>Masuk dengan Akun Google</span>
        </button>
      </div>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto space-y-6 focus:outline-none">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-600" />
          <h1 className="text-lg font-bold text-foreground">Catatan Guru</h1>
          <Badge variant="neutral" size="sm" className="bg-rose-100/70 text-rose-900 font-semibold border-none">
            {notes.length} Catatan
          </Badge>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold min-h-[40px]"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openNewNoteModal}
        >
          Buat Catatan Baru
        </Button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari judul atau isi catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs sm:text-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pinned filter toggle */}
          <button
            type="button"
            onClick={() => setFilterPinnedOnly(!filterPinnedOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[40px] ${
              filterPinnedOnly
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>Tersemat</span>
          </button>

          {/* Classroom Selector Filter */}
          {classrooms.length > 0 && (
            <select
              value={selectedClassroomId || ''}
              onChange={(e) => setSelectedClassroomId(e.target.value || null)}
              className="h-10 px-3 rounded-xl text-xs font-semibold bg-secondary border border-border text-foreground focus:outline-none"
            >
              <option value="">Semua Kelas</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={reloadNotes}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-card rounded-3xl border border-border p-12 text-center flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-muted-foreground">Memuat catatan guru...</p>
        </div>
      ) : notes.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={<FileText className="w-8 h-8 text-slate-400" />}
          title={searchTerm ? 'Tidak Ada Catatan yang Cocok' : 'Belum Ada Catatan'}
          description={
            searchTerm
              ? `Tidak ditemukan catatan dengan kata kunci "${searchTerm}".`
              : 'Tulis refleksi, persiapan materi, atau tindak lanjut pembelajaran Anda di sini.'
          }
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openNewNoteModal}
            >
              Buat Catatan Pertama
            </Button>
          }
        />
      ) : (
        /* Notes Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => {
            const linkedClass = classrooms.find((c) => c.id === note.classroomId);
            const dateStr = new Date(note.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <Card
                key={note.id}
                className={`p-5 flex flex-col justify-between gap-4 transition-all duration-200 ease-out hover:shadow-xs hover:-translate-y-0.5 border-border bg-card ${
                  note.pinned ? 'border-amber-300 bg-amber-50/20' : ''
                }`}
              >
                <div className="space-y-2.5">
                  {/* Card Header: Title & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-foreground text-base leading-snug">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => togglePin(note)}
                        aria-label={note.pinned ? 'Lepas semat' : 'Sematkan catatan'}
                        className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
                          note.pinned
                            ? 'text-amber-600 hover:bg-amber-100'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Pin className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditNoteModal(note)}
                        aria-label="Edit catatan"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(note)}
                        aria-label="Hapus catatan"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content */}
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-semibold text-secondary-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>

                  {linkedClass ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                      <BookOpen className="w-3 h-3" />
                      {linkedClass.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Pribadi</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Note Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Ubah Catatan Guru' : 'Catatan Guru Baru'}
            </DialogTitle>
            <DialogDescription>
              Tulis dan kelola catatan guru untuk refleksi atau persiapan mengajar.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveNote} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                Judul Catatan *
              </label>
              <Input
                type="text"
                placeholder="Contoh: Rencana Praktikum Kalor Kelas 7A"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                Isi Catatan
              </label>
              <Textarea
                rows={5}
                placeholder="Tulis refleksi, materi penting, atau pengingat..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                  Konteks Kelas (Opsional)
                </label>
                <select
                  value={formClassroomId}
                  onChange={(e) => setFormClassroomId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-medium border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-card text-foreground"
                >
                  <option value="">Tanpa Kelas (Catatan Pribadi)</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                  Tag / Label (Pisahkan Koma)
                </label>
                <Input
                  type="text"
                  placeholder="evaluasi, praktikum, bab1"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formPinned}
                  onChange={(e) => setFormPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-400"
                />
                <span>Sematkan ke paling atas</span>
              </label>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !formTitle.trim()}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation Modal */}
      <Dialog open={Boolean(noteToDelete)} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Catatan Guru</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus catatan &ldquo;{noteToDelete?.title}&rdquo;? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setNoteToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Catatan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
