import React from 'react';
import { cn } from '../../utils/cn.js';

export type TextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'label';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextElement;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption' | 'muted';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const variantClasses = {
  h1: 'text-3xl sm:text-4xl font-bold tracking-tight text-slate-900',
  h2: 'text-2xl sm:text-3xl font-bold tracking-tight text-slate-900',
  h3: 'text-xl sm:text-2xl font-semibold text-slate-900',
  h4: 'text-lg font-semibold text-slate-900',
  body: 'text-base text-slate-800 leading-relaxed',
  'body-sm': 'text-sm text-slate-700 leading-normal',
  caption: 'text-xs text-slate-600',
  muted: 'text-sm text-slate-500',
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  variant = 'body',
  weight,
  className,
  children,
  ...props
}) => {
  return React.createElement(
    Component,
    {
      className: cn(variantClasses[variant], weight && weightClasses[weight], className),
      ...props,
    },
    children,
  );
};
