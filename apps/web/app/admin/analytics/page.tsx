'use client';

import React from 'react';
import { PageHeaderSection, StatsOverview, Badge } from '@walikelas/ui';

export default function AdminAnalyticsPage(): React.JSX.Element {
  const analyticsStats = [
    {
      label: 'Total Sesi Terselesaikan',
      value: '1,482',
      change: '+18% bulan ini',
      changeType: 'positive' as const,
      description: 'Dari 142 guru aktif',
    },
    {
      label: 'Rata-rata Durasi Sesi',
      value: '34 menit',
      change: '+4 mnt',
      changeType: 'positive' as const,
      description: 'Waktu keterlibatan aktif',
    },
    {
      label: 'Pertanyaan Terjawab',
      value: '48,290',
      change: '+3,410 minggu ini',
      changeType: 'positive' as const,
      description: 'Aktivitas kuis & polling',
    },
    {
      label: 'Retensi Mingguan Guru',
      value: '76.4%',
      change: '+2.1%',
      changeType: 'positive' as const,
      description: 'Kembali dalam 7 hari',
    },
  ];

  const toolRankings = [
    { name: 'Timer Kelas', category: 'Lokal', count: 3410, share: '32%' },
    { name: 'Live Quiz', category: 'Interaktif', count: 2890, share: '27%' },
    { name: 'Random Picker', category: 'Lokal', count: 1740, share: '16%' },
    { name: 'Live Poll', category: 'Interaktif', count: 1210, share: '11%' },
    { name: 'Group Maker', category: 'Lokal', count: 860, share: '8%' },
    { name: 'Flashcards', category: 'Konten', count: 640, share: '6%' },
  ];

  return (
    <div className="space-y-8">
      <PageHeaderSection
        title="Analitik Produk & Penggunaan"
        description="Statistik komprehensif penggunaan perkakas pembelajaran untuk membantu peningkatan fitur secara terarah."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Analitik Produk', current: true },
        ]}
      />

      <StatsOverview stats={analyticsStats} columns={4} />

      {/* Tool Popularity Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Perkakas Paling Sering Digunakan</h2>
          <p className="text-xs text-slate-500">
            Berdasarkan frekuensi peluncuran perkakas di kelas selama 30 hari terakhir.
          </p>
        </div>

        <div className="space-y-4">
          {toolRankings.map((tool, idx) => (
            <div key={tool.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                  <span className="font-semibold text-slate-800">{tool.name}</span>
                  <Badge variant="neutral" size="sm">
                    {tool.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-medium">{tool.count} kali</span>
                  <span className="font-mono font-bold text-blue-600">{tool.share}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: tool.share }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
