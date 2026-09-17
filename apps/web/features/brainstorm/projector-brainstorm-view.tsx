'use client';

import React from 'react';
import { Lightbulb, Users, Radio, PauseCircle, Clock } from 'lucide-react';
import type { BrainstormActivity, BrainstormIdea } from '@walikelas/types';

interface ProjectorBrainstormViewProps {
  activity: BrainstormActivity | null;
  ideas: BrainstormIdea[];
  totalIdeasCount?: number;
}

// Color palette for sticky notes on dark presentation background
const NOTE_VARIANTS = [
  {
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    text: 'text-amber-100',
    badge: 'bg-amber-500/25 text-amber-300',
    pin: 'bg-amber-400',
  },
  {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    text: 'text-emerald-100',
    badge: 'bg-emerald-500/25 text-emerald-300',
    pin: 'bg-emerald-400',
  },
  {
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/40',
    text: 'text-sky-100',
    badge: 'bg-sky-500/25 text-sky-300',
    pin: 'bg-sky-400',
  },
  {
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/40',
    text: 'text-violet-100',
    badge: 'bg-violet-500/25 text-violet-300',
    pin: 'bg-violet-400',
  },
  {
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
    text: 'text-rose-100',
    badge: 'bg-rose-500/25 text-rose-300',
    pin: 'bg-rose-400',
  },
];

export function ProjectorBrainstormView({
  activity,
  ideas,
  totalIdeasCount,
}: ProjectorBrainstormViewProps): React.JSX.Element {
  const visibleIdeas = ideas.filter((i) => i.status === 'VISIBLE');
  const count = totalIdeasCount ?? visibleIdeas.length;

  const isOpen = activity?.status === 'OPEN';
  const isPaused = activity?.status === 'PAUSED';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Card: Prompt & Status */}
      <div className="bg-slate-900 border-2 border-violet-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 text-white font-black text-sm shadow-md shadow-violet-600/20">
              <Lightbulb className="w-4 h-4" />
              Papan Ide Kelas
            </span>
            <span className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-violet-400" />
              {count} ide terkumpul
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOpen && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs tracking-wide">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Menerima Kiriman Siswa</span>
              </div>
            )}
            {isPaused && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold text-xs">
                <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Pengiriman Dijeda</span>
              </div>
            )}
          </div>
        </div>

        {/* Brainstorm Prompt Question */}
        <div className="space-y-1">
          <p className="text-xs uppercase font-extrabold tracking-widest text-violet-400">
            Pertanyaan / Topik Brainstorming
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-snug tracking-tight">
            {activity?.prompt || 'Pertanyaan ide sedang disiapkan guru...'}
          </h2>
        </div>
      </div>

      {/* Grid of Sticky Notes */}
      {visibleIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-16 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-violet-950/60 border border-violet-800/40 text-violet-400 flex items-center justify-center">
            <Lightbulb className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">Belum Ada Ide yang Dikirim</h3>
          <p className="text-sm md:text-base text-slate-400 max-w-md">
            Buka HP Anda dan tuliskan ide atau jawaban Anda pada form sesi kelas. Ide yang dikirimkan
            akan langsung tertempel di layar ini secara realtime!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {visibleIdeas.map((idea, index) => {
            const variant = NOTE_VARIANTS[index % NOTE_VARIANTS.length] ?? NOTE_VARIANTS[0]!;
            const author = idea.isAnonymous ? 'Anonim' : idea.authorName || 'Peserta';

            return (
              <div
                key={idea.id}
                className={`relative flex flex-col justify-between p-5 md:p-6 rounded-2xl border ${variant.border} ${variant.bg} backdrop-blur-xs shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in zoom-in-95`}
              >
                {/* Visual Pin Indicator */}
                <div className="absolute -top-2 left-6 flex items-center">
                  <span className={`w-3.5 h-3.5 rounded-full ${variant.pin} shadow-md border-2 border-slate-950`} />
                </div>

                <div className="space-y-3 pt-1">
                  <p className={`text-base md:text-lg font-bold leading-relaxed ${variant.text} break-words whitespace-pre-wrap`}>
                    &ldquo;{idea.content}&rdquo;
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-300">
                  <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${variant.badge}`}>
                    {author}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(idea.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
