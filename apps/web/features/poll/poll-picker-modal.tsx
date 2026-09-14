'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, Play, X, Plus, Sparkles, Folder } from 'lucide-react';
import { Button } from '@walikelas/ui';
import type { PollSummary } from '@walikelas/types';
import { fetchTeacherPolls, createPoll } from '@walikelas/api-client';
import { apiClient } from '../../lib/api';
import { QUICK_FEEDBACK_PRESETS, QuickFeedbackPreset } from './quick-feedback-presets';
import Link from 'next/link';

interface PollPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPoll: (pollId: string) => void;
}

export function PollPickerModal({
  isOpen,
  onClose,
  onSelectPoll,
}: PollPickerModalProps): React.JSX.Element | null {
  const [tab, setTab] = useState<'PRESETS' | 'SAVED'>('PRESETS');
  const [polls, setPolls] = useState<PollSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creatingPreset, setCreatingPreset] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchTeacherPolls(apiClient);
        if (mounted) {
          setPolls(data);
          if (data.length > 0 && !selectedId) {
            setSelectedId(data[0]!.id);
          }
        }
      } catch {
        // Silent fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSaved = () => {
    if (!selectedId) return;
    onSelectPoll(selectedId);
    onClose();
  };

  const handleStartPreset = async (preset: QuickFeedbackPreset) => {
    try {
      setCreatingPreset(true);
      const created = await createPoll(apiClient, {
        title: preset.title,
        question: preset.question,
        type: preset.type,
        settings: {
          allowMultiple: preset.type === 'MULTIPLE_CHOICE',
          showResultsToParticipants: true,
          isAnonymous: true,
        },
        options: preset.options.map((opt) => ({ optionText: opt })),
      });

      onSelectPoll(created.id);
      onClose();
    } catch {
      // Handle error
    } finally {
      setCreatingPreset(false);
    }
  };

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="poll-picker-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 id="poll-picker-dialog-title" className="text-base font-bold text-foreground">
              Mulai Polling / Quick Feedback
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted/60 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setTab('PRESETS')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              tab === 'PRESETS'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Preset Cepat (1-Klik)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('SAVED')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              tab === 'SAVED'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-primary" />
            <span>Polling Tersimpan ({polls.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'PRESETS' ? (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {QUICK_FEEDBACK_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col justify-between gap-2.5 shadow-sm"
              >
                <div>
                  <div className="text-sm font-bold text-foreground mb-0.5">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{preset.question}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {preset.options.map((opt, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-muted px-2 py-0.5 rounded-md text-foreground font-medium"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  onClick={() => handleStartPreset(preset)}
                  disabled={creatingPreset}
                  className="w-full text-xs font-semibold mt-1"
                >
                  {creatingPreset ? 'Menyiapkan...' : 'Mulai Preset Ini'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Memuat polling tersimpan...</span>
              </div>
            ) : polls.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Anda belum memiliki polling tersimpan.
                </p>
                <Link href="/teacher/polls/new" onClick={onClose}>
                  <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                    Buat Polling Baru
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {polls.map((poll) => {
                  const isSelected = selectedId === poll.id;
                  return (
                    <div
                      key={poll.id}
                      onClick={() => setSelectedId(poll.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-foreground">{poll.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {poll.question}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-primary bg-primary text-white' : 'border-border'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {polls.length > 0 && (
              <div className="flex justify-end gap-3 pt-4 mt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  onClick={handleStartSaved}
                  disabled={!selectedId}
                >
                  Mulai Polling
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
