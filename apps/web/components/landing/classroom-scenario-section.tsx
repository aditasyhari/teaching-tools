import React from 'react';
import { Shuffle, Clock, HelpCircle } from 'lucide-react';

const scenarios = [
  {
    phase: 'Fase 01 — Pembuka',
    timing: 'Sebelum Aktivitas',
    teacherQuote: '“Siapa yang mulai duluan untuk giliran presentasi hari ini?”',
    toolName: 'Random Picker',
    icon: <Shuffle className="w-4 h-4 text-violet-600" />,
    outcome: 'Nama murid terpilih di layar dalam 3 detik secara adil dan transparan.',
  },
  {
    phase: 'Fase 02 — Inti Kelas',
    timing: 'Saat Aktivitas',
    teacherQuote: '“Waktu diskusi kelompok 10 menit. Perhatikan timer di layar ya!”',
    toolName: 'Timer Kelas',
    icon: <Clock className="w-4 h-4 text-amber-600" />,
    outcome: 'Siswa mandiri mengelola ritme kerja, ditutup dengan bunyi bel tepat waktu.',
  },
  {
    phase: 'Fase 03 — Penutup',
    timing: 'Saat Evaluasi',
    teacherQuote: '“Mari kita uji pemahaman konsep tadi lewat 3 soal cepat di proyektor.”',
    toolName: 'Live Quiz & Poll',
    icon: <HelpCircle className="w-4 h-4 text-blue-600" />,
    outcome: 'Guru langsung tahu materi mana yang sudah dikuasai atau masih perlu dibahas ulang.',
  },
];

export function ClassroomScenarioSection(): React.JSX.Element {
  return (
    <section className="py-16 sm:py-24 border-b border-[#e8e4dc] bg-[#f4eee2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-3 py-1 rounded-full uppercase tracking-wider">
            Alur Mengajar Alami
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Menyatu tanpa mengubah cara mengajar Anda.
          </h2>
          <p className="text-sm sm:text-base text-stone-600">
            Filosofi kami sederhana: <strong>Buka. Pilih. Mengajar.</strong> Tidak ada pelatihan rumit atau keharusan mengubah RPP Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((sc) => (
            <div
              key={sc.phase}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#e8e4dc] shadow-2xs flex flex-col justify-between space-y-5 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                    {sc.phase}
                  </span>
                  <span className="text-xs font-semibold text-stone-400">
                    {sc.timing}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-stone-100 font-medium italic text-stone-800 text-xs sm:text-sm leading-relaxed">
                  {sc.teacherQuote}
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                  {sc.outcome}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Perkakas dipakai:</span>
                <div className="inline-flex items-center gap-1.5 font-bold text-stone-900">
                  <div className="p-1 rounded bg-stone-100">{sc.icon}</div>
                  <span>{sc.toolName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
