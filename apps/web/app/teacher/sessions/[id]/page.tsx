import React from 'react';
import type { Metadata } from 'next';
import { TeacherSessionView } from '../../../../features/session/teacher-session-view';

interface TeacherSessionConsolePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Konsol Sesi Guru | WaliKelas Teaching Tools',
  description:
    'Kelola sesi kelas aktif, pantau murid yang bergabung, dan mulai aktivitas interaktif.',
};

export default async function TeacherSessionConsolePage({
  params,
}: TeacherSessionConsolePageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  return <TeacherSessionView sessionId={id} />;
}
