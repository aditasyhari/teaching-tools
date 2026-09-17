import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Mode Proyektor Layar Kelas',
    template: '%s | Proyektor WaliKelas',
  },
  description:
    'Tampilan layar penuh khusus proyektor dan smart TV kelas. Menampilkan kode bergabung, QR code, live kuis, polling, dan timer secara jelas dan bebas distraksi.',
  alternates: {
    canonical: '/projector',
  },
};

export default function ProjectorLayout({ children }: { children?: any }) {
  return <>{children}</>;
}

