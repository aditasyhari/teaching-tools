import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps): React.JSX.Element {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center space-x-1.5 list-none m-0 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center space-x-1.5">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span className="font-medium text-slate-900" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-slate-500">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
