import React from 'react';
import type { Metadata } from 'next';
import { ProjectorSessionView } from '@/features/session/projector-session-view';

interface ProjectorCodePageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata({ params }: ProjectorCodePageProps): Promise<Metadata> {
  const { code } = await params;
  const upper = (code || '').toUpperCase();
  return {
    title: `Mode Proyektor: ${upper} — WaliKelas Teaching Tools`,
    description: `Tampilan layar proyektor kelas untuk sesi ${upper}.`,
  };
}

export default async function ProjectorCodePage({
  params,
}: ProjectorCodePageProps): Promise<React.JSX.Element> {
  const { code } = await params;
  const upper = (code || '').toUpperCase();
  return <ProjectorSessionView joinCode={upper} isDemo={false} />;
}

