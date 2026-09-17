'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderKanban,
  Plus,
  Users,
  BookOpen,
  GraduationCap,
  Check,
  Edit2,
  Trash2,
  Copy,
  AlertCircle,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import {
  PageHeaderSection,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  EmptyState,
} from '@walikelas/ui';
import type { Classroom } from '@walikelas/types';
import {
  fetchClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  addClassroomMember,
  removeClassroomMember,
} from '@walikelas/api-client';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export function ClassroomsView(): React.JSX.Element {
  const {
    activeClassroom,
    setActiveClassroom,
    refreshAuth,
  } = useAuth();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal: Create / Edit Classroom
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal: Delete Classroom
  const [showDeleteModal, setShowDeleteModal] = useState<Classroom | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal: Manage Members (Student Roster)
  const [rosterClassroom, setRosterClassroom] = useState<Classroom | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentIdentifier, setNewStudentIdentifier] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [copiedRoster, setCopiedRoster] = useState(false);

  // Load classrooms from API
  const loadClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchClassrooms(apiClient);
      setClassrooms(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar kelas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClassrooms();
  }, [loadClassrooms]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingClassroom(null);
    setFormName('');
    setFormSubject('');
    setFormGrade('');
    setFormError(null);
    setShowFormModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: Classroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClassroom(c);
    setFormName(c.name);
    setFormSubject(c.subject || '');
    setFormGrade(c.grade || '');
    setFormError(null);
    setShowFormModal(true);
  };

  // Submit Create or Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama kelas tidak boleh kosong');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingClassroom) {
        // Edit existing
        const updated = await updateClassroom(apiClient, editingClassroom.id, {
          name: formName.trim(),
          subject: formSubject.trim() || undefined,
          grade: formGrade.trim() || undefined,
        });
        setClassrooms((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        if (activeClassroom?.id === updated.id) {
          setActiveClassroom(updated);
        }
      } else {
        // Create new
        const created = await createClassroom(apiClient, {
          name: formName.trim(),
          subject: formSubject.trim() || undefined,
          grade: formGrade.trim() || undefined,
        });
        setClassrooms((prev) => [created, ...prev]);
        // If first classroom, set as active automatically
        if (classrooms.length === 0) {
          setActiveClassroom(created);
        }
      }

      await refreshAuth();
      setShowFormModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan kelas');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Classroom (Optimistic 0ms UI update)
  const handleDeleteConfirm = async () => {
    if (!showDeleteModal) return;
    const target = showDeleteModal;
    const previous = [...classrooms];

    // Optimistic remove
    setShowDeleteModal(null);
    setClassrooms((prev) => prev.filter((c) => c.id !== target.id));
    if (activeClassroom?.id === target.id) {
      setActiveClassroom(null);
    }

    try {
      setDeleting(true);
      await deleteClassroom(apiClient, target.id);
      await refreshAuth();
    } catch (err: any) {
      // Rollback on failure
      setClassrooms(previous);
      setError(err.message || 'Gagal menghapus kelas');
    } finally {
      setDeleting(false);
    }
  };

  // Manage Roster
  const handleOpenRoster = (c: Classroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setRosterClassroom(c);
    setNewStudentName('');
    setNewStudentIdentifier('');
    setMemberError(null);
    setCopiedRoster(false);
  };

  // Add Member to Roster
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterClassroom || !newStudentName.trim()) return;

    setMemberSubmitting(true);
    setMemberError(null);

    try {
      const newMember = await addClassroomMember(apiClient, rosterClassroom.id, {
        displayName: newStudentName.trim(),
        studentIdentifier: newStudentIdentifier.trim() || undefined,
      });

      // Update both roster view and classrooms state
      const updatedMembers = [...(rosterClassroom.members || []), newMember];
      const updatedClassroom = { ...rosterClassroom, members: updatedMembers };

      setRosterClassroom(updatedClassroom);
      setClassrooms((prev) =>
        prev.map((c) => (c.id === updatedClassroom.id ? updatedClassroom : c)),
      );
      if (activeClassroom?.id === updatedClassroom.id) {
        setActiveClassroom(updatedClassroom);
      }

      setNewStudentName('');
      setNewStudentIdentifier('');
    } catch (err: any) {
      setMemberError(err.message || 'Gagal menambahkan siswa');
    } finally {
      setMemberSubmitting(false);
    }
  };

  // Remove Member from Roster
  const handleRemoveMember = async (memberId: string) => {
    if (!rosterClassroom) return;
    const targetClassroomId = rosterClassroom.id;
    const prevMembers = rosterClassroom.members || [];

    // Optimistic update
    const updatedMembers = prevMembers.filter((m) => m.id !== memberId);
    const updatedClassroom = { ...rosterClassroom, members: updatedMembers };
    setRosterClassroom(updatedClassroom);
    setClassrooms((prev) =>
      prev.map((c) => (c.id === targetClassroomId ? updatedClassroom : c)),
    );

    try {
      await removeClassroomMember(apiClient, targetClassroomId, memberId);
    } catch (err: any) {
      // Rollback
      setRosterClassroom({ ...rosterClassroom, members: prevMembers });
      setClassrooms((prev) =>
        prev.map((c) => (c.id === targetClassroomId ? { ...c, members: prevMembers } : c)),
      );
      setMemberError(err.message || 'Gagal menghapus siswa');
    }
  };

  // Copy roster as newline-separated text for Random Picker / Group Maker
  const handleCopyRosterText = async () => {
    if (!rosterClassroom?.members || rosterClassroom.members.length === 0) return;
    const names = rosterClassroom.members.map((m) => m.displayName).join('\n');
    try {
      await navigator.clipboard.writeText(names);
      setCopiedRoster(true);
      setTimeout(() => setCopiedRoster(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Filter classrooms by search query
  const filteredClassrooms = classrooms.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchName = c.name.toLowerCase().includes(q);
    const matchSubject = c.subject?.toLowerCase().includes(q);
    const matchGrade = c.grade?.toLowerCase().includes(q);
    return matchName || matchSubject || matchGrade;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <PageHeaderSection
        title="Kelas Saya"
        description="Kelola kelas dan daftar murid untuk menghubungkan konteks pembelajaran ke seluruh perkakas mengajar."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Kelas Saya', current: true },
        ]}
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
          >
            Buat Kelas Baru
          </Button>
        }
      />

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-bold hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Stats Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-[#e8e4dc] rounded-2xl p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kelas, tingkat, atau mapel..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-[#e8e4dc] rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="text-xs text-stone-500 font-medium w-full sm:w-auto text-right">
          Total:{' '}
          <span className="font-bold text-stone-900">{classrooms.length}</span>{' '}
          Kelas Terdaftar
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-stone-500">Memuat daftar kelas...</p>
        </div>
      ) : filteredClassrooms.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={<FolderKanban className="w-8 h-8 text-stone-400" />}
          title={searchQuery ? 'Kelas Tidak Ditemukan' : 'Belum Ada Kelas'}
          description={
            searchQuery
              ? 'Tidak ditemukan kelas yang cocok dengan kata kunci pencarian Anda.'
              : 'Tambahkan kelas pertama Anda untuk mengelola daftar murid dan mengaktifkan konteks kelas di perkakas interaktif.'
          }
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              Buat Kelas Sekarang
            </Button>
          }
        />
      ) : (
        /* Classrooms Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClassrooms.map((classroom) => {
            const isActive = activeClassroom?.id === classroom.id;
            const memberCount = classroom.members?.length || 0;

            return (
              <Card
                key={classroom.id}
                className={`p-5 flex flex-col justify-between transition-all duration-200 border-2 ${
                  isActive
                    ? 'border-amber-400 bg-amber-50/20 shadow-xs ring-2 ring-amber-200/50'
                    : 'border-[#e8e4dc] bg-white hover:border-stone-300'
                }`}
              >
                <div>
                  {/* Card Header with Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        {classroom.grade && (
                          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                            {classroom.grade}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-1">
                          {classroom.name}
                        </h3>
                      </div>
                    </div>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-stone-950 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" /> Aktif
                      </span>
                    )}
                  </div>

                  {/* Subject & Meta */}
                  <div className="space-y-2 mb-4 text-xs text-stone-600">
                    {classroom.subject && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                        <span>{classroom.subject}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 font-medium text-stone-500">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>{memberCount} siswa terdaftar</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleOpenRoster(classroom, e)}
                      className="text-xs font-semibold gap-1.5 text-stone-700 border-[#e8e4dc]"
                      leftIcon={<Users className="w-3.5 h-3.5" />}
                    >
                      Daftar Murid ({memberCount})
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isActive ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveClassroom(classroom)}
                        className="text-xs font-bold"
                      >
                        Pilih
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-stone-400 px-2">Terpilih</span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(classroom, e)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                      title="Edit Kelas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(classroom);
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create / Edit Classroom */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border-[#e8e4dc] shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">
              {editingClassroom ? 'Edit Data Kelas' : 'Buat Kelas Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600 mt-1">
              {editingClassroom
                ? 'Perbarui informasi kelas yang sudah ada.'
                : 'Tambahkan kelas untuk mengelompokkan murid dan aktivitas pembelajaran.'}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Nama Kelas <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Contoh: Kelas 7A, X MIPA 1"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                autoFocus
                className="border-[#e8e4dc]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Tingkat / Jenjang
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Kelas 7, Kelas 10"
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value)}
                  className="border-[#e8e4dc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Mata Pelajaran
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Matematika, IPA"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="border-[#e8e4dc]"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFormModal(false)}
                disabled={formSubmitting}
                className="border-[#e8e4dc]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={formSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold border-amber-600 shadow-xs"
              >
                {formSubmitting
                  ? 'Menyimpan...'
                  : editingClassroom
                    ? 'Simpan Perubahan'
                    : 'Buat Kelas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog
        open={Boolean(showDeleteModal)}
        onOpenChange={(open) => !open && setShowDeleteModal(null)}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border-[#e8e4dc] shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700">
              Hapus Kelas Ini?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus kelas{' '}
              <strong className="text-stone-900">{showDeleteModal?.name}</strong>? Data kelas dan
              daftar murid di dalamnya akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(null)}
              disabled={deleting}
              className="border-[#e8e4dc]"
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus Kelas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal / Drawer: Manage Roster */}
      <Dialog
        open={Boolean(rosterClassroom)}
        onOpenChange={(open) => !open && setRosterClassroom(null)}
      >
        <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 bg-white border-[#e8e4dc] rounded-2xl shadow-xl">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-[#e8e4dc] text-left bg-stone-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-stone-900">
                    Daftar Murid: {rosterClassroom?.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-stone-500">
                    {rosterClassroom?.members?.length || 0} siswa terdaftar di kelas ini
                  </DialogDescription>
                </div>
              </div>

              {/* Quick Copy Roster Button for Tools */}
              {rosterClassroom?.members && rosterClassroom.members.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRosterText}
                  leftIcon={
                    copiedRoster ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )
                  }
                  className="text-xs font-semibold border-[#e8e4dc]"
                >
                  {copiedRoster ? 'Tersalin!' : 'Salin Nama Siswa'}
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Body: Form + List */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Add Student Form */}
            <form onSubmit={handleAddMember} className="space-y-3">
              <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>Tambah Siswa Baru</span>
              </div>

              {memberError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {memberError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Nama lengkap siswa *"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="flex-1 text-sm border-[#e8e4dc]"
                  required
                />
                <Input
                  type="text"
                  placeholder="No. Induk / NIS (opsional)"
                  value={newStudentIdentifier}
                  onChange={(e) => setNewStudentIdentifier(e.target.value)}
                  className="w-full sm:w-44 text-sm border-[#e8e4dc]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={memberSubmitting || !newStudentName.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold border-amber-600 shadow-xs shrink-0"
                >
                  {memberSubmitting ? 'Menambah...' : 'Tambah'}
                </Button>
              </div>
            </form>

            {/* List of Students */}
            <div className="pt-2 border-t border-[#e8e4dc]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Daftar Siswa
                </span>
                <span className="text-[11px] text-stone-400">
                  Klik &ldquo;Salin Nama Siswa&rdquo; di atas untuk paste ke Random Picker / Group Maker
                </span>
              </div>

              {!rosterClassroom?.members || rosterClassroom.members.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-[#e8e4dc] rounded-xl bg-stone-50/40">
                  Belum ada siswa yang ditambahkan ke kelas ini.
                </div>
              ) : (
                <div className="divide-y divide-stone-100 border border-[#e8e4dc] rounded-xl overflow-hidden bg-white max-h-64 overflow-y-auto">
                  {rosterClassroom.members.map((member, index) => (
                    <div
                      key={member.id}
                      className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 font-mono text-stone-400 font-bold text-[11px]">
                          {index + 1}.
                        </span>
                        <div>
                          <span className="font-bold text-stone-900 block">
                            {member.displayName}
                          </span>
                          {member.studentIdentifier && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              NIS: {member.studentIdentifier}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-stone-300 hover:text-rose-600 rounded-md transition-colors"
                        title="Hapus Siswa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-3 border-t border-[#e8e4dc] bg-stone-50/60 flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRosterClassroom(null)}
              className="border-[#e8e4dc]"
            >
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
