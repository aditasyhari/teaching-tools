import type { Metadata } from 'next';
import React from 'react';
import { GroupMakerView } from '../../../features/group-maker/group-maker-view';

export const metadata: Metadata = {
  title: 'Group Maker — Pembagi Kelompok Belajar Cepat',
  description:
    'Bagi murid ke dalam kelompok diskusi secara otomatis dan seimbang berdasarkan jumlah kelompok atau jumlah anggota per kelompok.',
  alternates: {
    canonical: '/tools/group-maker',
  },
};

export default function GroupMakerPage(): React.JSX.Element {
  return <GroupMakerView />;
}
