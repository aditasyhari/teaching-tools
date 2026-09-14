import React from 'react';
import type { Metadata } from 'next';
import { ProjectorSessionView } from '@/features/session/projector-session-view';

export const metadata: Metadata = {
  title: 'Mode Proyektor (Simulasi) — WaliKelas Teaching Tools',
  description: 'Tampilan simulasi layar proyektor kelas untuk presentasi materi dan aktivitas.',
};

export default function ProjectorDemoPage(): React.JSX.Element {
  return <ProjectorSessionView joinCode="DEMO99" isDemo={true} />;
}

