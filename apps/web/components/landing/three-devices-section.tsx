import React from 'react';
import { Laptop, Tv, Smartphone, Check } from 'lucide-react';

export function ThreeDevicesSection(): React.JSX.Element {
  return (
    <section id="untuk-guru" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-20 border-b border-[#e8e4dc] bg-[#f4eee2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-3 py-1 rounded-full uppercase tracking-wider">
            Dukungan Praktis Guru
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2.5 tracking-tight">
            Harmoni Tiga Titik Temu di Kelas Nyata
          </h2>
          <p className="text-stone-600 mt-2 text-sm sm:text-base">
            Menyatukan apa yang ada di meja guru, layar besar kelas, dan tangan siswa tanpa friksi teknis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Screen 1: Laptop Guru */}
          <div className="bg-white rounded-2xl p-6 border border-[#e8e4dc] shadow-2xs flex flex-col justify-between hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800 font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded-full">
                  Meja Guru
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900">1. Kendali Penuh di Laptop Guru</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Guru mengontrol jalannya kuis, mengatur durasi timer, menyembunyikan kunci jawaban, dan memantau siswa yang aktif tanpa perlu berdiri lama di depan papan.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-semibold text-stone-700">
              <Check className="w-4 h-4 mr-1.5 text-amber-600" /> Privasi jawaban &amp; catatan aman
            </div>
          </div>

          {/* Screen 2: Layar Proyektor */}
          <div className="bg-white rounded-2xl p-6 border border-amber-300 shadow-2xs flex flex-col justify-between hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold">
                  <Tv className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Layar Proyektor
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900">2. Tampilan Bersama yang Memikat</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Tampilan khusus proyektor dengan kontras tinggi, font besar, dan visual bersih. Seluruh kelas dapat melihat kode sesi, grafik respon, dan leaderboard bersama-sama.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-semibold text-amber-800">
              <Check className="w-4 h-4 mr-1.5 text-amber-600" /> Terbaca jelas hingga bangku belakang
            </div>
          </div>

          {/* Screen 3: Ponsel Siswa */}
          <div className="bg-white rounded-2xl p-6 border border-[#e8e4dc] shadow-2xs flex flex-col justify-between hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Gawai Siswa
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900">3. Respons Instan dari Ponsel</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Siswa cukup memindai QR code atau mengetik kode 6 karakter. Antarmuka sentuh besar dan sederhana, dirancang hemat baterai dan ringan di sinyal seluler sekolah.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center text-xs font-semibold text-emerald-700">
              <Check className="w-4 h-4 mr-1.5 text-emerald-600" /> 100% tanpa login atau password
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

