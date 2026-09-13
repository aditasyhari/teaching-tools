export interface QuickFeedbackPreset {
  id: string;
  name: string;
  description: string;
  title: string;
  question: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  options: string[];
}

export const QUICK_FEEDBACK_PRESETS: QuickFeedbackPreset[] = [
  {
    id: 'understanding-check',
    name: 'Tingkat Pemahaman',
    description: 'Cek cepat seberapa jauh siswa memahami materi yang sedang dibahas.',
    title: 'Cek Pemahaman Materi',
    question: 'Seberapa paham kamu dengan materi yang baru kita bahas?',
    type: 'SINGLE_CHOICE',
    options: ['Sangat Paham', 'Cukup Paham', 'Masih Bingung'],
  },
  {
    id: 'ready-to-continue',
    name: 'Kesiapan Lanjut',
    description: 'Tanyakan apakah kelas siap berpindah ke aktivitas atau bab berikutnya.',
    title: 'Kesiapan Lanjut Materi',
    question: 'Apakah kamu sudah siap lanjut ke materi atau latihan berikutnya?',
    type: 'SINGLE_CHOICE',
    options: ['Siap, Lanjut!', 'Bahas Lagi Sebentar'],
  },
  {
    id: 'pacing-check',
    name: 'Kecepatan Penjelasan',
    description: 'Evaluasi apakah tempo mengajar terlalu cepat atau pas bagi siswa.',
    title: 'Evaluasi Ritme Mengajar',
    question: 'Bagaimana ritme / kecepatan penjelasan materi hari ini?',
    type: 'SINGLE_CHOICE',
    options: ['Terlalu Cepat', 'Pas & Jelas', 'Terlalu Lambat'],
  },
  {
    id: 'agree-disagree',
    name: 'Setuju / Tidak Setuju',
    description: 'Jajak pendapat dua arah untuk memicu diskusi kelas.',
    title: 'Argumen Kelas',
    question: 'Apakah kamu setuju dengan pernyataan atau kesimpulan tersebut?',
    type: 'SINGLE_CHOICE',
    options: ['Setuju', 'Tidak Setuju'],
  },
];
