'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TeacherNote, TeacherNoteFilter } from '@walikelas/types';
import type { CreateNoteInput, UpdateNoteInput } from '@walikelas/validation';
import {
  fetchNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
} from '@walikelas/api-client';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export function useTeacherNotes() {
  const { isAuthenticated, activeClassroom } = useAuth();
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(
    activeClassroom?.id || null,
  );
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!isAuthenticated) {
      setNotes([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filter: TeacherNoteFilter = {};
      if (selectedClassroomId) filter.classroomId = selectedClassroomId;
      if (searchTerm.trim()) filter.search = searchTerm.trim();
      if (filterPinnedOnly) filter.pinned = true;

      const data = await fetchNotes(apiClient, filter);
      setNotes(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat catatan guru.');
    } finally {
      setIsLoading(false);
    }
  }, [filterPinnedOnly, isAuthenticated, searchTerm, selectedClassroomId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = useCallback(async (input: CreateNoteInput): Promise<TeacherNote> => {
    const newNote = await apiCreateNote(apiClient, input);
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback(
    async (id: string, input: UpdateNoteInput): Promise<TeacherNote> => {
      const updated = await apiUpdateNote(apiClient, id, input);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      return updated;
    },
    [],
  );

  const togglePin = useCallback(async (note: TeacherNote): Promise<void> => {
    const newPinned = !note.pinned;
    // Optimistic update
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, pinned: newPinned } : n)));

    try {
      await apiUpdateNote(apiClient, note.id, { pinned: newPinned });
    } catch (err) {
      // Rollback on failure
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, pinned: note.pinned } : n)));
      throw err;
    }
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    let deletedNote: TeacherNote | undefined;
    // Optimistic 0ms update
    setNotes((prev) => {
      deletedNote = prev.find((n) => n.id === id);
      return prev.filter((n) => n.id !== id);
    });

    try {
      await apiDeleteNote(apiClient, id);
    } catch (err) {
      // Rollback on failure
      if (deletedNote) {
        setNotes((prev) => [deletedNote!, ...prev]);
      }
      throw err;
    }
  }, []);

  return {
    notes,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedClassroomId,
    setSelectedClassroomId,
    filterPinnedOnly,
    setFilterPinnedOnly,
    reloadNotes: loadNotes,
    createNote,
    updateNote,
    togglePin,
    deleteNote,
  };
}
