import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { Avatar } from '../../atoms/Avatar/Avatar.js';
import { Badge } from '../../atoms/Badge/Badge.js';
import { cn } from '../../utils/cn.js';

export interface UserMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
}

export interface UserMenuProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string;
  items?: UserMenuItem[];
  onSignOut?: () => void;
  className?: string;
}

export function UserMenu({
  name,
  email,
  avatarUrl,
  role,
  items,
  onSignOut,
  className,
}: UserMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const defaultMenuItems: UserMenuItem[] = items || [];

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Menu pengguna"
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Avatar src={avatarUrl} name={name} size="sm" />
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
            {name}
          </span>
          {role && (
            <span className="text-[10px] text-slate-500 leading-tight uppercase font-medium">
              {role}
            </span>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-lg border border-slate-200 py-1.5 z-50 focus:outline-none"
        >
          {/* User Details */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
            {role && (
              <div className="mt-2">
                <Badge variant="neutral" size="sm">
                  {role}
                </Badge>
              </div>
            )}
          </div>

          {/* Custom Items */}
          {defaultMenuItems.length > 0 && (
            <div className="py-1">
              {defaultMenuItems.map((item, idx) => (
                <button
                  key={`${item.label}-${idx}`}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    if (item.onClick) item.onClick();
                    else if (item.href) window.location.href = item.href;
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors',
                    item.destructive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Sign Out Action */}
          {onSignOut && (
            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
