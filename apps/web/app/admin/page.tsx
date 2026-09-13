'use client';

import React from 'react';
import { Users, Radio, Activity, Layers, ArrowRight, RefreshCw } from 'lucide-react';
import { PageHeaderSection, StatsOverview, Button, Badge } from '@walikelas/ui';

export default function AdminOverviewPage(): React.JSX.Element {
  const adminStats = [
    {
      label: 'Total Guru Terdaftar',
      value: '142',
      change: '+12% minggu ini',
      changeType: 'positive' as const,
      icon: <Users className="w-4 h-4 text-blue-600" />,
      description: 'Semua login via Google OAuth',
    },
    {
      label: 'Sesi Kelas Hari Ini',
      value: '38',
      change: '+5 aktif',
      changeType: 'positive' as const,
      icon: <Radio className="w-4 h-4 text-emerald-600" />,
      description: 'Sesi interaktif berjalan',
    },
    {
      label: 'Total Peserta Siswa',
      value: '1,240',
      change: 'Hari ini',
      changeType: 'neutral' as const,
      icon: <Layers className="w-4 h-4 text-indigo-600" />,
      description: 'Partisipasi tanpa akun',
    },
    {
      label: 'Status Sistem API',
      value: '99.9%',
      change: 'Sehat',
      changeType: 'positive' as const,
      icon: <Activity className="w-4 h-4 text-emerald-600" />,
      description: 'Port 4006 /health OK',
    },
  ];

  const recentLogs = [
    {
      id: '1',
      action: 'Login Sukses Guru via Google',
      user: 'budi.santoso@sekolah.id',
      time: '5 menit lalu',
      status: 'SUCCESS',
    },
    {
      id: '2',
      action: 'Sesi Kelas Dibuat (WK-892)',
      user: 'budi.santoso@sekolah.id',
      time: '12 menit lalu',
      status: 'SUCCESS',
    },
    {
      id: '3',
      action: 'Template Kuis IPA Dipublikasi',
      user: 'admin@walikelas.id',
      time: '1 jam lalu',
      status: 'SUCCESS',
    },
    {
      id: '4',
      action: 'Health Check Polling P99',
      user: 'System Worker',
      time: '3 jam lalu',
      status: 'SUCCESS',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeaderSection
        title="Dashboard Administrator"
        description="Ringkasan metrik operasional, penggunaan perkakas, dan integritas sistem WaliKelas Teaching Tools V1."
        badge={
          <Badge variant="neutral" size="sm">
            Admin V1
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Segarkan Metrik
          </Button>
        }
      />

      {/* KPI Overview */}
      <StatsOverview stats={adminStats} columns={4} />

      {/* Grid: Fast Actions & Audit Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Modules Quick Nav */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Modul Administrasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/admin/users"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm">
                  Pengguna Guru
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500">
                Kelola 142 guru dan riwayat autentikasi Google.
              </p>
            </a>

            <a
              href="/admin/activities"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm">
                  Aktivitas &amp; Template
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500">
                Kurasi bank soal, template polling, dan konten.
              </p>
            </a>

            <a
              href="/admin/sessions"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm">
                  Monitoring Sesi
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500">Pantau ruang kelas yang aktif dan kode sesi.</p>
            </a>

            <a
              href="/admin/system-health"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm">
                  Kesehatan Sistem
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500">Pemeriksaan koneksi DB, cache, dan API.</p>
            </a>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Aktivitas Sistem Terkini</h2>
            <a
              href="/admin/audit-logs"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Semua Log
            </a>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-medium text-slate-900">{log.action}</p>
                  <p className="text-slate-500">{log.user}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="success" size="sm">
                    OK
                  </Badge>
                  <p className="text-[10px] text-slate-400 mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
