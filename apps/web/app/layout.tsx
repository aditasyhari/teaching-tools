import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { NavigationProgressBar } from '../components/common/navigation-progress-bar';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.walikelas.id';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'WaliKelas Teaching Tools — Pembelajaran Interaktif di Kelas',
    template: '%s | WaliKelas Teaching Tools',
  },
  description:
    'Kotak perkakas praktis dan modern untuk guru Indonesia. Mulai kuis langsung, polling interaktif, timer kelas, random picker, dan proyeksikan ke layar kelas tanpa instalasi rumit.',
  keywords: [
    'perkakas guru',
    'teaching tools',
    'kuis interaktif',
    'live quiz',
    'polling kelas',
    'timer kelas',
    'random picker',
    'group maker',
    'papan skor kelas',
    'walikelas',
    'tools walikelas',
    'media pembelajaran interaktif',
    'aplikasi guru',
    'kurikulum merdeka',
  ],
  authors: [{ name: 'WaliKelas', url: 'https://walikelas.id' }],
  creator: 'WaliKelas',
  publisher: 'WaliKelas Indonesia',
  applicationName: 'WaliKelas Teaching Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: APP_URL,
    siteName: 'WaliKelas Teaching Tools',
    title: 'WaliKelas Teaching Tools — Pembelajaran Interaktif di Kelas',
    description:
      'Kotak perkakas praktis dan modern untuk guru Indonesia. Buat kelas lebih aktif, seru, dan interaktif dalam sekejap.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WaliKelas Teaching Tools — Pembelajaran Interaktif di Kelas',
    description:
      'Kotak perkakas guru: kuis langsung, polling interaktif, timer kelas, random picker, dan proyektor layar kelas.',
    creator: '@walikelas_id',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.webmanifest',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WaliKelas Teaching Tools',
  url: APP_URL,
  description:
    'Kotak perkakas praktis dan modern untuk guru Indonesia dalam menyelenggarakan pembelajaran interaktif di kelas.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'IDR',
  },
  author: {
    '@type': 'Organization',
    name: 'WaliKelas',
    url: 'https://walikelas.id',
  },
};

export default function RootLayout({ children }: { children?: any }) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} motion-safe:scroll-smooth`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-amber-100 selection:text-amber-900 antialiased overflow-x-hidden">
        <NavigationProgressBar />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-500 focus:text-stone-950 focus:font-bold focus:text-xs focus:rounded-xl focus:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all"
        >
          Lewati ke konten utama
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
