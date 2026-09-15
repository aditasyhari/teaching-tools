import React from 'react';
import { Button, type ButtonProps } from '../Button/Button.js';
import { cn } from '../../utils/cn.js';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'default' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      icon,
      className,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const buttonSize: ButtonProps['size'] =
      size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon';

    return (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        variant={variant as ButtonProps['variant']}
        size={buttonSize}
        isLoading={isLoading}
        className={cn('shrink-0', className)}
        {...props}
      >
        {icon || children}
      </Button>
    );
  },
);

IconButton.displayName = 'IconButton';
