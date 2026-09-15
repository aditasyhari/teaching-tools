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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="w-full sm:w-80">
          <SearchField
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Cari nama atau email guru..."
          />
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>
            Menampilkan {filtered.length} dari {users.length} pengguna
          </span>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="bg-card rounded-xl border border-border p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                {u.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-sm truncate">{u.name}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">{u.email}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={u.role === 'ADMIN' ? 'default' : 'neutral'} size="sm">
                {u.role === 'ADMIN' ? 'Administrator' : 'Guru'}
              </Badge>
              <Badge variant="success" size="sm">
                Aktif
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Google OIDC
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Terdaftar: {u.joinedAt}</div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama Guru</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Autentikasi</th>
                <th className="px-6 py-3.5">Peran</th>
                <th className="px-6 py-3.5">Terdaftar</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Google OIDC
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'ADMIN' ? 'default' : 'neutral'} size="sm">
                      {u.role === 'ADMIN' ? 'Administrator' : 'Guru'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{u.joinedAt}</td>
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
