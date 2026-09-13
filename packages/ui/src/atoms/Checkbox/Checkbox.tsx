import React, { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Checkbox({
  label,
  description,
  className,
  id: customId,
  checked,
  disabled,
  ...props
}: CheckboxProps): React.JSX.Element {
  const generatedId = useId();
  const checkboxId = customId || generatedId;

  return (
    <div className={cn('flex items-start gap-2.5 select-none', className)}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          className={cn(
            'peer w-4 h-4 rounded border border-slate-300 bg-white appearance-none cursor-pointer transition-colors',
            'checked:bg-blue-600 checked:border-blue-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200',
          )}
          {...props}
        />
        <Check
          className={cn(
            'w-3 h-3 text-white absolute pointer-events-none stroke-[3] transition-opacity opacity-0',
            'peer-checked:opacity-100',
          )}
        />
      </div>
      {(label || description) && (
        <label htmlFor={checkboxId} className="flex flex-col cursor-pointer">
          {label && (
            <span
              className={cn(
                'text-sm font-medium text-slate-800',
                disabled && 'text-slate-400 cursor-not-allowed',
              )}
            >
              {label}
            </span>
          )}
          {description && <span className="text-xs text-slate-500">{description}</span>}
        </label>
      )}
    </div>
  );
}
