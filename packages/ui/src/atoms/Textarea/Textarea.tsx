import React, { useId } from 'react';
import { cn } from '../../utils/cn.js';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className,
  id: customId,
  rows = 3,
  ...props
}: TextareaProps): React.JSX.Element {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-foreground select-none">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'w-full px-3.5 py-2.5 text-sm text-foreground bg-card border rounded-xl shadow-xs transition-colors resize-y min-h-[5rem]',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
          'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
          error
            ? 'border-destructive focus-visible:ring-destructive'
            : 'border-border hover:border-stone-400',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-destructive font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
