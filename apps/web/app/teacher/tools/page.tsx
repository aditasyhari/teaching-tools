'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ExternalLink,
  Radio,
  BookOpen,
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
  Spinner,
} from '@walikelas/ui';
import { TOOLS, TEACHER_CATEGORIES } from '@walikelas/config';
import type { ToolMetadata, TeacherToolCategory } from '@walikelas/types';
import { useAuth } from '@/lib/auth-context';
import { useSessionModal } from '@/features/session/session-modal-context';

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

function TeacherToolsContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeClassroom } = useAuth();
  const { openCreateModal } = useSessionModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [activeModalTool, setActiveModalTool] = useState<ToolMetadata | null>(null);

  const launchParam = searchParams.get('launch');

  // Handle incoming ?launch=[toolId]
  useEffect(() => {
    if (launchParam) {
      const targetTool = TOOLS.find((t) => t.id === launchParam);
      if (targetTool) {
        if (!targetTool.isInteractive && targetTool.teacherRoute) {
          router.replace(targetTool.teacherRoute);
        } else {
          setActiveModalTool(targetTool);
        }
      }
    }
  }, [launchParam, router]);

  const handleHoverTool = (tool: ToolMetadata) => {
    const destination = tool.teacherRoute || tool.route;
    try {
      router.prefetch(destination);
    } catch {}
  };

  const handleLaunchInConsole = (tool: ToolMetadata) => {
    setActiveModalTool(null);
    const destination = tool.teacherRoute || tool.route;
    router.push(destination);
  };

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
        onHoverTool={handleHoverTool}
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

            {/* Context Information Box */}
            <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Tipe Aktivitas:</span>
                <span className="font-bold text-foreground">
                  {activeModalTool.isInteractive
                    ? 'Interaktif Realtime (Sesi Kelas)'
                    : 'Utilitas Ruang Guru'}
                </span>
              </div>

              {!activeModalTool.isInteractive &&
                (activeModalTool.id === 'random-picker' ||
                  activeModalTool.id === 'group-maker') && (
                  <div className="flex justify-between items-center pt-1 border-t border-border/50">
                    <span className="font-medium">Konteks Kelas:</span>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-blue-600" />
                      {activeClassroom ? activeClassroom.name : 'Belum dipilih (Gunakan nama contoh)'}
                    </span>
                  </div>
                )}

              {activeModalTool.isInteractive && (
                <div className="pt-1.5 border-t border-border/50 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                  Perkakas ini memerlukan <strong>Sesi Kelas</strong> yang aktif agar siswa dapat
                  bergabung dengan kode 6 digit dan berpartisipasi langsung dari gawai masing-masing.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <DialogFooter className="gap-2 sm:gap-2 pt-2">
              {activeModalTool.status === 'COMING_SOON' ? (
                <div className="w-full flex items-center justify-between gap-3">
                  <Badge variant="neutral" size="sm">
                    Segera Hadir
                  </Badge>
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={() => setActiveModalTool(null)}
                  >
                    Tutup
                  </Button>
                </div>
              ) : activeModalTool.isInteractive ? (
                <div className="w-full space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="secondary"
                      size="md"
                      className="sm:w-1/3"
                      onClick={() => setActiveModalTool(null)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1"
                      leftIcon={<Radio className="w-4 h-4" />}
                      onClick={() => {
                        setActiveModalTool(null);
                        if (activeModalTool.id === 'live-quiz') {
                          router.push('/teacher/quizzes');
                        } else if (activeModalTool.id === 'live-poll') {
                          router.push('/teacher/polls');
                        } else {
                          openCreateModal({
                            defaultTitle: `Sesi ${activeModalTool.name}`,
                          });
                        }
                      }}
                    >
                      Mulai di Sesi Kelas
                    </Button>
                  </div>

                  {activeModalTool.id === 'live-quiz' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold"
                      onClick={() => {
                        setActiveModalTool(null);
                        router.push('/teacher/quizzes');
                      }}
                    >
                      Kelola Bank Soal Kuis
                    </Button>
                  )}

                  {activeModalTool.id === 'live-poll' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold"
                      onClick={() => {
                        setActiveModalTool(null);
                        router.push('/teacher/polls');
                      }}
                    >
                      Kelola Daftar Jajak Pendapat
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <div className="flex gap-2">
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
                      leftIcon={<Play className="w-4 h-4 fill-current" />}
                      onClick={() => handleLaunchInConsole(activeModalTool)}
                    >
                      Buka Perkakas
                    </Button>
                  </div>

                  {activeModalTool.route && (
                    <div className="text-center pt-1">
                      <a
                        href={activeModalTool.route}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-stone-500 hover:text-stone-800 font-medium inline-flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka dalam Mode Mandiri Bebas Navigasi (Tab Baru)</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export default function TeacherToolsPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <TeacherToolsContent />
    </Suspense>
  );
}
