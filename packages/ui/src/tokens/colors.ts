/**
 * WaliKelas Teaching Tools — Centralized Color Tokens
 * Warm, pedagogical, professional educational palette.
 */

export const colors = {
  // Brand Primary (Warm Amber / Sunflower Gold Anchor)
  brand: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Primary Brand Action
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Warm Stone Neutrals (Replacing cold slates)
  stone: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },

  // Semantic Feedback
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  destructive: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },

  // Canvas, Surface & Borders
  surface: {
    base: '#ffffff',
    canvas: '#faf8f5', // Warm Paper Canvas
    subtle: '#f4eee2',
    card: '#ffffff',
    elevated: '#ffffff',
    border: '#e8e4dc', // Warm Natural Border
    borderSubtle: '#f4eee2',
    borderStrong: '#d6d3d1',
  },

  // Text
  text: {
    primary: '#1c1917', // Stone 900
    secondary: '#57534e', // Stone 600 (Accessible WCAG AA)
    muted: '#78716c', // Stone 500
    disabled: '#a8a29e',
    inverse: '#ffffff',
  },
} as const;
