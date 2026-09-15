'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Radio,
  LineChart,
  Activity,
  ShieldAlert,
  Shield,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { Sidebar, Topbar, MobileNavigation, MobileDrawer, UserMenu, Badge, Button, Spinner } from '@walikelas/ui';
import { useAuth } from '../../lib/auth-context';
import { GoogleIcon } from '@/components/auth/teacher-login-view';

export default function AdminLayout({ children }: { children?: any }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, isLoading, isAuthenticated, loginWithGoogle, logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />,
      active: pathname === '/admin',
    },
    {
      label: 'Pengguna Guru',
      href: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      active: pathname.startsWith('/admin/users'),
    },
    {
      label: 'Aktivitas & Template',
      href: '/admin/activities',
      icon: <FolderKanban className="w-4 h-4" />,
      active: pathname.startsWith('/admin/activities'),
    },
    {
      label: 'Sesi Kelas',
      href: '/admin/sessions',
      icon: <Radio className="w-4 h-4" />,
      active: pathname.startsWith('/admin/sessions'),
    },
    {
      label: 'Analitik Produk',
      href: '/admin/analytics',
      icon: <LineChart className="w-4 h-4" />,
      active: pathname.startsWith('/admin/analytics'),
    },
    {
      label: 'Kesehatan Sistem',
      href: '/admin/system-health',
      icon: <Activity className="w-4 h-4" />,
      active: pathname.startsWith('/admin/system-health'),
      badge: 'Live',
    },
    {
      label: 'Log Audit',
      href: '/admin/audit-logs',
      icon: <ShieldAlert className="w-4 h-4" />,
      active: pathname.startsWith('/admin/audit-logs'),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500 font-medium">Memuat Admin Console...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-white">
        <div className="max-w-md w-full bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mx-auto border border-red-500/30">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Admin Console</h1>
            <p className="text-sm text-slate-400">
              Otentikasi Administrator diperlukan untuk mengakses halaman ini.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl border border-slate-700 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all duration-150 shadow-sm cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Masuk dengan Google (Admin)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Role check: Only ADMIN role allowed
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Akses Terbatas (403)</h2>
            <p className="text-sm text-slate-600">
              Akun Anda ({user?.email}) memiliki peran <strong>{user?.role}</strong> dan tidak
              diizinkan mengakses Admin Console.
            </p>
          </div>
          <a href="/teacher">
            <Button variant="primary" size="md" className="w-full">
              Kembali ke Ruang Guru
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          className="bg-slate-950 border-slate-900"
          brand={{
            name: 'WaliKelas Admin',
            subtitle: 'Teaching Tools Platform',
            href: '/admin',
            logo: (
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
            ),
          }}
          items={navItems}
          footer={
            <div className="space-y-2">
              <a
                href="/"
                className="flex items-center justify-between text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded transition-colors"
              >
                <span>Lihat Web Publik</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Server API</span>
                  <span className="text-emerald-400 font-mono font-bold">:4006</span>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* Admin Mobile Navigation Drawer */}
      <MobileDrawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title="Menu Admin Console"
        description="Navigasi admin console WaliKelas"
      >
        <Sidebar
          className="w-full h-full border-none static bg-slate-950"
          brand={{
            name: 'WaliKelas Admin',
            subtitle: 'Teaching Tools Platform',
            href: '/admin',
            logo: (
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
            ),
          }}
          items={navItems}
          footer={
            <div className="space-y-2">
              <a
                href="/"
                className="flex items-center justify-between text-xs text-slate-400 hover:text-white px-2 py-2 rounded transition-colors min-h-[44px]"
              >
                <span>Lihat Web Publik</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Server API</span>
                  <span className="text-emerald-400 font-mono font-bold">:4006</span>
                </div>
              </div>
            </div>
          }
        />
      </MobileDrawer>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar
          title="Admin Console"
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm" className="hidden sm:inline-flex">
                Role: {user?.role}
              </Badge>
              <Badge variant="success" size="sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                API Connected
              </Badge>
            </div>
          }
          userMenu={
            <UserMenu
              name={user?.name || 'Administrator'}
              email={user?.email || 'admin@walikelas.id'}
              role="Super Admin"
              avatarUrl={user?.avatarUrl}
              items={[
                {
                  label: 'Kesehatan Sistem',
                  href: '/admin/system-health',
                  icon: <Activity className="w-4 h-4" />,
                },
                {
                  label: 'Log Audit Sistem',
                  href: '/admin/audit-logs',
                  icon: <ShieldAlert className="w-4 h-4" />,
                },
              ]}
              onSignOut={logout}
            />
          }
        />

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation items={navItems.slice(0, 5)} />
    </div>
  );
}
