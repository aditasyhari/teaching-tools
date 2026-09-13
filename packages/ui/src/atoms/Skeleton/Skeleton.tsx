import React from 'react';
import { cn } from '../../utils/cn.js';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps): React.JSX.Element {
  const inlineStyles: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      aria-hidden="true"
      style={inlineStyles}
      className={cn(
        'animate-pulse bg-slate-200/80',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circular' && 'rounded-full shrink-0',
        variant === 'rectangular' && 'rounded-lg',
        className,
      )}
      {...props}
    />
  );
}
