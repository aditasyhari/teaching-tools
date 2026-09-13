'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Eye,
  UserCheck,
} from 'lucide-react';
import { Button, Input, PageHeaderSection } from '@walikelas/ui';
import type { Poll } from '@walikelas/types';
import { createPoll, updatePoll } from '@walikelas/api-client';
import { apiClient } from '../../lib/api';
import { QUICK_FEEDBACK_PRESETS } from './quick-feedback-presets';

interface OptionFormState {
  id?: string;
  optionText: string;
}

interface PollEditorViewProps {
  initialPoll?: Poll;
  isEditing?: boolean;
}

const OPTION_BADGE_COLORS = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-purple-600 text-white',
  'bg-rose-600 text-white',
  'bg-cyan-600 text-white',
  'bg-indigo-600 text-white',
  'bg-teal-600 text-white',
];

export function PollEditorView({
  initialPoll,
  isEditing = false,
}: PollEditorViewProps): React.JSX.Element {
  const router = useRouter();

  const [title, setTitle] = useState(initialPoll?.title || '');
  const [question, setQuestion] = useState(initialPoll?.question || '');
  const [type, setType] = useState<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>(
    initialPoll?.type || 'SINGLE_CHOICE',
  );

  const [allowMultiple, setAllowMultiple] = useState(
    initialPoll?.settings?.allowMultiple ?? initialPoll?.type === 'MULTIPLE_CHOICE',
  );
  const [showResultsToParticipants, setShowResultsToParticipants] = useState(
    initialPoll?.settings?.showResultsToParticipants ?? true,
  );
  const [isAnonymous, setIsAnonymous] = useState(initialPoll?.settings?.isAnonymous ?? true);

  const [options, setOptions] = useState<OptionFormState[]>(() => {
    if (initialPoll?.options && initialPoll.options.length > 0) {
      return initialPoll.options.map((o) => ({
        id: o.id,
        optionText: o.optionText,
      }));
    }
    return [
      { optionText: 'Sangat Paham' },
      { optionText: 'Cukup Paham' },
      { optionText: 'Masih Bingung' },
    ];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply a preset directly into the form
  const applyPreset = (presetId: string) => {
    const preset = QUICK_FEEDBACK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setTitle(preset.title);
    setQuestion(preset.question);
    setType(preset.type);
    setAllowMultiple(preset.type === 'MULTIPLE_CHOICE');
    setOptions(preset.options.map((text) => ({ optionText: text })));
    setError(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index]!, optionText: value };
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 8) return;
    setOptions([...options, { optionText: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Judul polling tidak boleh kosong');
      return;
    }
    if (!question.trim()) {
      setError('Pertanyaan polling tidak boleh kosong');
      return;
    }
    if (options.length < 2) {
      setError('Polling harus memiliki minimal 2 pilihan opsi');
      return;
    }
    for (let i = 0; i < options.length; i++) {
      if (!options[i]!.optionText.trim()) {
        setError(`Teks pada opsi ${i + 1} tidak boleh kosong`);
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        question: question.trim(),
        type,
        settings: {
          allowMultiple,
          showResultsToParticipants,
          isAnonymous,
        },
        options: options.map((opt) => ({
          optionText: opt.optionText.trim(),
        })),
      };

      if (isEditing && initialPoll) {
        await updatePoll(apiClient, initialPoll.id, payload);
      } else {
        await createPoll(apiClient, payload);
      }

      router.push('/teacher/polls');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan polling');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Top Header & Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/teacher/polls')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Polling
        </Button>
      </div>

      <PageHeaderSection
        title={isEditing ? 'Edit Polling & Feedback' : 'Buat Polling / Feedback Baru'}
        description="Siapkan polling cepat untuk mengukur pemahaman, mengumpulkan pendapat, atau mengevaluasi respons kelas secara instan."
      />

      {/* Preset Quick Fill Section */}
      {!isEditing && (
        <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Gunakan Preset Quick Feedback Cepat (1-Klik Isi Form):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {QUICK_FEEDBACK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="p-3 text-left bg-card hover:bg-muted/80 border border-border rounded-lg text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="font-semibold text-foreground mb-1">{preset.name}</div>
                <div className="text-muted-foreground line-clamp-2">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card: Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Informasi Polling
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Judul Polling <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Cek Pemahaman Materi Bab 3"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Pertanyaan / Topik <span className="text-destructive">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Contoh: Seberapa yakin kamu bisa menyelesaikan latihan mandiri ini?"
              rows={3}
              maxLength={500}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {/* Card: Options */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Pilihan Jawaban</h2>
              <p className="text-xs text-muted-foreground">
                Minimal 2 pilihan, maksimal 8 pilihan opsi.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={options.length >= 8}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Tambah Opsi
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                    OPTION_BADGE_COLORS[index % OPTION_BADGE_COLORS.length]
                  }`}
                >
                  {index + 1}
                </div>
                <Input
                  value={opt.optionText}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Teks pilihan ${index + 1}`}
                  maxLength={200}
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  className="text-muted-foreground hover:text-destructive shrink-0 px-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Settings */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Pengaturan Polling
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => {
                  setAllowMultiple(e.target.checked);
                  setType(e.target.checked ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE');
                }}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Izinkan Jawaban Ganda (Multiple Choice)
                </div>
                <div className="text-xs text-muted-foreground">
                  Peserta dapat memilih lebih dari satu opsi jawaban.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showResultsToParticipants}
                onChange={(e) => setShowResultsToParticipants(e.target.checked)}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  Tampilkan Hasil & Persentase ke Peserta
                </div>
                <div className="text-xs text-muted-foreground">
                  Peserta dapat melihat distribusi polling secara langsung atau setelah polling
                  ditutup.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Respon Anonim
                </div>
                <div className="text-xs text-muted-foreground">
                  Identitas nama peserta tidak ditampilkan pada statistik hasil polling.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/teacher/polls')}
            disabled={saving}
          >
            Batal
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Polling'}
          </Button>
        </div>
      </form>
    </div>
  );
}
