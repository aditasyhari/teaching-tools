import React from 'react';
import type { Metadata } from 'next';
import { ParticipantJoinView } from '../../features/session/participant-join-view';

export const metadata: Metadata = {
  title: 'Gabung Sesi Kelas | WaliKelas Teaching Tools',
  description: 'Gabung ke sesi kelas interaktif guru Anda secara langsung.',
};

export default function JoinPage(): React.JSX.Element {
  return <ParticipantJoinView />;
}
