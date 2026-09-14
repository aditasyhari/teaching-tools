import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

export const metadata: Metadata = {
  title: 'WaliKelas Teaching Tools — Pembelajaran Interaktif',
  description:
    'Kotak perkakas praktis guru untuk membuat aktivitas kelas lebih aktif dan interaktif.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-amber-100 selection:text-amber-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
