'use client';

import React, { useState } from 'react';
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
import { useAuth } from '../../lib/auth-context';
import { TeacherLoginView } from '@/components/auth/teacher-login-view';

export default function TeacherLayout({ children }: { children?: any }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

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

  const navItems = [
    {
      label: 'Dasbor',
      href: '/teacher',
      icon: <LayoutDashboard className="w-5 h-5" />,
      active: pathname === '/teacher',
      badge: undefined,
    },
    {
      label: 'Perkakas Mengajar',
      href: '/teacher/tools',
      icon: <Wrench className="w-5 h-5" />,
      active: pathname.startsWith('/teacher/tools'),
      badge: '13',
    },
    {
      label: 'Sesi Aktif',
      href: '/teacher/sessions',
      icon: <Radio className="w-5 h-5" />,
      active: pathname.startsWith('/teacher/sessions'),
      badge: undefined,
    },
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
      badge: undefined,
    },
  ];

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
          brand={{
            name: 'WaliKelas',
            subtitle: 'Ruang Guru Console',
            href: '/teacher',
            logo: (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                WK
              </div>
            ),
          }}
          items={navItems}
          footer={
            <div className="space-y-2">
              <a href="/teacher/sessions">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Mulai Sesi Baru
                </Button>
              </a>
              <p className="text-[10px] text-slate-500 text-center">WaliKelas Teaching Tools V1</p>
            </div>
          }
        />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Menu Ruang Guru"
        description="Navigasi menu utama Ruang Guru WaliKelas"
      >
        <Sidebar
          className="w-full h-full border-none static bg-slate-900"
          brand={{
            name: 'WaliKelas',
            subtitle: 'Ruang Guru Console',
            href: '/teacher',
            logo: (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                WK
              </div>
            ),
          }}
          items={navItems}
          footer={
            <div className="space-y-2">
              <a href="/teacher/sessions" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold min-h-[44px]"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Mulai Sesi Baru
                </Button>
              </a>
              <p className="text-[10px] text-slate-500 text-center">WaliKelas Teaching Tools V1</p>
            </div>
          }
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
              <div className="relative">
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
                href="/projector/demo"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex"
              >
                <Button variant="outline" size="sm" leftIcon={<Tv className="w-4 h-4" />}>
                  Mode Proyektor
                </Button>
              </a>
              <a href="/teacher/sessions">
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Sesi Baru
                </Button>
              </a>
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
                  href: '/projector/demo',
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
      <MobileNavigation items={navItems} />
    </div>
  );
}
