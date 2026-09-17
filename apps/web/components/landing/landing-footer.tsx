import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../common/brand-logo';

export function LandingFooter(): React.JSX.Element {
  return (
    <footer className="bg-white border-t border-[#e8e4dc] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-block focus:outline-none">
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
              Platform perkakas pengajaran kelas interaktif independen. Memudahkan guru menghidupkan suasana kelas dengan Live Quiz, Live Poll, Timer, dan Random Picker tanpa beban teknis.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Autentikasi aman melalui Google OAuth resmi</span>
            </div>
          </div>

          {/* Quick links: Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Perkakas Kelas
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-600">
              <li>
                <Link href="/tools/live-quiz" className="hover:text-amber-700 transition-colors">
                  Live Quiz
                </Link>
              </li>
              <li>
                <Link href="/tools/live-poll" className="hover:text-amber-700 transition-colors">
                  Live Poll
                </Link>
              </li>
              <li>
                <Link href="/tools/timer" className="hover:text-amber-700 transition-colors">
                  Timer Kelas
                </Link>
              </li>
              <li>
                <Link href="/tools/random-picker" className="hover:text-amber-700 transition-colors">
                  Random Picker
                </Link>
              </li>
              <li>
                <Link href="/tools/scoreboard" className="hover:text-amber-700 transition-colors">
                  Scoreboard
                </Link>
              </li>
              <li>
                <Link href="/tools/notes" className="hover:text-amber-700 transition-colors">
                  Teacher Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Akses Cepat
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-600">
              <li>
                <Link href="/tools" className="hover:text-amber-700 transition-colors">
                  Katalog Perkakas
                </Link>
              </li>
              <li>
                <Link href="/projector" className="hover:text-amber-700 transition-colors">
                  Mode Layar Proyektor
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-amber-700 transition-colors">
                  Masuk Sesi Kelas (Siswa)
                </Link>
              </li>
              <li>
                <Link href="/teacher" className="hover:text-amber-700 transition-colors">
                  Ruang Kerja Guru
                </Link>
              </li>
              <li>
                <a href="#perkakas" className="hover:text-amber-700 transition-colors">
                  Kembali ke Atas ↑
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#e8e4dc] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} WaliKelas Teaching Tools. Hak cipta dilindungi undang-undang.</p>
          <p className="text-[11px] text-stone-500">
            Dirancang dengan dedikasi untuk para guru dan pendidik di Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
