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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchField
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Cari kode sesi, email, atau kelas..."
          />
        </div>
        <div className="text-xs text-slate-500">
          {sessions.filter((s) => s.status === 'ACTIVE').length} sesi aktif saat ini
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {s.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600">{s.teacherEmail}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{s.classroomName}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{s.activeActivity}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {s.participants}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{s.startedAt}</td>
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
