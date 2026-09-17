import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
  title?: string;
  description?: string;
  variant?: 'warm' | 'dark';
}

export function MobileDrawer({
  open,
  onOpenChange,
  children,
  side = 'left',
  className,
  title = 'Menu Navigasi',
  description = 'Panel navigasi samping untuk perangkat bergerak',
  variant = 'warm',
}: MobileDrawerProps): React.JSX.Element {
  const isWarm = variant === 'warm';

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col shadow-2xl transition ease-in-out focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
            isWarm
              ? 'bg-card text-foreground border-r border-border'
              : 'bg-stone-950 text-stone-100 border-r border-stone-800',
            side === 'left'
              ? 'left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
              : 'right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>

          <DialogPrimitive.Close
            aria-label="Tutup menu"
            className={cn(
              'absolute right-3 top-3.5 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
              isWarm
                ? 'text-muted-foreground hover:bg-stone-100 hover:text-foreground'
                : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100',
            )}
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
