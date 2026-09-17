import type { Metadata } from 'next';
import React from 'react';
import { TimerView } from '../../../features/timer/timer-view';

export const metadata: Metadata = {
  title: 'Timer Kelas & Stopwatch Interaktif',
  description:
    'Hitung mundur waktu aktivitas kelas, kuis, atau ujian dengan tampilan angka besar yang ramah layar proyektor dan alarm suara.',
  alternates: {
    canonical: '/tools/timer',
  },
};

export default function TimerPage(): React.JSX.Element {
  return <TimerView />;
}
