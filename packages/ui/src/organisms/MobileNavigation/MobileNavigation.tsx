import React from 'react';
import { cn } from '../../utils/cn.js';

export interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

export interface MobileNavigationProps {
  items: MobileNavItem[];
  className?: string;
}

export function MobileNavigation({ items, className }: MobileNavigationProps): React.JSX.Element {
  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg select-none',
        className,
      )}
    >
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-lg text-[11px] font-medium transition-colors',
            item.active
              ? 'text-blue-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900 active:bg-slate-50',
          )}
        >
          <span
            className={cn(
              'w-5 h-5 mb-0.5 shrink-0',
              item.active ? 'text-blue-600' : 'text-slate-500',
            )}
          >
            {item.icon}
          </span>
          <span className="truncate max-w-[64px]">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
