import type { Metadata } from 'next';
import React from 'react';
import { TeacherNotesView } from '../../../features/teacher-notes/teacher-notes-view';

export const metadata: Metadata = {
  title: 'Catatan Guru Cepat & Pengingat Pembelajaran',
  description:
    'Simpan ide pengajaran, observasi murid, dan pengingat kelas dengan mudah langsung dari browser tanpa kehilangan fokus saat mengajar.',
  alternates: {
    canonical: '/tools/notes',
  },
};

export default function NotesToolPage(): React.JSX.Element {
  return <TeacherNotesView />;
}
