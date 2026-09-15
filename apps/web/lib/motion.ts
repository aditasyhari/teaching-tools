/**
 * WaliKelas Teaching Tools — Shared Motion System
 * Adheres strictly to `walikelas-motion` guidelines.
 * Fast, subtle, and purposeful interactions.
 */

export const motionDurations = {
  micro: 0.15,
  normal: 0.22,
  entrance: 0.28,
  moment: 0.45,
  exit: 0.18,
} as const;

export const motionEasings = {
  easeOut: [0.16, 1, 0.3, 1] as const, // Spring-like decelerate curve
  easeInOut: [0.4, 0, 0.2, 1] as const,
} as const;

/**
 * Page & Section Fade In Entrance
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: motionDurations.normal,
    ease: motionEasings.easeOut,
  },
};

/**
 * Subtle Slide Up Entrance (e.g. Headings, Cards)
 */
export const slideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: {
    duration: motionDurations.entrance,
    ease: motionEasings.easeOut,
  },
};

/**
 * Grid & List Stagger Orchestrator
 */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.02,
    },
  },
};

/**
 * Micro-lift hover and tap feedback for cards
 */
export const cardHoverMotion = {
  whileHover: {
    y: -2,
    transition: { duration: motionDurations.micro, ease: motionEasings.easeOut },
  },
  whileTap: {
    scale: 0.99,
    transition: { duration: motionDurations.micro },
  },
};

/**
 * Dialog / Modal Presence Transition
 */
export const dialogPresence = {
  initial: { opacity: 0, scale: 0.96, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: motionDurations.normal, ease: motionEasings.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: motionDurations.exit },
  },
};

/**
 * Winner Reveal Motion for Random Picker
 */
export const winnerRevealMotion = {
  initial: { opacity: 0, scale: 0.93 },
  animate: {
    opacity: 1,
    scale: [0.93, 1.03, 1],
    transition: {
      duration: 0.35,
      ease: motionEasings.easeOut,
    },
  },
};

/**
 * Score bump response for Scoreboard (zero layout shift)
 */
export const scoreBumpMotion = {
  initial: { scale: 1.06 },
  animate: {
    scale: 1,
    transition: {
      duration: motionDurations.micro,
      ease: motionEasings.easeOut,
    },
  },
};

/**
 * Badge & Notification pill entrance
 */
export const badgePulse = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: motionDurations.normal, ease: motionEasings.easeOut },
  },
};

/**
 * Helper to detect prefers-reduced-motion
 */
export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


