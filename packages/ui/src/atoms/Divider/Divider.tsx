import React from 'react';
import { cn } from '../../utils/cn.js';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export function Divider({
  orientation = 'horizontal',
  label,
  className,
  ...props
}: DividerProps): React.JSX.Element {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('inline-block w-px self-stretch bg-slate-200 min-h-[1rem]', className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn('flex items-center gap-3 w-full my-3', className)}
        {...props}
      >
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    );
  }

  return <hr className={cn('w-full border-t border-slate-200 my-3', className)} {...props} />;
}
