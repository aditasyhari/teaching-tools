'use client';

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Play,
  Pause,
  StopCircle,
  Eye,
  EyeOff,
  Plus,
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@walikelas/ui';
import type {
  BrainstormActivity,
  BrainstormIdea,
  BrainstormSubmissionMode,
} from '@walikelas/types';

interface TeacherBrainstormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activity: BrainstormActivity | null;
  ideas: BrainstormIdea[];
  visibleCount: number;
  hiddenCount: number;
  totalCount: number;
  onCreateActivity: (
    prompt: string,
    options: {
      isAnonymous: boolean;
      ideasVisibleToParticipants: boolean;
      submissionMode: BrainstormSubmissionMode;
    },
  ) => void;
  onOpenActivity: () => void;
  onPauseActivity: () => void;
  onCloseActivity: () => void;
  onHideIdea: (ideaId: string) => void;
  onRestoreIdea: (ideaId: string) => void;
}

function formatElapsed(ts?: number): string {
  if (!ts) return 'Baru saja';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return `${diffSec}d yang lalu`;
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin}m yang lalu`;
}

export function TeacherBrainstormPanel({
  isOpen,
  onClose,
  activity,
  ideas,
  visibleCount,
  hiddenCount,
  totalCount,
  onCreateActivity,
  onOpenActivity,
  onPauseActivity,
  onCloseActivity,
  onHideIdea,
  onRestoreIdea,
}: TeacherBrainstormPanelProps) {
  // Form states for creating a new board
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ideasVisibleToParticipants, setIdeasVisibleToParticipants] = useState(true);
  const [submissionMode, setSubmissionMode] = useState<BrainstormSubmissionMode>(
    'MULTIPLE_PER_PARTICIPANT',
  );
  const [filter, setFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFormActive = showCreateForm || !activity;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onCreateActivity(prompt.trim(), {
      isAnonymous,
      ideasVisibleToParticipants,
      submissionMode,
    });
    setShowCreateForm(false);
    setPrompt('');
  };

  const filteredIdeas = ideas.filter((item) => {
    if (filter === 'VISIBLE') return item.status === 'VISIBLE';
    if (filter === 'HIDDEN') return item.status === 'HIDDEN';
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] h-[750px] overflow-hidden flex flex-col p-0 gap-0 border-[#e8e4dc] bg-[#faf8f5] dark:border-stone-800 dark:bg-stone-900 shadow-xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-[#e8e4dc] px-6 py-4 space-y-0 text-left bg-white dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400 shrink-0">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Papan Ide Kolaboratif
                </DialogTitle>
                {activity && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activity.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : activity.status === 'PAUSED'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          : activity.status === 'CLOSED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
                            : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {activity.status === 'OPEN' && 'Terbuka'}
                    {activity.status === 'PAUSED' && 'Dijeda'}
                    {activity.status === 'CLOSED' && 'Ditutup'}
                    {activity.status === 'DRAFT' && 'Draf'}
                  </span>
                )}
              </div>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                Kumpulkan ide dan jawaban singkat peserta secara terstruktur
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            {activity && activity.status === 'CLOSED' && !showCreateForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="text-xs font-semibold gap-1.5 border-stone-300 dark:border-stone-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Papan Baru
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Form Mode */}
          {isFormActive ? (
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="rounded-2xl border border-[#e8e4dc] bg-white p-5 sm:p-6 dark:border-stone-800 dark:bg-stone-850 shadow-2xs">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Buat Topik / Pertanyaan Brainstorming
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                  Tuliskan pertanyaan atau pemantik ide yang akan dijawab oleh seluruh peserta.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Pertanyaan / Topik <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Contoh: Sebutkan 3 dampak pemanasan global terhadap ekosistem laut..."
                      rows={3}
                      maxLength={300}
                      className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 text-sm text-stone-900 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    />
                    <div className="mt-1.5 flex justify-end text-xs text-stone-400">
                      {prompt.length}/300
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="flex items-start gap-3 rounded-xl border border-[#e8e4dc] bg-stone-50/50 p-3.5 dark:border-stone-800 dark:bg-stone-900/60">
                      <input
                        type="checkbox"
                        id="isAnonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="isAnonymous" className="text-xs cursor-pointer">
                        <span className="font-bold text-stone-800 dark:text-stone-200 block">
                          Anonimkan Pengirim
                        </span>
                        <span className="text-stone-500 dark:text-stone-400">
                          Nama peserta disamarkan sebagai &quot;Anonim&quot;.
                        </span>
                      </label>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-[#e8e4dc] bg-stone-50/50 p-3.5 dark:border-stone-800 dark:bg-stone-900/60">
                      <input
                        type="checkbox"
                        id="ideasVisible"
                        checked={ideasVisibleToParticipants}
                        onChange={(e) => setIdeasVisibleToParticipants(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="ideasVisible" className="text-xs cursor-pointer">
                        <span className="font-bold text-stone-800 dark:text-stone-200 block">
                          Tampilkan ke Peserta
                        </span>
                        <span className="text-stone-500 dark:text-stone-400">
                          Peserta dapat melihat ide peserta lain.
                        </span>
                      </label>
                    </div>

                    <div className="rounded-xl border border-[#e8e4dc] bg-stone-50/50 p-3.5 dark:border-stone-800 dark:bg-stone-900/60">
                      <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs mb-1.5">
                        Batas Ide Peserta
                      </span>
                      <select
                        value={submissionMode}
                        onChange={(e) =>
                          setSubmissionMode(e.target.value as BrainstormSubmissionMode)
                        }
                        className="w-full text-xs font-semibold rounded-lg border border-stone-200 bg-white p-2 text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                      >
                        <option value="MULTIPLE_PER_PARTICIPANT">Banyak Ide (Maks. 5)</option>
                        <option value="ONE_PER_PARTICIPANT">1 Ide per Peserta</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {activity && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                    className="text-stone-600 hover:text-stone-900 font-semibold"
                  >
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  size="md"
                  disabled={!prompt.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-bold px-5 rounded-xl shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Buat & Buka Papan Ide
                </Button>
              </div>
            </form>
          ) : (
            /* Active Activity & Moderation View */
            <div className="space-y-6">
              {/* Activity Card */}
              <div className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-5 sm:p-6 dark:border-violet-900/40 dark:bg-violet-950/20 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">
                      Topik Brainstorming
                    </span>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
                      {activity.prompt}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-600 dark:text-stone-400">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 border border-[#e8e4dc] dark:border-stone-800 dark:bg-stone-900 text-stone-700 dark:text-stone-300 shadow-2xs">
                        <Users className="h-3.5 w-3.5 text-stone-500" />
                        {activity.settings.isAnonymous ? 'Anonim' : 'Nama Peserta'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 border border-[#e8e4dc] dark:border-stone-800 dark:bg-stone-900 text-stone-700 dark:text-stone-300 shadow-2xs">
                        <Eye className="h-3.5 w-3.5 text-stone-500" />
                        {activity.settings.ideasVisibleToParticipants
                          ? 'Terlihat oleh Semua'
                          : 'Hanya Guru'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 border border-[#e8e4dc] dark:border-stone-800 dark:bg-stone-900 text-stone-700 dark:text-stone-300 shadow-2xs">
                        {activity.settings.submissionMode === 'ONE_PER_PARTICIPANT'
                          ? 'Maks 1 Ide'
                          : 'Maks 5 Ide'}
                      </span>
                    </div>
                  </div>

                  {/* Lifecycle Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {activity.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        onClick={onOpenActivity}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold rounded-xl"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Buka Papan
                      </Button>
                    )}
                    {activity.status === 'OPEN' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onPauseActivity}
                          className="gap-1.5 text-xs font-semibold rounded-xl border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40"
                        >
                          <Pause className="h-3.5 w-3.5" />
                          Jeda
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onCloseActivity}
                          className="gap-1.5 text-xs font-semibold rounded-xl border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <StopCircle className="h-3.5 w-3.5" />
                          Tutup
                        </Button>
                      </>
                    )}
                    {activity.status === 'PAUSED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={onOpenActivity}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold rounded-xl"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Buka Kembali
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onCloseActivity}
                          className="gap-1.5 text-xs font-semibold rounded-xl border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <StopCircle className="h-3.5 w-3.5" />
                          Tutup
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Ideas Management Header & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e4dc] pb-3.5 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Daftar Ide Peserta
                  </h4>
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    {totalCount} total
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                  <button
                    onClick={() => setFilter('ALL')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      filter === 'ALL'
                        ? 'bg-white text-stone-900 shadow-2xs dark:bg-stone-700 dark:text-stone-100'
                        : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    Semua ({totalCount})
                  </button>
                  <button
                    onClick={() => setFilter('VISIBLE')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      filter === 'VISIBLE'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    Aktif ({visibleCount})
                  </button>
                  <button
                    onClick={() => setFilter('HIDDEN')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      filter === 'HIDDEN'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    Disembunyikan ({hiddenCount})
                  </button>
                </div>
              </div>

              {/* Ideas Grid */}
              {filteredIdeas.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e4dc] py-12 text-center dark:border-stone-800">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {filter === 'ALL'
                      ? 'Belum ada ide yang dikirim'
                      : filter === 'VISIBLE'
                        ? 'Tidak ada ide aktif'
                        : 'Tidak ada ide yang disembunyikan'}
                  </h4>
                  <p className="mt-1 max-w-sm text-xs text-stone-500 dark:text-stone-400">
                    {activity.status === 'OPEN'
                      ? 'Ide dari peserta akan muncul secara otomatis di sini secara realtime.'
                      : 'Buka papan ide agar peserta dapat mulai mengirimkan respons.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredIdeas.map((idea) => {
                    const isHidden = idea.status === 'HIDDEN';
                    return (
                      <div
                        key={idea.id}
                        className={`flex flex-col justify-between rounded-xl border p-4.5 transition-all shadow-2xs ${
                          isHidden
                            ? 'border-red-200 bg-red-50/40 opacity-75 dark:border-red-950/60 dark:bg-red-950/20'
                            : 'border-[#e8e4dc] bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-stone-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              {idea.isAnonymous ? (
                                <ShieldCheck className="h-3.5 w-3.5 text-stone-400" />
                              ) : (
                                <User className="h-3.5 w-3.5 text-stone-400" />
                              )}
                              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                {idea.authorName}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-xs text-stone-400">
                              <Clock className="h-3 w-3" />
                              {formatElapsed(idea.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-stone-900 dark:text-stone-100 break-words leading-relaxed">
                            {idea.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 mt-3.5 border-t border-stone-100 dark:border-stone-800/80">
                          {isHidden ? (
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                              Disembunyikan dari peserta
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Aktif di papan
                            </span>
                          )}

                          {isHidden ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRestoreIdea(idea.id)}
                              className="h-8 text-xs font-semibold text-stone-600 hover:text-emerald-700 gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Tampilkan
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onHideIdea(idea.id)}
                              className="h-8 text-xs font-semibold text-stone-600 hover:text-red-600 gap-1.5"
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                              Sembunyikan
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
