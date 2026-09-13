import React from 'react';
import { cn } from '../../utils/cn.js';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  className,
}: StatCardProps): React.JSX.Element {
  const changeColors = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    negative: 'text-red-700 bg-red-50 border-red-200',
    neutral: 'text-slate-700 bg-slate-100 border-slate-200',
  };

  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-600 truncate">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border',
              changeColors[changeType],
            )}
          >
            {change}
          </span>
        )}
      </div>
      {description && <p className="mt-1 text-xs text-slate-500 leading-normal">{description}</p>}
    </div>
  );
}
