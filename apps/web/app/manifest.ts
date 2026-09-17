import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WaliKelas Teaching Tools',
    short_name: 'WaliKelas Tools',
    description:
      'Kotak perkakas praktis guru untuk membuat aktivitas kelas lebih aktif, seru, dan interaktif.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8f5',
    theme_color: '#2563eb',
    lang: 'id',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}

