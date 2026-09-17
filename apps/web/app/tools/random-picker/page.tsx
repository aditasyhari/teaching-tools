import type { Metadata } from 'next';
import React from 'react';
import { RandomPickerView } from '../../../features/random-picker/random-picker-view';

export const metadata: Metadata = {
  title: 'Random Picker — Pengacak Nama Siswa Adil',
  description:
    'Pilih nama murid atau giliran presentasi secara acak dan adil dengan animasi putar seru, efek konfeti, dan mode tanpa pengulangan.',
  alternates: {
    canonical: '/tools/random-picker',
  },
};

export default function RandomPickerPage(): React.JSX.Element {
  return <RandomPickerView />;
}
