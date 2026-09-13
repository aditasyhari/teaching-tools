'use client';

import React, { useState } from 'react';
import {
  Clock,
  Shuffle,
  Users,
  Trophy,
  FileText,
  HelpCircle,
  BarChart2,
  Hand,
  MessageSquare,
  Lightbulb,
  Cloud,
  CheckCircle2,
  Layers,
  X,
  Play,
} from 'lucide-react';
import { PageHeaderSection, SearchField, ToolGrid, Button, Badge } from '@walikelas/ui';
import { TOOLS } from '@walikelas/config';
import type { ToolMetadata } from '@walikelas/types';

const toolIcons: Record<string, React.ReactNode> = {
  timer: <Clock className="w-5 h-5 text-blue-600" />,
  'random-picker': <Shuffle className="w-5 h-5 text-blue-600" />,
  'group-maker': <Users className="w-5 h-5 text-blue-600" />,
  scoreboard: <Trophy className="w-5 h-5 text-blue-600" />,
  'teacher-notes': <FileText className="w-5 h-5 text-blue-600" />,
  'live-quiz': <HelpCircle className="w-5 h-5 text-blue-600" />,
  'live-poll': <BarChart2 className="w-5 h-5 text-blue-600" />,
  'raise-hand': <Hand className="w-5 h-5 text-blue-600" />,
  'question-box': <MessageSquare className="w-5 h-5 text-blue-600" />,
  'brainstorm-board': <Lightbulb className="w-5 h-5 text-blue-600" />,
  'word-cloud': <Cloud className="w-5 h-5 text-blue-600" />,
  'exit-ticket': <CheckCircle2 className="w-5 h-5 text-blue-600" />,
  flashcards: <Layers className="w-5 h-5 text-emerald-600" />,
};

type CategoryFilter = 'ALL' | 'LOCAL' | 'INTERACTIVE' | 'CONTENT';

export default function TeacherToolsPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [activeModalTool, setActiveModalTool] = useState<ToolMetadata | null>(null);

  const categories = [
    { label: 'Semua (13)', value: 'ALL' as const },
    { label: 'Lokal (5)', value: 'LOCAL' as const },
    { label: 'Interaktif (7)', value: 'INTERACTIVE' as const },
    { label: 'Konten (1)', value: 'CONTENT' as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Katalog Perkakas Mengajar"
        description="Pilih perkakas bantu mengajar atau luncurkan aktivitas langsung di hadapan siswa."
        breadcrumbs={[
          { label: 'Ruang Guru', href: '/teacher' },
          { label: 'Perkakas Mengajar', current: true },
        ]}
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-80">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Cari perkakas..."
          />
        </div>
      </div>

      {/* Tool Grid */}
      <ToolGrid
        tools={TOOLS}
        categoryFilter={category === 'ALL' ? undefined : category}
        searchQuery={searchQuery}
        toolIcons={toolIcons}
        onSelectTool={(tool) => setActiveModalTool(tool)}
      />

      {/* Tool Launch Modal Placeholder */}
      {activeModalTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  {toolIcons[activeModalTool.id]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{activeModalTool.name}</h3>
                  <Badge variant="default" size="sm">
                    {activeModalTool.category}
                  </Badge>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalTool(null)}
                aria-label="Tutup"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{activeModalTool.description}</p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-medium">Tipe Eksekusi:</span>
                <span className="font-bold text-slate-800">
                  {activeModalTool.isInteractive ? 'Realtime Classroom' : 'Client Browser'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Otorisasi Guru:</span>
                <span className="font-bold text-slate-800">
                  {activeModalTool.requiresAuth ? 'Perlu Login Google' : 'Tanpa Akun'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setActiveModalTool(null)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                leftIcon={<Play className="w-4 h-4" />}
                onClick={() => {
                  if (activeModalTool.status === 'AVAILABLE' && activeModalTool.route) {
                    window.location.href = activeModalTool.route;
                  } else {
                    alert(
                      `Perkakas "${activeModalTool.name}" akan hadir pada fase interaktif berikutnya.`,
                    );
                    setActiveModalTool(null);
                  }
                }}
              >
                Luncurkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
