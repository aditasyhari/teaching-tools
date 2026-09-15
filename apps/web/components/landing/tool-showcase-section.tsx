'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Shuffle,
  HelpCircle,
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import { Button, ToolCard } from '@walikelas/ui';
import { TOOLS } from '@walikelas/config';
import type { ToolMetadata } from '@walikelas/types';

const toolIcons: Record<string, React.ReactNode> = {
  timer: <Clock className="w-5 h-5 text-amber-600" />,
  'random-picker': <Shuffle className="w-5 h-5 text-violet-600" />,
  'live-quiz': <HelpCircle className="w-5 h-5 text-blue-600" />,
  'live-poll': <BarChart2 className="w-5 h-5 text-emerald-600" />,
};

const featuredToolIds = ['live-quiz', 'live-poll', 'timer', 'random-picker'];

export function ToolShowcaseSection(): React.JSX.Element {
  const featuredShowcaseTools = TOOLS.filter((t) => featuredToolIds.includes(t.id));

  const handleOpenTool = (tool: ToolMetadata) => {
    if (typeof window !== 'undefined') {
      window.location.href = tool.route;
    }
  };

  return (
    <section id="perkakas" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Teacher&apos;s Toolkit
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 tracking-tight">
            Koleksi Perkakas Mengajar Terpadu
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Didesain khusus untuk ritme kelas: dari hitung mundur fokus, pemilihan acak adil, hingga kuis kilat partisipatif.
          </p>
        </div>
        <Link href="/tools">
          <Button variant="outline" size="sm" className="whitespace-nowrap border-stone-300 bg-white shadow-2xs font-semibold">
            Lihat Semua di Katalog
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* 4 Core Tools rendered using official ToolCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {featuredShowcaseTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            icon={toolIcons[tool.id]}
            onAction={handleOpenTool}
          />
        ))}
      </div>

      {/* Explore All Tools Banner Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-stone-100 border border-[#e8e4dc] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-stone-900">
            Masih Ada 9 Perkakas Pembelajaran Lainnya
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            Termasuk Scoreboard, Group Maker, Question Box, Brainstorm Board, Word Cloud, dan Exit Ticket.
          </p>
        </div>
        <Link href="/tools" className="shrink-0">
          <Button variant="primary" size="md" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold border-amber-600/20 shadow-xs">
            <span>Buka Katalog Lengkap (13 Perkakas)</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
