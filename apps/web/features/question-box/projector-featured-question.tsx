'use client';

import React from 'react';
import { HelpCircle, Sparkles, User } from 'lucide-react';
import type { SharedQuestionItem } from '@walikelas/types';

interface ProjectorFeaturedQuestionProps {
  question: SharedQuestionItem | null;
}

export function ProjectorFeaturedQuestion({ question }: ProjectorFeaturedQuestionProps) {
  if (!question) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 rounded-3xl border-4 border-amber-400 bg-white p-8 md:p-12 shadow-2xl dark:border-amber-500 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg">
            <Sparkles className="h-7 w-7" />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Pertanyaan Disorot
            </h3>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Sedang dibahas bersama di kelas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 dark:bg-slate-800">
          <User className="h-5 w-5 text-slate-500" />
          <span className="text-base font-bold text-slate-700 dark:text-slate-300">
            {question.isAnonymous ? 'Anonim' : question.authorName}
          </span>
        </div>
      </div>

      {/* Main Question Text */}
      <div className="py-4">
        <p className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug whitespace-pre-wrap">
          &ldquo;{question.content}&rdquo;
        </p>
      </div>

      {/* Footer info */}
      <div className="mt-8 flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>Kotak Pertanyaan &bull; WaliKelas Tools</span>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          Layar Proyektor
        </span>
      </div>
    </div>
  );
}
