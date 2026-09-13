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
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button, Badge, Spinner, EmptyState } from '@walikelas/ui';
import type { TeacherNote } from '@walikelas/types';
import { useAuth } from '../../lib/auth-context';
import { useTeacherNotes } from './use-teacher-notes';

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

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      await deleteNote(id);
    }
  };

  // Auth Guard Screen for Teacher Notes
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Catatan Guru Privat</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Catatan guru tersimpan aman di server dan bersifat privat. Masuk dengan akun Google
            untuk mengakses dan mengelola catatan pembelajaran Anda.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          leftIcon={<ShieldCheck className="w-5 h-5 text-white" />}
          onClick={loginWithGoogle}
        >
          Masuk dengan Akun Google
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-slate-900">Catatan Guru</h1>
          <Badge variant="neutral" size="sm">
            {notes.length} Catatan
          </Badge>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openNewNoteModal}
        >
          Buat Catatan Baru
        </Button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul atau isi catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {/* Pinned filter toggle */}
          <button
            type="button"
            onClick={() => setFilterPinnedOnly(!filterPinnedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterPinnedOnly
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
              className="h-9 px-3 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none"
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
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-500">Memuat catatan guru...</p>
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
              <div
                key={note.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-sm ${
                  note.pinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Card Header: Title & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => togglePin(note)}
                        aria-label={note.pinned ? 'Lepas semat' : 'Sematkan catatan'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.pinned
                            ? 'text-amber-600 hover:bg-amber-100'
                            : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Pin className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditNoteModal(note)}
                        aria-label="Edit catatan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        aria-label="Hapus catatan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content */}
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600"
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
              </div>
            );
          })}
        </div>
      )}

      {/* Note Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingNote ? 'Ubah Catatan Guru' : 'Catatan Guru Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Catatan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rencana Praktikum Kalor Kelas 7A"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Isi Catatan
                </label>
                <textarea
                  rows={5}
                  placeholder="Tulis refleksi, materi penting, atau pengingat..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Konteks Kelas (Opsional)
                  </label>
                  <select
                    value={formClassroomId}
                    onChange={(e) => setFormClassroomId(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tag / Label (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    placeholder="evaluasi, praktikum, bab1"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
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
          </div>
        </div>
      )}
    </div>
  );
}
