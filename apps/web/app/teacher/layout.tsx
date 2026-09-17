'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  Radio,
  FolderKanban,
  FileText,
  Plus,
  Tv,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import {
  Sidebar,
  Topbar,
  MobileNavigation,
  MobileDrawer,
  UserMenu,
  Button,
  Spinner,
} from '@walikelas/ui';
import type { TeachingSession } from '@walikelas/types';
import { fetchTeacherSessions } from '@walikelas/api-client';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { TeacherLoginView } from '@/components/auth/teacher-login-view';
import { SessionModalProvider, useSessionModal } from '@/features/session/session-modal-context';

function TeacherLayoutContent({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { openCreateModal } = useSessionModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<TeachingSession | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    user,
    profile,
    classrooms,
    activeClassroom,
    setActiveClassroom,
    isLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  // Check active session dynamically to power live badges
  useEffect(() => {
    let isMounted = true;
    async function loadActiveSession() {
      try {
        const list = await fetchTeacherSessions(apiClient);
        if (isMounted) {
          const current = list.find((s) => s.status === 'ACTIVE' || s.status === 'WAITING');
          setActiveSession(current || null);
        }
      } catch {
        if (isMounted) setActiveSession(null);
      }
    }
    if (isAuthenticated) {
      loadActiveSession();
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, pathname]);

  // Close classroom dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setClassDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setClassDropdownOpen(false);
      }
    }
    if (classDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [classDropdownOpen]);

  // Dynamic navigation sections — No redundant dead "Sesi Aktif" link
  const navSections = [
    ...(activeSession
      ? [
          {
            title: 'Sesi Kelas Berlangsung',
            items: [
              {
                label: activeSession.title || 'Konsol Sesi Aktif',
                href: `/teacher/sessions/${activeSession.id}`,
                icon: <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />,
                active: pathname.startsWith(`/teacher/sessions/${activeSession.id}`),
                badge: activeSession.joinCode,
              },
            ],
          },
        ]
      : []),
    {
      title: 'Menu Utama',
      items: [
        {
          label: 'Dasbor Guru',
          href: '/teacher',
          icon: <LayoutDashboard className="w-5 h-5" />,
          active: pathname === '/teacher',
        },
        {
          label: 'Perkakas Mengajar',
          href: '/teacher/tools',
          icon: <Wrench className="w-5 h-5" />,
          active: pathname.startsWith('/teacher/tools'),
          badge: '13',
        },
      ],
    },
    {
      title: 'Ruang Kelas & Bahan',
      items: [
        {
          label: 'Kelas Saya',
          href: '/teacher/classrooms',
          icon: <FolderKanban className="w-5 h-5" />,
          active: pathname.startsWith('/teacher/classrooms'),
          badge: classrooms.length > 0 ? String(classrooms.length) : undefined,
        },
        {
          label: 'Catatan Guru',
          href: '/teacher/notes',
          icon: <FileText className="w-5 h-5" />,
          active: pathname.startsWith('/teacher/notes'),
        },
      ],
    },
  ];

  const flatNavItems = navSections.flatMap((s) => s.items);

  const brandConfig = {
    name: 'WaliKelas',
    subtitle: 'Teaching Tools',
    href: '/teacher',
    badge: 'Guru',
    logo: (
      <div className="w-8 h-8 rounded-lg bg-white border border-stone-200/80 p-1 flex items-center justify-center shadow-xs">
        <img src="/logo.png" alt="WaliKelas" className="w-6 h-6 object-contain" />
      </div>
    ),
  };

  const renderSidebarLink = (props: {
    href: string;
    className: string;
    children: React.ReactNode;
    'aria-current'?: 'page';
  }) => (
    <Link
      href={props.href}
      className={props.className}
      aria-current={props['aria-current']}
      onClick={() => setMobileMenuOpen(false)}
    >
      {props.children as any}
    </Link>
  );

  const sidebarFooter = (isMobile = false) => (
    <div className="space-y-3">
      {activeSession ? (
        <Link
          href={`/teacher/sessions/${activeSession.id}`}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className="block"
        >
          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center text-xs font-bold shadow-xs min-h-[40px] bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
            leftIcon={<Radio className="w-4 h-4 animate-pulse" />}
          >
            Lanjutkan Konsol ({activeSession.joinCode})
          </Button>
        </Link>
      ) : isMobile ? (
        <Button
          variant="default"
          size="sm"
          className="w-full justify-center text-xs font-bold shadow-xs min-h-[40px]"
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          onClick={() => {
            setMobileMenuOpen(false);
            openCreateModal();
          }}
        >
          Mulai Sesi Baru
        </Button>
      ) : null}
      <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${
              activeSession ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'
            }`}
          />
          <span className="font-medium text-stone-600">
            {activeSession ? 'Sesi Aktif' : 'Standby'}
          </span>
        </span>
        <span className="font-mono text-[10px] text-stone-400">v1.0.0</span>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-stone-500 font-medium">Memuat Ruang Guru...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated guard state
  if (!isAuthenticated) {
    return <TeacherLoginView />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          brand={brandConfig}
          sections={navSections}
          renderLink={renderSidebarLink}
          footer={sidebarFooter(false)}
        />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Menu Ruang Guru"
        description="Navigasi menu utama Ruang Guru WaliKelas"
        variant="warm"
      >
        <Sidebar
          className="w-full h-full border-none static bg-card"
          brand={brandConfig}
          sections={navSections}
          renderLink={renderSidebarLink}
          footer={sidebarFooter(true)}
        />
      </MobileDrawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar
          title="Ruang Guru"
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          actions={
            <div className="flex items-center gap-2.5">
              {/* Active Classroom Selector Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors min-h-[40px] sm:min-h-[36px]"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {activeClassroom ? activeClassroom.name : 'Pilih Kelas Aktif'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {classDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-card border border-border shadow-lg py-1.5 z-40">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Konteks Kelas Aktif
                    </div>
                    {classrooms.length === 0 ? (
                      <div className="p-3 text-xs text-muted-foreground text-center">Belum ada kelas.</div>
                    ) : (
                      classrooms.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setActiveClassroom(c);
                            setClassDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-muted transition-colors min-h-[44px] ${
                            activeClassroom?.id === c.id
                              ? 'font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                              : 'text-foreground'
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          {c.grade && <span className="text-[10px] text-muted-foreground">{c.grade}</span>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <a
                href="/projector"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex"
                title="Buka portal layar proyektor kelas"
              >
                <Button variant="outline" size="sm" leftIcon={<Tv className="w-4 h-4 text-amber-600" />}>
                  Mode Proyektor
                </Button>
              </a>
              {activeSession ? (
                <Link href={`/teacher/sessions/${activeSession.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs border-transparent"
                    leftIcon={<Radio className="w-4 h-4 animate-pulse" />}
                  >
                    Konsol Sesi ({activeSession.joinCode})
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => openCreateModal()}
                >
                  Sesi Baru
                </Button>
              )}
            </div>
          }
          userMenu={
            <UserMenu
              name={profile?.displayName || user?.name || 'Guru WaliKelas'}
              email={user?.email || 'guru@sekolah.id'}
              avatarUrl={user?.avatarUrl}
              role={user?.role === 'ADMIN' ? 'Admin / Guru' : 'Guru'}
              items={[
                {
                  label: 'Katalog Perkakas',
                  href: '/teacher/tools',
                  icon: <Wrench className="w-4 h-4" />,
                },
                {
                  label: 'Mode Proyektor Layar',
                  href: '/projector',
                  icon: <Tv className="w-4 h-4" />,
                },
              ]}
              onSignOut={logout}
            />
          }
        />

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation items={flatNavItems} />
    </div>
  );
}

export default function TeacherLayout({ children }: { children?: React.ReactNode }) {
  return (
    <SessionModalProvider>
      <TeacherLayoutContent>{children}</TeacherLayoutContent>
    </SessionModalProvider>
  );
}
