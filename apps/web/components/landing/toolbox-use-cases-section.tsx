import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Shuffle,
  Users,
  Trophy,
  HelpCircle,
  BarChart2,
  Hand,
  MessageSquare,
  Lightbulb,
  Cloud,
  CheckCircle2,
  FileText,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@walikelas/ui';

interface ToolItem {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  route: string;
}

const categories: { title: string; subtitle: string; tools: ToolItem[] }[] = [
  {
    title: 'Manajemen Kelas',
    subtitle: 'Menjaga ritme, fokus, dan keteraturan aktivitas harian.',
    tools: [
      {
        id: 'timer',
        name: 'Timer & Stopwatch',
        desc: 'Hitung mundur waktu diskusi atau pengerjaan tugas dengan bel alarm.',
        icon: <Clock className="w-4 h-4 text-amber-600" />,
        route: '/tools/timer',
      },
      {
        id: 'random-picker',
        name: 'Random Picker',
        desc: 'Pilih siswa secara acak untuk menjawab atau giliran presentasi.',
        icon: <Shuffle className="w-4 h-4 text-violet-600" />,
        route: '/tools/random-picker',
      },
      {
        id: 'group-maker',
        name: 'Group Maker',
        desc: 'Bagi murid ke dalam kelompok acak yang seimbang dalam hitungan detik.',
        icon: <Users className="w-4 h-4 text-teal-600" />,
        route: '/tools/group-maker',
      },
      {
        id: 'scoreboard',
        name: 'Scoreboard',
        desc: 'Papan skor gamifikasi cerdas cermat atau poin tugas kelompok.',
        icon: <Trophy className="w-4 h-4 text-amber-600" />,
        route: '/tools/scoreboard',
      },
    ],
  },
  {
    title: 'Partisipasi & Respon',
    subtitle: 'Mengajak seluruh siswa aktif merespons tanpa rasa cemas.',
    tools: [
      {
        id: 'live-quiz',
        name: 'Live Quiz',
        desc: 'Kuis interaktif pilihan ganda di proyektor dengan jawaban dari ponsel.',
        icon: <HelpCircle className="w-4 h-4 text-blue-600" />,
        route: '/tools/live-quiz',
      },
      {
        id: 'live-poll',
        name: 'Live Poll',
        desc: 'Polling opini atau survei cepat untuk mengecek pemahaman kelas.',
        icon: <BarChart2 className="w-4 h-4 text-emerald-600" />,
        route: '/tools/live-poll',
      },
      {
        id: 'raise-hand',
        name: 'Raise Hand',
        desc: 'Antrean tunjuk tangan digital teratur agar tidak berebut bicara.',
        icon: <Hand className="w-4 h-4 text-indigo-600" />,
        route: '/tools/raise-hand',
      },
    ],
  },
  {
    title: 'Diskusi & Refleksi',
    subtitle: 'Mewadahi ide, pertanyaan terbuka, dan umpan balik akhir bab.',
    tools: [
      {
        id: 'question-box',
        name: 'Question Box',
        desc: 'Kotak pertanyaan siswa anonim atau bernama untuk dibahas bersama guru.',
        icon: <MessageSquare className="w-4 h-4 text-sky-600" />,
        route: '/tools/question-box',
      },
      {
        id: 'brainstorm-board',
        name: 'Brainstorm Board',
        desc: 'Papan sticky note digital untuk mengumpulkan ide dan curah pendapat.',
        icon: <Lightbulb className="w-4 h-4 text-amber-600" />,
        route: '/tools/brainstorm-board',
      },
      {
        id: 'word-cloud',
        name: 'Word Cloud',
        desc: 'Awan kata otomatis dari kata kunci yang dikirimkan seluruh siswa.',
        icon: <Cloud className="w-4 h-4 text-cyan-600" />,
        route: '/tools/word-cloud',
      },
      {
        id: 'exit-ticket',
        name: 'Exit Ticket',
        desc: 'Tiket keluar kelas untuk mengecek pemahaman dan refleksi sebelum bel pulang.',
        icon: <CheckCircle2 className="w-4 h-4 text-rose-600" />,
        route: '/tools/exit-ticket',
      },
    ],
  },
  {
    title: 'Materi & Catatan',
    subtitle: 'Menyimpan alur pembelajaran dan memperkuat ingatan konsep.',
    tools: [
      {
        id: 'teacher-notes',
        name: 'Teacher Notes',
        desc: 'Catatan cepat agenda mengajar pribadi guru yang tersimpan rapi di browser.',
        icon: <FileText className="w-4 h-4 text-stone-600" />,
        route: '/tools/notes',
      },
      {
        id: 'flashcards',
        name: 'Flashcards',
        desc: 'Kartu kilas bolak-balik untuk menghafal istilah dan rumus penting.',
        icon: <Layers className="w-4 h-4 text-emerald-600" />,
        route: '/tools/flashcards',
      },
    ],
  },
];

export function ToolboxUseCasesSection(): React.JSX.Element {
  return (
    <section id="perkakas" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-b border-[#e8e4dc] bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Kotak Perkakas Digital
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Semua perkakas yang Anda butuhkan di kelas.
          </h2>
          <p className="text-sm sm:text-base text-stone-600">
            Dikelompokkan berdasarkan kebutuhan nyata saat proses belajar mengajar berlangsung.
          </p>
        </div>

        {/* 4 Grouped Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-white border border-[#e8e4dc] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-stone-900 tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-xs text-stone-500">{cat.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.route}
                    className="p-3 rounded-xl border border-stone-100 bg-[#faf8f5] hover:bg-stone-100/80 hover:border-[#e8e4dc] transition-all group flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-white border border-stone-200/60 shadow-2xs shrink-0">
                        {tool.icon}
                      </div>
                      <span className="font-bold text-xs text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                        {tool.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug line-clamp-2">
                      {tool.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Explore Catalogue CTA Banner */}
        <div className="p-6 rounded-2xl bg-white border border-[#e8e4dc] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-base font-bold text-stone-900">
              Ingin melihat spesifikasi dan panduan seluruh perkakas?
            </h4>
            <p className="text-xs sm:text-sm text-stone-600">
              Eksplorasi seluruh 13 perkakas pengajaran digital WaliKelas dengan fitur lengkapnya.
            </p>
          </div>
          <Link href="/tools" className="shrink-0">
            <Button
              variant="outline"
              size="md"
              className="border-stone-300 hover:bg-stone-100 text-stone-900 font-bold whitespace-nowrap shadow-2xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lihat Semua di Katalog
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

