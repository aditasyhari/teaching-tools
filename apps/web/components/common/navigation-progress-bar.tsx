'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgressBar(): React.JSX.Element | null {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress on pathname change
  useEffect(() => {
    let finishTimer: NodeJS.Timeout | undefined;
    if (isNavigating) {
      setProgress(100);
      finishTimer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
    }
    return () => {
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [pathname, isNavigating]);

  // Global listener for link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external links, new tab links, hash-only anchors, or download links
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        targetAttr === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // If navigating to a different pathname, trigger instant progress animation
      if (href !== window.location.pathname) {
        setIsNavigating(true);
        setProgress(25);

        if (timerRef.current) clearInterval(timerRef.current);

        // Gradually increment progress up to 85% until navigation completes
        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              if (timerRef.current) clearInterval(timerRef.current);
              return prev;
            }
            return prev + Math.random() * 15;
          });
        }, 150);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-9999 pointer-events-none h-[3px] bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all ease-out duration-200"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '100ms' : '250ms',
        }}
      />
    </div>
  );
}
