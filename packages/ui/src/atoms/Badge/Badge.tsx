import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

export const badgeVariants = cva(
  'inline-flex items-center font-medium rounded-full border transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-amber-100/80 text-amber-950 border-amber-200/60',
        secondary: 'bg-stone-100 text-stone-800 border-stone-200/70',
        neutral: 'bg-stone-100 text-stone-700 border-stone-200/70',
        outline: 'bg-transparent text-stone-800 border-stone-300',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-800 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
        destructive: 'bg-red-50 text-red-700 border-red-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px] leading-tight',
        md: 'px-2.5 py-0.5 text-xs leading-normal',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
