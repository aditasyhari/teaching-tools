'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Shuffle,
  Users,
  Trophy,
  FileText,
  Home,
  LayoutGrid,
} from 'lucide-react';
import { TimerView } from '../../features/timer/timer-view';
import { RandomPickerView } from '../../features/random-picker/random-picker-view';
import { GroupMakerView } from '../../features/group-maker/group-maker-view';
import { ScoreboardView } from '../../features/scoreboard/scoreboard-view';
import { TeacherNotesView } from '../../features/teacher-notes/teacher-notes-view';
import { useOptionalAuth } from '../../lib/auth-context';

const LOCAL_TOOLS = [
  { href: '/tools/timer', label: 'Timer', icon: Clock },
  { href: '/tools/random-picker', label: 'Random Picker', icon: Shuffle },
  { href: '/tools/group-maker', label: 'Group Maker', icon: Users },
  { href: '/tools/scoreboard', label: 'Scoreboard', icon: Trophy },
  { href: '/tools/notes', label: 'Catatan Guru', icon: FileText },
];

export function ToolsLayoutClient({ children }: { children?: React.ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const auth = useOptionalAuth();
  const isCatalogHome = pathname === '/tools';
  const isLocalTool = LOCAL_TOOLS.some((t) => t.href === pathname);

  // Active tool state for 0ms instant switching between local tools
  const [activeLocalTool, setActiveLocalTool] = useState<string>(pathname);

  // Sync state when pathname changes via external navigation
  useEffect(() => {
    if (isLocalTool) {
      setActiveLocalTool(pathname);
    }
  }, [pathname, isLocalTool]);

  // Handle browser Back / Forward navigation for instant tab sync
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (LOCAL_TOOLS.some((t) => t.href === currentPath)) {
          setActiveLocalTool(currentPath);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 0ms Instant Client Switcher Handler
  const handleToolClick = (e: React.MouseEvent, href: string) => {
    if (isLocalTool) {
      e.preventDefault();
      setActiveLocalTool(href);
      if (typeof window !== 'undefined' && window.location.pathname !== href) {
        window.history.pushState(null, '', href);
      }
    }
  };

  if (isCatalogHome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
      {/* Universal Top Navigation for Tools */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#e8e4dc] sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand & Back link */}
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1.5 rounded-lg hover:bg-stone-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Katalog Perkakas</span>
            </Link>

            <span className="text-stone-300 hidden sm:inline">|</span>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-extrabold text-stone-900 tracking-tight">
                WaliKelas Tools
              </span>
            </div>
          </div>

          {/* Center: Tool Quick Switcher Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f4eee2]/80 border border-[#e8e4dc] p-1 rounded-xl">
            {LOCAL_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const currentActive = isLocalTool ? activeLocalTool : pathname;
              const isActive = currentActive === tool.href;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  prefetch={true}
                  onClick={(e) => handleToolClick(e, tool.href)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-xs border border-[#e8e4dc]'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tool.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-2">
            {auth?.isAuthenticated ? (
              <>
                <Link
                  href={
                    (isLocalTool ? activeLocalTool : pathname) === '/tools/timer'
                      ? '/teacher/tools/timer'
                      : (isLocalTool ? activeLocalTool : pathname) === '/tools/random-picker'
                      ? '/teacher/tools/random-picker'
                      : (isLocalTool ? activeLocalTool : pathname) === '/tools/group-maker'
                      ? '/teacher/tools/group-maker'
                      : (isLocalTool ? activeLocalTool : pathname) === '/tools/scoreboard'
                      ? '/teacher/tools/scoreboard'
                      : (isLocalTool ? activeLocalTool : pathname) === '/tools/notes'
                      ? '/teacher/notes'
                      : '/teacher'
                  }
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-950 bg-amber-200/70 border border-amber-300/80 hover:bg-amber-300/80 transition-colors shadow-2xs"
                  title="Buka perkakas ini di Konsol Guru"
                >
                  <span>Buka di Konsol Guru</span>
                </Link>
                <Link
                  href="/teacher"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
                >
                  <Home className="w-3.5 h-3.5 text-blue-700" />
                  <span>Ruang Guru</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-white border border-[#e8e4dc] hover:bg-stone-50 transition-colors shadow-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Masuk Guru</span>
              </Link>
            )}

            <Link
              href="/tools"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-200/60 transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Semua Perkakas</span>
            </Link>
          </div>
        </div>

        {/* Mobile Horizontal Tool Tabs */}
        <div className="flex md:hidden items-center gap-1 px-4 py-2 overflow-x-auto border-t border-[#e8e4dc] no-scrollbar scrollbar-none">
          {LOCAL_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const currentActive = isLocalTool ? activeLocalTool : pathname;
            const isActive = currentActive === tool.href;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                prefetch={true}
                onClick={(e) => handleToolClick(e, tool.href)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tool.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Tool Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {isLocalTool ? (
          <>
            <div className={activeLocalTool === '/tools/timer' ? 'block' : 'hidden'}>
              <TimerView />
            </div>
            <div className={activeLocalTool === '/tools/random-picker' ? 'block' : 'hidden'}>
              <RandomPickerView />
            </div>
            <div className={activeLocalTool === '/tools/group-maker' ? 'block' : 'hidden'}>
              <GroupMakerView />
            </div>
            <div className={activeLocalTool === '/tools/scoreboard' ? 'block' : 'hidden'}>
              <ScoreboardView />
            </div>
            <div className={activeLocalTool === '/tools/notes' ? 'block' : 'hidden'}>
              <TeacherNotesView />
            </div>
          </>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

