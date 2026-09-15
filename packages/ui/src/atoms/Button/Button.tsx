import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn.js';
import { Spinner } from '../Spinner/Spinner.js';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-xs border border-transparent disabled:bg-blue-300',
        default:
          'bg-amber-500 text-stone-950 font-bold hover:bg-amber-600 active:bg-amber-700 shadow-xs border border-amber-600/30 disabled:bg-amber-200 disabled:text-stone-400',
        secondary:
          'bg-stone-100 text-stone-800 hover:bg-stone-200 active:bg-stone-300 border border-stone-200/70 disabled:bg-stone-50 disabled:text-stone-400',
        outline:
          'border border-stone-300 bg-transparent text-stone-800 hover:bg-stone-50 active:bg-stone-100 disabled:border-stone-200 disabled:text-stone-300',
        ghost:
          'bg-transparent text-stone-700 hover:bg-stone-100 active:bg-stone-200 disabled:text-stone-300',
        danger:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs disabled:bg-red-300',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs disabled:bg-red-300',
        accent:
          'bg-amber-100 text-amber-950 font-semibold hover:bg-amber-200 border border-amber-200/60 disabled:bg-amber-50 disabled:text-amber-300',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
        md: 'h-10 px-4 text-sm rounded-lg gap-2',
        lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
        icon: 'h-10 w-10 p-0 rounded-lg shrink-0',
        'icon-sm': 'h-8 w-8 p-0 rounded-md shrink-0',
        'icon-lg': 'h-12 w-12 p-0 rounded-xl shrink-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        {...(!asChild && {
          type,
          disabled: disabled || isLoading,
          'aria-busy': isLoading,
        })}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {asChild ? (
          children
        ) : isLoading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = 'Button';
