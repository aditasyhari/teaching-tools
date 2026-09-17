import React from 'react';
import { cn } from '../../utils/cn.js';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: string;
}

export interface SidebarSection {
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarBrand {
  name: string;
  subtitle?: string;
  logo?: React.ReactNode;
  href?: string;
  badge?: string;
}

export interface SidebarLinkProps {
  href: string;
  className: string;
  children: React.ReactNode;
  'aria-current'?: 'page';
  key?: string;
}

export interface SidebarProps {
  brand: SidebarBrand;
  items?: SidebarNavItem[];
  sections?: SidebarSection[];
  footer?: React.ReactNode;
  className?: string;
  variant?: 'warm' | 'dark';
  renderLink?: (props: SidebarLinkProps) => React.ReactNode;
}

export function Sidebar({
  brand,
  items,
  sections,
  footer,
  className,
  variant = 'warm',
  renderLink,
}: SidebarProps): React.JSX.Element {
  const isWarm = variant === 'warm';

  // Normalize sections and items
  const resolvedSections: SidebarSection[] = sections
    ? sections
    : items
      ? [{ items }]
      : [];

  const renderNavItem = (item: SidebarNavItem) => {
    const linkClassName = cn(
      'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors duration-100 min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
      isWarm
        ? item.active
          ? 'bg-stone-900 text-stone-50 font-semibold shadow-xs'
          : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80 active:bg-stone-200/60'
        : item.active
          ? 'bg-stone-800 text-white font-semibold shadow-xs border border-stone-700/60'
          : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/80 active:bg-stone-800',
    );

    const content = (
      <>
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              'w-5 h-5 shrink-0 flex items-center justify-center transition-colors duration-100',
              item.active
                ? 'text-amber-400'
                : isWarm
                  ? 'text-stone-400 group-hover:text-stone-700'
                  : 'text-stone-500 group-hover:text-stone-300',
            )}
          >
            {item.icon}
          </span>
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-semibold rounded-full transition-colors shrink-0 ml-2',
              item.active
                ? isWarm
                  ? 'bg-stone-800 text-stone-200 border border-stone-700/50'
                  : 'bg-stone-700 text-stone-200'
                : isWarm
                  ? 'bg-stone-100 text-stone-600 border border-stone-200/60 group-hover:border-stone-300'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 group-hover:border-stone-700',
            )}
          >
            {item.badge}
          </span>
        )}
      </>
    );

    if (renderLink) {
      return (
        <React.Fragment key={item.href}>
          {renderLink({
            key: item.href,
            href: item.href,
            className: linkClassName,
            'aria-current': item.active ? 'page' : undefined,
            children: content,
          })}
        </React.Fragment>
      );
    }

    return (
      <a
        key={item.href}
        href={item.href}
        aria-current={item.active ? 'page' : undefined}
        className={linkClassName}
      >
        {content}
      </a>
    );
  };

  const brandInner = (
    <>
      {brand.logo ? (
        brand.logo
      ) : (
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-stone-950 text-xs shadow-xs">
          WK
        </div>
      )}
      <div className="min-w-0">
        <div
          className={cn(
            'text-sm font-bold tracking-tight transition-colors truncate leading-tight',
            isWarm
              ? 'text-foreground group-hover:text-amber-700'
              : 'text-white group-hover:text-amber-400',
          )}
        >
          {brand.name}
        </div>
        {brand.subtitle && (
          <div
            className={cn(
              'text-[11px] font-medium tracking-normal truncate leading-tight',
              isWarm ? 'text-muted-foreground' : 'text-stone-400',
            )}
          >
            {brand.subtitle}
          </div>
        )}
      </div>
    </>
  );

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'w-64 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none transition-colors',
        isWarm
          ? 'bg-card text-foreground border-r border-border'
          : 'bg-stone-950 text-stone-100 border-r border-stone-800/80',
        className,
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header — Exact h-16 to align perfectly with Topbar border */}
        <div
          className={cn(
            'h-16 px-5 flex items-center justify-between border-b shrink-0',
            isWarm ? 'border-border' : 'border-stone-800',
          )}
        >
          {renderLink && brand.href ? (
            renderLink({
              href: brand.href,
              className:
                'flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl',
              children: brandInner,
            })
          ) : (
            <a
              href={brand.href || '/'}
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
            >
              {brandInner}
            </a>
          )}

          {brand.badge && (
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0',
                isWarm
                  ? 'bg-stone-100 text-stone-600 border border-stone-200/70'
                  : 'bg-stone-800 text-stone-300 border border-stone-700/60',
              )}
            >
              {brand.badge}
            </span>
          )}
        </div>

        {/* Navigation Content with Scroll */}
        <nav
          aria-label="Main Navigation"
          className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 min-h-0"
        >
          {resolvedSections.map((section, idx) => (
            <div key={section.title || idx} className="space-y-1">
              {section.title && (
                <div
                  className={cn(
                    'px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider select-none',
                    isWarm ? 'text-muted-foreground/80' : 'text-stone-500',
                  )}
                >
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Area */}
      {footer && (
        <div
          className={cn(
            'p-4 border-t shrink-0',
            isWarm ? 'border-border bg-muted/20' : 'border-stone-800 bg-stone-900/40',
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
