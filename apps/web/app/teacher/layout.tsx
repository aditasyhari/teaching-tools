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
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { Sidebar, Topbar, MobileNavigation, UserMenu, Button, Spinner } from '@walikelas/ui';
import { useAuth } from '../../lib/auth-context';

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
    loginWithGoogle,
    devLogin,
    logout,
  } = useAuth();

  const navItems = [
    {
      label: 'Beranda',
      href: '/teacher',
      icon: <LayoutDashboard className="w-4 h-4" />,
      active: pathname === '/teacher',
    },
    {
      label: 'Perkakas Mengajar',
      href: '/teacher/tools',
      icon: <Wrench className="w-4 h-4" />,
      active: pathname.startsWith('/teacher/tools'),
      badge: '13',
    },
    {
      label: 'Sesi Kelas',
      href: '/teacher/sessions',
      icon: <Radio className="w-4 h-4" />,
      active: pathname.startsWith('/teacher/sessions'),
    },
    {
      label: 'Aktivitas Tersimpan',
      href: '/teacher/activities',
      icon: <FolderKanban className="w-4 h-4" />,
      active: pathname.startsWith('/teacher/activities'),
    },
    {
      label: 'Catatan Guru',
      href: '/teacher/notes',
      icon: <FileText className="w-4 h-4" />,
      active: pathname.startsWith('/teacher/notes'),
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500 font-medium">Memuat Ruang Guru...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated guard state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold text-2xl border border-blue-100">
            WK
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Masuk ke Ruang Guru</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Silakan masuk dengan akun Google untuk mengelola sesi kelas, kuis interaktif, dan
              perkakas mengajar.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              leftIcon={<ShieldCheck className="w-5 h-5 text-white" />}
              onClick={loginWithGoogle}
            >
              Masuk dengan Akun Google
            </Button>

            {process.env.NODE_ENV !== 'production' && (
              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs text-slate-600"
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  onClick={() => devLogin('TEACHER')}
                >
                  Masuk Cepat Guru (Mode Development)
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            WaliKelas Teaching Tools V1 &bull; Google OAuth/OIDC Resmi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
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
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {activeClassroom ? activeClassroom.name : 'Pilih Kelas Aktif'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {classDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-40">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Konteks Kelas Aktif
                    </div>
                    {classrooms.length === 0 ? (
                      <div className="p-3 text-xs text-slate-500 text-center">Belum ada kelas.</div>
                    ) : (
                      classrooms.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setActiveClassroom(c);
                            setClassDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            activeClassroom?.id === c.id
                              ? 'font-bold text-blue-600 bg-blue-50/50'
                              : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          {c.grade && <span className="text-[10px] text-slate-400">{c.grade}</span>}
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation items={navItems} />
    </div>
  );
}
