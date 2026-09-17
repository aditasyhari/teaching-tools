'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Clock,
  Shuffle,
  Users,
  Trophy,
  FileText,
  ArrowLeft,
  ExternalLink,
  Tv,
  Loader2,
} from 'lucide-react';
import { Button } from '@walikelas/ui';

export interface InConsoleToolHeaderProps {
  toolId: 'timer' | 'random-picker' | 'group-maker' | 'scoreboard';
  toolName: string;
}

const CONSOLE_TOOLS = [
  { id: 'timer', href: '/teacher/tools/timer', label: 'Timer', icon: Clock },
  { id: 'random-picker', href: '/teacher/tools/random-picker', label: 'Random Picker', icon: Shuffle },
  { id: 'group-maker', href: '/teacher/tools/group-maker', label: 'Group Maker', icon: Users },
  { id: 'scoreboard', href: '/teacher/tools/scoreboard', label: 'Scoreboard', icon: Trophy },
  { id: 'teacher-notes', href: '/teacher/notes', label: 'Catatan Guru', icon: FileText },
];

export function InConsoleToolHeader({
  toolId,
  toolName,
}: InConsoleToolHeaderProps): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending state when navigation completes
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // Corresponding public route for standalone / projector display
  const publicRouteMap: Record<string, string> = {
    timer: '/tools/timer',
    'random-picker': '/tools/random-picker',
    'group-maker': '/tools/group-maker',
    scoreboard: '/tools/scoreboard',
  };

  const publicRoute = publicRouteMap[toolId] || '/tools';

  return (
    <div className="mb-6 space-y-4">
      {/* Top Bar: Back link, Title, and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#e8e4dc] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/tools"
            className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 p-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Katalog Perkakas</span>
          </Link>

          <span className="text-stone-300">/</span>

          <h1 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
            {toolName}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <a
            href={publicRoute}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka tampilan mandiri bebas navigasi di tab baru"
            className="inline-flex"
          >
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="text-xs font-semibold"
            >
              Mode Mandiri (Tab Baru)
            </Button>
          </a>

          <a
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex"
            title="Buka portal layar proyektor kelas"
          >
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Tv className="w-3.5 h-3.5" />}
              className="text-xs font-semibold"
            >
              Mode Proyektor
            </Button>
          </a>
        </div>
      </div>

      {/* Tool Quick Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CONSOLE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = pathname === tool.href;
          const isPending = pendingHref === tool.href;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              prefetch={true}
              onMouseEnter={() => {
                try {
                  router.prefetch(tool.href);
                } catch {}
              }}
              onTouchStart={() => {
                try {
                  router.prefetch(tool.href);
                } catch {}
              }}
              onClick={() => {
                if (pathname !== tool.href) {
                  setPendingHref(tool.href);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : isPending
                  ? 'bg-stone-100 text-stone-900 border border-amber-400 shadow-2xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 border border-[#e8e4dc]'
              }`}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              ) : (
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
              )}
              <span>{tool.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

