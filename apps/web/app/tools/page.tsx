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
  ArrowLeft,
} from 'lucide-react';
import { SearchField, ToolGrid, PageHeaderSection, Button } from '@walikelas/ui';
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

export default function ToolsPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');

  const categories: { label: string; value: CategoryFilter; count: number }[] = [
    { label: 'Semua Perkakas', value: 'ALL', count: TOOLS.length },
    {
      label: 'Utilitas Lokal',
      value: 'LOCAL',
      count: TOOLS.filter((t) => t.category === 'LOCAL').length,
    },
    {
      label: 'Aktivitas Interaktif',
      value: 'INTERACTIVE',
      count: TOOLS.filter((t) => t.category === 'INTERACTIVE').length,
    },
    {
      label: 'Konten & Penguatan',
      value: 'CONTENT',
      count: TOOLS.filter((t) => t.category === 'CONTENT').length,
    },
  ];

  const handleSelectTool = (tool: ToolMetadata) => {
    if (tool.status === 'AVAILABLE' && tool.route) {
      window.location.href = tool.route;
    } else {
      window.location.href = `/teacher/tools?launch=${tool.id}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Beranda</span>
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-900">Katalog Perkakas</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/teacher">
              <Button variant="primary" size="sm">
                Buka Teacher Console
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <PageHeaderSection
          title="Katalog Perkakas Pembelajaran"
          description="Eksplorasi seluruh perkakas V1 untuk mengelola kelas dan mengaktifkan partisipasi murid secara interaktif."
          breadcrumbs={[
            { label: 'Beranda', href: '/' },
            { label: 'Katalog Perkakas', current: true },
          ]}
        />

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.value
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Field */}
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
          categoryFilter={selectedCategory === 'ALL' ? undefined : selectedCategory}
          searchQuery={searchQuery}
          toolIcons={toolIcons}
          onSelectTool={handleSelectTool}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          WaliKelas Teaching Tools V1 &bull; Standalone classroom tools &bull; tools.walikelas.id
        </div>
      </footer>
    </div>
  );
}
