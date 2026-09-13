'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeaderSection, SearchField, Button, Badge } from '@walikelas/ui';

interface AdminTemplate {
  id: string;
  title: string;
  category: 'Kuis' | 'Polling' | 'Ice Breaking' | 'Refleksi';
  itemsCount: number;
  author: string;
  isOfficial: boolean;
}

export default function AdminActivitiesPage(): React.JSX.Element {
  const [search, setSearch] = useState('');

  const templates: AdminTemplate[] = [
    {
      id: 'tpl-1',
      title: 'Template Kuis: Cerdas Cermat Sains Dasar',
      category: 'Kuis',
      itemsCount: 15,
      author: 'WaliKelas Curriculum Team',
      isOfficial: true,
    },
    {
      id: 'tpl-2',
      title: 'Polling Cepat: Survei Gaya Belajar Visual vs Auditori',
      category: 'Polling',
      itemsCount: 5,
      author: 'WaliKelas Curriculum Team',
      isOfficial: true,
    },
    {
      id: 'tpl-3',
      title: 'Ice Breaking: Tebak Gambar & Kata Pembuka Kelas',
      category: 'Ice Breaking',
      itemsCount: 8,
      author: 'WaliKelas Curriculum Team',
      isOfficial: true,
    },
    {
      id: 'tpl-4',
      title: 'Exit Ticket: 3 Hal Baru, 2 Pertanyaan, 1 Opini (3-2-1)',
      category: 'Refleksi',
      itemsCount: 3,
      author: 'WaliKelas Curriculum Team',
      isOfficial: true,
    },
  ];

  const filtered = templates.filter((t) => {
    if (!search) return true;
    return (
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Aktivitas & Template Resmi"
        description="Kelola template aktivitas kelas bawaan yang dapat langsung diduplikasi dan digunakan oleh guru."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Aktivitas & Template', current: true },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => alert('Fitur penambahan template resmi admin.')}
          >
            Tambah Template Resmi
          </Button>
        }
      />

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchField
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Cari template resmi..."
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="default" size="sm">
                    {tpl.category}
                  </Badge>
                  {tpl.isOfficial && (
                    <Badge variant="success" size="sm">
                      Resmi WaliKelas
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{tpl.title}</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600 shrink-0">
                {tpl.itemsCount} Soal/Item
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Kurator: {tpl.author}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => alert(`Kelola template: ${tpl.title}`)}
                >
                  Kelola
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
