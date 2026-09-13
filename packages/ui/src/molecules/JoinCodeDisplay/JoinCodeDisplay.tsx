import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface JoinCodeDisplayProps {
  code: string;
  label?: string;
  showCopy?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function JoinCodeDisplay({
  code,
  label = 'Kode Sesi',
  showCopy = true,
  size = 'md',
  className,
}: JoinCodeDisplayProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or ignore clipboard permission errors
    }
  };

  const sizeStyles = {
    sm: 'text-lg tracking-widest px-3 py-1 font-mono font-bold',
    md: 'text-2xl tracking-[0.2em] px-4 py-2 font-mono font-extrabold',
    lg: 'text-4xl sm:text-5xl tracking-[0.25em] px-6 py-4 font-mono font-black',
  };

  return (
    <div className={cn('inline-flex flex-col items-center gap-1.5', className)}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      )}
      <div className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-xl shadow-sm overflow-hidden border border-slate-800">
        <span className={cn('select-all uppercase', sizeStyles[size])}>{code}</span>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Kode disalin' : 'Salin kode'}
            className="p-2.5 mr-1.5 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
            title="Salin Kode"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
