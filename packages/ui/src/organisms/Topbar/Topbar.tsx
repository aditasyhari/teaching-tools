import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { IconButton } from '../../atoms/IconButton/IconButton.js';

export interface TopbarProps {
  title?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  userMenu?: React.ReactNode;
  onMenuToggle?: () => void;
  className?: string;
}

export function Topbar({
  title,
  breadcrumbs,
  actions,
  userMenu,
  onMenuToggle,
  className,
}: TopbarProps): React.JSX.Element {
  return (
    <header
      className={cn(
        'h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between gap-4',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onMenuToggle && (
          <IconButton
            icon={<Menu className="w-5 h-5" />}
            aria-label="Buka menu navigasi"
            variant="ghost"
            size="md"
            onClick={onMenuToggle}
            className="md:hidden text-slate-600 hover:text-slate-900"
          />
        )}
        {breadcrumbs ? (
          <div className="hidden sm:block">{breadcrumbs}</div>
        ) : title ? (
          <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {userMenu && <div className="shrink-0">{userMenu}</div>}
      </div>
    </header>
  );
}
