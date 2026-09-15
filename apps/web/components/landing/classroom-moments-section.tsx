import React from 'react';
import Link from 'next/link';
import { Clock, Shuffle, HelpCircle, Users, ArrowUpRight } from 'lucide-react';

const moments = [
  {
    situation: 'Saat kelas mulai terlalu ramai & sulit fokus',
    solution: 'Pasang Timer hitung mundur besar di layar. Bel berbunyi otomatis mengembalikan ketertiban kelas tanpa guru harus bersuara keras.',
    toolName: 'Timer Kelas',
    toolRoute: '/tools/timer',
    icon: <Clock className="w-5 h-5 text-amber-600" />,
    tag: 'Fokus & Ritme',
  },
  {
    situation: 'Saat ingin memilih siswa secara adil tanpa canggung',
    solution: 'Gunakan Random Picker acak nama. Menghilangkan rasa sungkan, rasa takut salah, atau tuduhan pilih kasih saat menunjuk giliran.',
    toolName: 'Random Picker',
    toolRoute: '/tools/random-picker',
    icon: <Shuffle className="w-5 h-5 text-violet-600" />,
    tag: 'Partisipasi Adil',
  },
  {
    situation: 'Saat ingin semua siswa ikut menjawab, bukan cuma yang depan',
    solution: 'Buka Live Quiz atau Poll. Seluruh 30 siswa mengirim jawaban langsung dari ponsel dan grafik pemahaman tampil seketika di proyektor.',
    toolName: 'Live Quiz & Poll',
    toolRoute: '/tools/live-quiz',
    icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
    tag: 'Respons Seluruh Kelas',
  },
  {
    situation: 'Saat pembagian kelompok memakan waktu & memicu debat',
    solution: 'Jalankan Group Maker. Bentuk 4 hingga 8 kelompok belajar acak yang merata hanya dalam hitungan detik tanpa drama teman sebangku.',
    toolName: 'Group Maker',
    toolRoute: '/tools/group-maker',
    icon: <Users className="w-5 h-5 text-teal-600" />,
    tag: 'Kolaborasi Cepat',
  },
];

export function ClassroomMomentsSection(): React.JSX.Element {
  return (
    <section id="momen-kelas" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-b border-[#e8e4dc] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Relevansi Ruang Kelas
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Dirancang untuk momen-momen nyata di kelas.
          </h2>
          <p className="text-sm sm:text-base text-stone-600">
            Bukan teori abstrak. Setiap perkakas hadir untuk menyelesaikan friksi nyata yang dihadapi guru setiap hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {moments.map((m) => (
            <div
              key={m.situation}
              className="p-6 sm:p-7 rounded-2xl border border-[#e8e4dc] bg-[#faf8f5] shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white border border-stone-200/60 shadow-2xs">
                    {m.icon}
                  </div>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                    {m.tag}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                  &ldquo;{m.situation}&rdquo;
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {m.solution}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Solusi Perkakas:</span>
                <Link
                  href={m.toolRoute}
                  className="text-xs font-bold text-stone-900 hover:text-amber-700 transition-colors inline-flex items-center gap-1"
                >
                  <span>{m.toolName}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

