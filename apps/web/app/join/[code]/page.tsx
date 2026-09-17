import React from 'react';
import type { Metadata } from 'next';
import { ParticipantJoinView } from '../../../features/session/participant-join-view';

interface JoinWithCodePageProps {
  params: Promise<{
    code: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Masuk Sesi Kelas',
  description: 'Konfirmasi nama tampilan Anda untuk bergabung ke aktivitas kelas guru.',
};

export default async function JoinWithCodePage({
  params,
}: JoinWithCodePageProps): Promise<React.JSX.Element> {
  const { code } = await params;
  return <ParticipantJoinView initialCode={code} />;
}
