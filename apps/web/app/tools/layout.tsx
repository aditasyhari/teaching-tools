import type { Metadata } from 'next';
import React from 'react';
import { ToolsLayoutClient } from './tools-layout-client';

export const metadata: Metadata = {
  title: {
    default: 'Katalog Perkakas Mengajar Interaktif',
    template: '%s | WaliKelas Tools',
  },
  description:
    '13 perkakas mengajar praktis guru Indonesia: Timer Kelas, Random Picker, Group Maker, Scoreboard, Live Quiz, Live Poll, Papan Curah Pendapat, dan Mode Proyektor.',
  alternates: {
    canonical: '/tools',
  },
  openGraph: {
    title: 'Katalog Perkakas Mengajar Interaktif | WaliKelas',
    description:
      'Pilih dari 13 perkakas kelas praktis untuk menghidupkan suasana pembelajaran di ruang kelas.',
    url: 'https://tools.walikelas.id/tools',
  },
};

export default function ToolsLayout({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return <ToolsLayoutClient>{children}</ToolsLayoutClient>;
}
