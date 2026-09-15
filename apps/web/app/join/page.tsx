import React from 'react';
import type { Metadata } from 'next';
import { ParticipantJoinView } from '../../features/session/participant-join-view';

export const metadata: Metadata = {
  title: 'Gabung Sesi Kelas | WaliKelas Teaching Tools',
  description: 'Gabung ke sesi kelas interaktif guru Anda secara langsung.',
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
