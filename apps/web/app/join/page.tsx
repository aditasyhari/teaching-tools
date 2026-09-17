import React from 'react';
import type { Metadata } from 'next';
import { ParticipantJoinView } from '../../features/session/participant-join-view';

export const metadata: Metadata = {
  title: 'Gabung Sesi Kelas Murid',
  description:
    'Masukkan 6 digit kode sesi atau pindai kode QR untuk masuk ke aktivitas kelas interaktif dari ponsel Anda.',
  alternates: {
    canonical: '/join',
  },
};

interface JoinPageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

export default async function JoinPage({
  searchParams,
}: JoinPageProps): Promise<React.JSX.Element> {
  const { code } = await searchParams;
  return <ParticipantJoinView initialCode={code || ''} />;
}
