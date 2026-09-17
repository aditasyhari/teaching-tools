'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import {
  SearchField,
  ToolGrid,
  FeaturedToolCard,
  Button,
} from '@walikelas/ui';
import { TOOLS, TEACHER_CATEGORIES } from '@walikelas/config';
import type { ToolMetadata, TeacherToolCategory } from '@walikelas/types';
import { motion } from 'motion/react';
import { fadeIn, slideUp, staggerContainer } from '../../lib/motion';

// Pedagogical icon palette with warm, accessible tones
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

const featuredIcons: Record<string, React.ReactNode> = {
  timer: <Clock className="w-6 h-6 text-amber-700" />,
  'random-picker': <Shuffle className="w-6 h-6 text-violet-700" />,
  'live-quiz': <HelpCircle className="w-6 h-6 text-blue-700" />,
};

type ActiveFilter = 'ALL' | TeacherToolCategory;

export default function ToolsPage(): React.JSX.Element {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActiveFilter>('ALL');

  // Featured tools (Timer, Random Picker, Live Quiz)
  const featuredTools = useMemo(
    () => TOOLS.filter((tool) => tool.featured),
    [],
  );

  // Compute tool counts per teacher category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: TOOLS.length };
    for (const tool of TOOLS) {
      if (tool.teacherCategory) {
        counts[tool.teacherCategory] = (counts[tool.teacherCategory] || 0) + 1;
      }
    }
    return counts;
  }, []);

  // Compute currently matching tools count
  const filteredToolsCount = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'ALL' || tool.teacherCategory === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).length;
  }, [selectedCategory, searchQuery]);

  const handleHoverTool = (tool: ToolMetadata) => {
    const destination =
      tool.status === 'AVAILABLE' && tool.route
        ? tool.route
        : `/teacher/tools?launch=${tool.id}`;
    try {
      router.prefetch(destination);
    } catch {}
  };

  const handleSelectTool = (tool: ToolMetadata) => {
    if (tool.status === 'AVAILABLE' && tool.route) {
      router.push(tool.route);
    } else {
      router.push(`/teacher/tools?launch=${tool.id}`);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* Header Bar */}
      <header className="bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4dc] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <span className="text-stone-300">/</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900">Katalog Perkakas</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200/60">
                13 Perkakas
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/teacher">
              <Button
                variant="secondary"
                size="sm"
                className="font-bold border-[#e8e4dc] hover:bg-stone-100 hover:text-stone-900 shadow-2xs"
              >
                Ruang Guru
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Catalog Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Page Introduction: Compact, Calm, Teacher-First */}
        <motion.div
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={fadeIn.transition}
          className="space-y-2 text-left"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200/60 text-amber-900 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>Kotak Perkakas Guru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Perkakas untuk kelas yang lebih aktif
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl font-normal leading-relaxed">
            Mulai aktivitas kelas dengan perkakas yang tepat. Praktis, cepat, dan dirancang langsung untuk mendampingi pengajaran Anda.
          </p>
        </motion.div>

        {/* Section: Perkakas Utama Kelas (Featured Tools) */}
        {!searchQuery && selectedCategory === 'ALL' && (
          <motion.section
            initial={slideUp.initial}
            animate={slideUp.animate}
            transition={slideUp.transition}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Perkakas Utama Kelas</span>
                </h2>
                <p className="text-xs text-stone-500 font-normal">
                  Perkakas yang paling sering digunakan untuk memulai pembelajaran aktif.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {featuredTools.map((tool) => (
                <FeaturedToolCard
                  key={tool.id}
                  tool={tool}
                  icon={featuredIcons[tool.id]}
                  onAction={handleSelectTool}
                  onHover={handleHoverTool}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Section: Search & Category Filter Toolbar */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#e8e4dc] shadow-xs">
            {/* Category Filter Pills */}
            <div
              role="tablist"
              aria-label="Kategori Perkakas"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar scrollbar-none snap-x"
            >
              {TEACHER_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as ActiveFilter)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ease-out flex items-center gap-2 snap-start shrink-0 min-h-[40px] active:scale-[0.97] ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-stone-200/80 text-stone-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Field */}
            <div className="w-full sm:w-80 shrink-0">
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder="Cari perkakas..."
              />
            </div>
          </div>

          {/* Section: All Tools Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-stone-500" />
                <h2 className="text-base font-bold text-stone-900">
                  {selectedCategory === 'ALL'
                    ? 'Semua Perkakas'
                    : TEACHER_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Perkakas'}
                </h2>
              </div>
              {searchQuery ? (
                <span className="text-xs text-stone-500 font-medium">
                  Menampilkan {filteredToolsCount} hasil untuk &ldquo;{searchQuery}&rdquo;
                </span>
              ) : (
                <span className="text-xs text-stone-400 font-medium">
                  {filteredToolsCount} dari {TOOLS.length} perkakas
                </span>
              )}
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <ToolGrid
                tools={TOOLS}
                categoryFilter={selectedCategory === 'ALL' ? undefined : selectedCategory}
                searchQuery={searchQuery}
                toolIcons={toolIcons}
                onSelectTool={handleSelectTool}
                onHoverTool={handleHoverTool}
                onResetFilters={handleResetFilters}
              />
            </motion.div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#e8e4dc] py-8 mt-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="text-xs font-semibold text-stone-700">
            WaliKelas Teaching Tools V1 &bull; tools.walikelas.id
          </p>
          <p className="text-[11px] text-stone-400">
            Perkakas bantu pembelajaran mandiri dan interaktif untuk guru Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
