'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@walikelas/ui';
import { useAuth } from '../../lib/auth-context';
import { BrandLogo } from '../common/brand-logo';

export function LandingNavbar(): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, loginWithGoogle } = useAuth();

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  const handleTeacherAccess = () => {
    if (isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/teacher';
      }
    } else {
      loginWithGoogle();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Brand & Navigation */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center focus:outline-none">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-1 ml-8 pl-6 border-l border-[#e8e4dc]">
            <a
              href="#perkakas"
              onClick={(e) => handleScrollTo(e, 'perkakas')}
              className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Perkakas
            </a>
            <a
              href="#cara-kerja"
              onClick={(e) => handleScrollTo(e, 'cara-kerja')}
              className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Cara Kerja
            </a>
            <a
              href="#momen-kelas"
              onClick={(e) => handleScrollTo(e, 'momen-kelas')}
              className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Momen Kelas
            </a>
            <Link
              href="/tools"
              className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Katalog Lengkap
            </Link>
          </nav>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link href="/teacher">
              <Button variant="primary" size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold border-amber-600/20 shadow-xs">
                Halo, {user?.name.split(' ')[0]} (Buka Ruang Guru)
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={loginWithGoogle}
                className="text-stone-700 hover:text-stone-900 hover:bg-stone-100"
              >
                Masuk
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTeacherAccess}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold border-amber-600/20 shadow-xs"
              >
                Mulai Mengajar
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#e8e4dc] bg-[#faf8f5] px-4 pt-2 pb-5 space-y-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            <a
              href="#perkakas"
              onClick={(e) => handleScrollTo(e, 'perkakas')}
              className="px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg min-h-[44px] flex items-center cursor-pointer"
            >
              Perkakas
            </a>
            <a
              href="#cara-kerja"
              onClick={(e) => handleScrollTo(e, 'cara-kerja')}
              className="px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg min-h-[44px] flex items-center cursor-pointer"
            >
              Cara Kerja
            </a>
            <a
              href="#momen-kelas"
              onClick={(e) => handleScrollTo(e, 'momen-kelas')}
              className="px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg min-h-[44px] flex items-center cursor-pointer"
            >
              Momen Kelas
            </a>
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg min-h-[44px] flex items-center"
            >
              Katalog Lengkap
            </Link>
          </nav>
          <div className="pt-3 border-t border-[#e8e4dc] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/teacher" className="w-full">
                <Button variant="primary" size="md" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold">
                  Buka Ruang Guru ({user?.name.split(' ')[0]})
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={loginWithGoogle}
                  className="w-full font-bold border-stone-300"
                >
                  Masuk dengan Akun Google
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleTeacherAccess}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold"
                >
                  Mulai Mengajar Gratis
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
