import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        border: 'var(--border, #e2e8f0)',
        card: {
          DEFAULT: 'var(--card, #ffffff)',
          foreground: 'var(--card-foreground, #0f172a)',
        },
        primary: {
          DEFAULT: 'var(--primary, #2563eb)',
          foreground: 'var(--primary-foreground, #ffffff)',
        },
        muted: {
          DEFAULT: 'var(--muted, #f1f5f9)',
          foreground: 'var(--muted-foreground, #64748b)',
        },
        foreground: 'var(--foreground, #0f172a)',
        background: 'var(--background, #f8fafc)',
      },
    },
  },
  plugins: [],
};

export default config;
