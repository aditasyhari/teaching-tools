import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WaliKelas Teaching Tools — Pembelajaran Interaktif',
  description:
    'Kotak perkakas praktis guru untuk membuat aktivitas kelas lebih aktif dan interaktif.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
