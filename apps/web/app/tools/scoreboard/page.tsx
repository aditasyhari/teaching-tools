import type { Metadata } from 'next';
import React from 'react';
import { ScoreboardView } from '../../../features/scoreboard/scoreboard-view';

export const metadata: Metadata = {
  title: 'Papan Skor Kelas & Scoreboard Kelompok',
  description:
    'Catat dan tampilkan perolehan poin tim atau kelompok murid selama kuis atau permainan kelas dengan kontrol tombol sentuh yang mudah.',
  alternates: {
    canonical: '/tools/scoreboard',
  },
};

export default function ScoreboardPage(): React.JSX.Element {
  return <ScoreboardView />;
}
