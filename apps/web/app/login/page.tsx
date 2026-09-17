import type { Metadata } from 'next';
import React from 'react';
import { LoginPageClient } from './login-client';

export const metadata: Metadata = {
  title: 'Masuk Ruang Guru',
  description:
    'Masuk ke Ruang Guru WaliKelas menggunakan Akun Google untuk mengelola kuis, polling, kelas, dan sesi interaktif Anda.',
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage(): React.JSX.Element {
  return <LoginPageClient />;
}
