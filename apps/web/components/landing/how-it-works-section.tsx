import React from 'react';
import { Badge } from '@walikelas/ui';
import { Check } from 'lucide-react';

export function HowItWorksSection(): React.JSX.Element {
  return (
    <section id="cara-kerja" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-20 border-b border-[#e8e4dc] bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Kemudahan Implementasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2.5 tracking-tight">
            Tiga Langkah Sederhana Menghidupkan Kelas
          </h2>
          <p className="text-stone-600 mt-2 text-sm sm:text-base">
            Tidak butuh pelatihan berminggu-minggu. Siapa pun dapat langsung mempraktikkannya di kelas hari ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 01 */}
          <div className="p-7 rounded-2xl border border-[#e8e4dc] bg-white shadow-2xs hover:border-amber-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-amber-600 font-mono tracking-tight">
                  01
                </span>
                <Badge variant="neutral" size="sm" className="bg-amber-50 text-amber-900 border-amber-200 font-semibold">
                  Langkah Awal
                </Badge>
              </div>
              <h3 className="font-bold text-lg text-stone-900">Pilih Aktivitas Belajar</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Pilih apakah ingin membuka Live Quiz untuk tes pemahaman, Live Poll untuk voting opini, atau Timer &amp; Random Picker untuk mengelola ritme tugas kelompok.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center text-xs text-stone-500 font-medium">
              <Check className="w-4 h-4 text-amber-600 mr-1.5" /> Tanpa berkas rumit
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-7 rounded-2xl border border-[#e8e4dc] bg-white shadow-2xs hover:border-amber-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-stone-900 font-mono tracking-tight">
                  02
                </span>
                <Badge variant="neutral" size="sm" className="bg-stone-100 text-stone-900 border-stone-200 font-semibold">
                  Tampilan Bersama
                </Badge>
              </div>
              <h3 className="font-bold text-lg text-stone-900">Tampilkan ke Layar Kelas</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Buka tab Mode Proyektor di layar besar kelas. Tampilan otomatis menyesuaikan skala resolusi proyektor agar kode sesi dan pertanyaan terbaca tajam dari seluruh sudut ruangan.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center text-xs text-stone-500 font-medium">
              <Check className="w-4 h-4 text-stone-800 mr-1.5" /> Mode proyektor otomatis
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-7 rounded-2xl border border-[#e8e4dc] bg-white shadow-2xs hover:border-amber-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight">
                  03
                </span>
                <Badge variant="success" size="sm" className="bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold">
                  Hasil Seketika
                </Badge>
              </div>
              <h3 className="font-bold text-lg text-stone-900">Interaksi &amp; Evaluasi Realtime</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Siswa mengirim jawaban langsung dari ponsel. Guru dapat langsung membahas opsi yang paling sering salah dipilih sebelum loncat ke topik bab berikutnya.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center text-xs text-stone-500 font-medium">
              <Check className="w-4 h-4 text-emerald-600 mr-1.5" /> Umpan balik pedagogis seketika
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

