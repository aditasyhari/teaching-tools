import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from '../../atoms/Button/Button.js';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  description = 'Gagal memuat data. Silakan coba kembali beberapa saat lagi.',
  onRetry,
  retryLabel = 'Coba Lagi',
  icon,
  className,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-red-200 bg-red-50/40',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        {icon || <AlertTriangle className="w-6 h-6" />}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">{description}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="md"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
