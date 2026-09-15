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
  Play,
} from 'lucide-react';
import {
  PageHeaderSection,
  SearchField,
  ToolGrid,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@walikelas/ui';
import { TOOLS, TEACHER_CATEGORIES } from '@walikelas/config';
import type { ToolMetadata, TeacherToolCategory } from '@walikelas/types';

const toolIcons: Record<string, React.ReactNode> = {
  timer: <Clock className="w-5 h-5 text-amber-600" />,
  'random-picker': <Shuffle className="w-5 h-5 text-violet-600" />,
  'group-maker': <Users className="w-5 h-5 text-teal-600" />,
  scoreboard: <Trophy className="w-5 h-5 text-amber-600" />,
  'teacher-notes': <FileText className="w-5 h-5 text-rose-600" />,
  'live-quiz': <HelpCircle className="w-5 h-5 text-blue-600" />,
  'live-poll': <BarChart2 className="w-5 h-5 text-emerald-600" />,
  'raise-hand': <Hand className="w-5 h-5 text-indigo-600" />,
  'question-box': <MessageSquare className="w-5 h-5 text-sky-600" />,
  'brainstorm-board': <Lightbulb className="w-5 h-5 text-amber-600" />,
  'word-cloud': <Cloud className="w-5 h-5 text-cyan-600" />,
  'exit-ticket': <CheckCircle2 className="w-5 h-5 text-rose-600" />,
  flashcards: <Layers className="w-5 h-5 text-emerald-600" />,
};

type CategoryFilter = 'ALL' | TeacherToolCategory;

export default function TeacherToolsPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [activeModalTool, setActiveModalTool] = useState<ToolMetadata | null>(null);

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
          {TEACHER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id as CategoryFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-stone-900 text-white'
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

      {/* Tool Launch Modal */}
      <Dialog
        open={Boolean(activeModalTool)}
        onOpenChange={(open) => !open && setActiveModalTool(null)}
      >
        {activeModalTool && (
          <DialogContent className="max-w-md">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  {toolIcons[activeModalTool.id]}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {activeModalTool.name}
                  </DialogTitle>
                  {activeModalTool.categoryLabel && (
                    <Badge variant="default" size="sm" className="mt-1">
                      {activeModalTool.categoryLabel}
                    </Badge>
                  )}
                </div>
              </div>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-2">
                {activeModalTool.description}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs text-muted-foreground space-y-1.5">
              <div className="flex justify-between">
                <span className="font-medium">Tipe Eksekusi:</span>
                <span className="font-bold text-foreground">
                  {activeModalTool.isInteractive ? 'Realtime Classroom' : 'Client Browser'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Otorisasi Guru:</span>
                <span className="font-bold text-foreground">
                  {activeModalTool.requiresAuth ? 'Perlu Login Google' : 'Tanpa Akun'}
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2 pt-2">
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
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
