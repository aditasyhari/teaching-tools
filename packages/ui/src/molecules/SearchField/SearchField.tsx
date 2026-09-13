import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface SearchFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  shortcutHint?: string;
}

export function SearchField({
  value,
  onChange,
  onClear,
  placeholder = 'Cari perkakas atau aktivitas...',
  shortcutHint,
  className,
  ...props
}: SearchFieldProps): React.JSX.Element {
  return (
    <div className={cn('relative flex items-center w-full max-w-md', className)}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-10 pl-9 pr-14 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg',
          'placeholder:text-slate-400 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
          'hover:border-slate-400',
        )}
        {...props}
      />
      <div className="absolute right-2.5 flex items-center gap-1.5">
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              onClear?.();
            }}
            aria-label="Bersihkan pencarian"
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : shortcutHint ? (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            {shortcutHint}
          </kbd>
        ) : null}
      </div>
    </div>
  );
}
