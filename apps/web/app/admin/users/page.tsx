'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PageHeaderSection, SearchField, Badge } from '@walikelas/ui';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'ADMIN';
  provider: 'GOOGLE';
  joinedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function AdminUsersPage(): React.JSX.Element {
  const [search, setSearch] = useState('');

  const users: UserRecord[] = [
    {
      id: 'usr-1',
      name: 'Budi Santoso, S.Pd.',
      email: 'budi.santoso@sekolah.id',
      role: 'TEACHER',
      provider: 'GOOGLE',
      joinedAt: '01 Sep 2026',
      status: 'ACTIVE',
    },
    {
      id: 'usr-2',
      name: 'Siti Rahmawati, M.Pd.',
      email: 'siti.rahma@sekolah.id',
      role: 'TEACHER',
      provider: 'GOOGLE',
      joinedAt: '03 Sep 2026',
      status: 'ACTIVE',
    },
    {
      id: 'usr-3',
      name: 'Ahmad Fauzi, S.Si.',
      email: 'ahmad.fauzi@guru.id',
      role: 'TEACHER',
      provider: 'GOOGLE',
      joinedAt: '05 Sep 2026',
      status: 'ACTIVE',
    },
    {
      id: 'usr-4',
      name: 'Super Admin WaliKelas',
      email: 'admin@walikelas.id',
      role: 'ADMIN',
      provider: 'GOOGLE',
      joinedAt: '20 Aug 2026',
      status: 'ACTIVE',
    },
  ];

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Daftar Pengguna Guru & Admin"
        description="Kelola akun guru terautentikasi melalui Google OAuth/OIDC. Sesuai arsitektur V1, sistem tidak menggunakan registrasi password lokal."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Pengguna', current: true },
        ]}
      />

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchField
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Cari nama atau email guru..."
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>
            Menampilkan {filtered.length} dari {users.length} pengguna
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama Guru</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Autentikasi</th>
                <th className="px-6 py-3.5">Peran</th>
                <th className="px-6 py-3.5">Terdaftar</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Google OIDC
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'ADMIN' ? 'default' : 'neutral'} size="sm">
                      {u.role === 'ADMIN' ? 'Administrator' : 'Guru'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{u.joinedAt}</td>
                  <td className="px-6 py-4">
                    <Badge variant="success" size="sm">
                      Aktif
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
