'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeaderSection, SearchField, Badge } from '@walikelas/ui';

interface SessionMetadata {
  id: string;
  code: string;
  teacherEmail: string;
  classroomName: string;
  activeActivity: string;
  participants: number;
  startedAt: string;
  status: 'ACTIVE' | 'ENDED';
}

export default function AdminSessionsPage(): React.JSX.Element {
  const [search, setSearch] = useState('');

  const sessions: SessionMetadata[] = [
    {
      id: 'sess-01',
      code: 'WK-892',
      teacherEmail: 'budi.santoso@sekolah.id',
      classroomName: 'Kelas 7B',
      activeActivity: 'Live Quiz: Sains Dasar',
      participants: 28,
      startedAt: '15 menit yang lalu',
      status: 'ACTIVE',
    },
    {
      id: 'sess-02',
      code: 'WK-451',
      teacherEmail: 'siti.rahma@sekolah.id',
      classroomName: 'Kelas 9A',
      activeActivity: 'Live Poll: Survei Minat Proyek',
      participants: 32,
      startedAt: '35 menit yang lalu',
      status: 'ACTIVE',
    },
    {
      id: 'sess-03',
      code: 'WK-109',
      teacherEmail: 'ahmad.fauzi@guru.id',
      classroomName: 'Kelas 8C',
      activeActivity: 'Word Cloud: Refleksi Nilai Karakter',
      participants: 29,
      startedAt: '2 jam yang lalu',
      status: 'ENDED',
    },
  ];

  const filtered = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.teacherEmail.toLowerCase().includes(q) ||
      s.classroomName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Monitoring Sesi Kelas Realtime"
        description="Pantau metadata operasional sesi kelas interaktif yang sedang berlangsung di seluruh sistem."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Sesi Kelas', current: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="w-full sm:w-80">
          <SearchField
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Cari kode sesi, email, atau kelas..."
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {sessions.filter((s) => s.status === 'ACTIVE').length} sesi aktif saat ini
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-card rounded-xl border border-border p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded border border-border text-sm">
                {s.code}
              </span>
              <Badge variant={s.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                {s.status === 'ACTIVE' ? 'Aktif' : 'Selesai'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">{s.classroomName}</div>
              <div className="text-xs text-muted-foreground font-mono truncate">{s.teacherEmail}</div>
              <div className="text-xs text-muted-foreground">{s.activeActivity}</div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {s.participants} peserta
              </span>
              <span>{s.startedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Kode Sesi</th>
                <th className="px-6 py-3.5">Email Guru</th>
                <th className="px-6 py-3.5">Ruang Kelas</th>
                <th className="px-6 py-3.5">Aktivitas Berjalan</th>
                <th className="px-6 py-3.5">Peserta</th>
                <th className="px-6 py-3.5">Waktu Mulai</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-foreground">
                    <span className="bg-muted px-2 py-1 rounded border border-border">
                      {s.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{s.teacherEmail}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{s.classroomName}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{s.activeActivity}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      {s.participants}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{s.startedAt}</td>
                  <td className="px-6 py-4">
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {s.status === 'ACTIVE' ? 'Aktif' : 'Selesai'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
