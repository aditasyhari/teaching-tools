'use client';

import React, { useState } from 'react';
import { PageHeaderSection, SearchField, Badge } from '@walikelas/ui';

interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export default function AdminAuditLogsPage(): React.JSX.Element {
  const [search, setSearch] = useState('');

  const logs: AuditLogEntry[] = [
    {
      id: 'log-1',
      action: 'AUTH_GOOGLE_LOGIN',
      actor: 'budi.santoso@sekolah.id',
      resource: 'OAuth /auth/google/callback',
      timestamp: '12 Sep 2026, 10:14:02',
      ipAddress: '182.1.24.89',
      status: 'SUCCESS',
    },
    {
      id: 'log-2',
      action: 'SESSION_CREATED',
      actor: 'budi.santoso@sekolah.id',
      resource: 'ClassroomSession (WK-892)',
      timestamp: '12 Sep 2026, 10:15:30',
      ipAddress: '182.1.24.89',
      status: 'SUCCESS',
    },
    {
      id: 'log-3',
      action: 'TEMPLATE_PUBLISHED',
      actor: 'admin@walikelas.id',
      resource: 'QuizTemplate (tpl-1)',
      timestamp: '12 Sep 2026, 09:00:11',
      ipAddress: '10.0.4.12',
      status: 'SUCCESS',
    },
    {
      id: 'log-4',
      action: 'INVALID_SESSION_CODE_JOIN',
      actor: 'Anonymous Student',
      resource: 'JoinEngine (code: INVALID)',
      timestamp: '12 Sep 2026, 08:45:22',
      ipAddress: '36.80.11.45',
      status: 'WARNING',
    },
  ];

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Log Audit Sistem"
        description="Catatan peristiwa penting keamanan, otentikasi, dan perubahan state operasional platform."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Log Audit', current: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchField
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Cari aksi, aktor, atau sumber daya..."
          />
        </div>
        <div className="text-xs text-slate-500">
          Menampilkan {filtered.length} riwayat peristiwa
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Aksi Peristiwa</th>
                <th className="px-6 py-3.5">Pelaku (Aktor)</th>
                <th className="px-6 py-3.5">Target / Sumber Daya</th>
                <th className="px-6 py-3.5">Waktu</th>
                <th className="px-6 py-3.5">Alamat IP</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-800">{log.actor}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{log.resource}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{log.timestamp}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.ipAddress}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        log.status === 'SUCCESS'
                          ? 'success'
                          : log.status === 'WARNING'
                            ? 'neutral'
                            : 'neutral'
                      }
                      size="sm"
                    >
                      {log.status}
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
