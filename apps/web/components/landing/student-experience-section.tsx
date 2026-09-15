import React from 'react';
import { Smartphone, Laptop, Tv, Check } from 'lucide-react';

export function StudentExperienceSection(): React.JSX.Element {
  return (
    <section className="py-16 sm:py-24 border-b border-[#e8e4dc] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Aksesibilitas Tanpa Friksi
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Nol instalasi. Ringan untuk seluruh siswa.
          </h2>
          <p className="text-sm sm:text-base text-stone-600">
            Guru memegang kendali di laptop, materi tayang di proyektor, dan siswa langsung berpartisipasi dari peramban ponsel.
          </p>
        </div>

        {/* 3 Steps Device Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Device 1: Guru */}
          <div className="p-6 rounded-2xl border border-[#e8e4dc] bg-[#faf8f5] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-stone-900">1. Meja Guru (Kendali)</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Guru memilih kuis, mengatur timer, atau mengacak giliran dari laptop. Kunci jawaban dan catatan tetap privat.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-200/60 flex items-center text-xs font-semibold text-stone-700">
              <Check className="w-4 h-4 text-amber-600 mr-1.5 shrink-0" /> Kendali penuh di tangan guru
            </div>
          </div>

          {/* Device 2: Proyektor */}
          <div className="p-6 rounded-2xl border border-amber-300 bg-white shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <Tv className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-stone-900">2. Layar Proyektor (Fokus Bersama)</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Menayangkan kode sesi kelas, pertanyaan kuis, hitungan timer, atau papan skor dengan font besar yang terbaca hingga sudut belakang.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-200/60 flex items-center text-xs font-semibold text-amber-800">
              <Check className="w-4 h-4 text-amber-600 mr-1.5 shrink-0" /> Kontras tinggi &amp; layar penuh
            </div>
          </div>

          {/* Device 3: Siswa */}
          <div className="p-6 rounded-2xl border border-[#e8e4dc] bg-[#faf8f5] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-stone-900">3. Ponsel Siswa (Respon)</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Siswa membuka browser apa pun, mengetik kode 6 huruf, dan langsung menjawab. Tanpa registrasi, tanpa login, dan hemat kuota internet.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-200/60 flex items-center text-xs font-semibold text-emerald-700">
              <Check className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" /> 100% tanpa registrasi akun
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
