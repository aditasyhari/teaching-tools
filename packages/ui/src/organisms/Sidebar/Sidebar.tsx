import React from 'react';
import { cn } from '../../utils/cn.js';
import { Badge } from '../../atoms/Badge/Badge.js';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: string;
}

export interface SidebarBrand {
  name: string;
  subtitle?: string;
  logo?: React.ReactNode;
  href?: string;
}

export interface SidebarProps {
  brand: SidebarBrand;
  items: SidebarNavItem[];
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({ brand, items, footer, className }: SidebarProps): React.JSX.Element {
  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none',
        className,
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-800">
          <a
            href={brand.href || '/'}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md"
          >
            {brand.logo ? (
              brand.logo
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                WK
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
                {brand.name}
              </div>
              {brand.subtitle && (
                <div className="text-[11px] font-medium text-slate-400">{brand.subtitle}</div>
              )}
            </div>
          </a>
        </div>

        {/* Navigation List */}
        <nav aria-label="Main Navigation" className="p-3 space-y-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                item.active
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn('w-4 h-4 shrink-0', item.active ? 'text-white' : 'text-slate-400')}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <Badge
                  variant={item.active ? 'default' : 'neutral'}
                  size="sm"
                  className={item.active ? 'bg-blue-700 text-white border-none' : ''}
                >
                  {item.badge}
                </Badge>
              )}
            </a>
          ))}
        </nav>
      </div>

      {/* Footer Area */}
      {footer && <div className="p-4 border-t border-slate-800">{footer}</div>}
    </aside>
  );
}
