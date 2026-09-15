import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../atoms/Button/Button.js';
import { cn } from '../../utils/cn.js';
import type { ToolMetadata } from '@walikelas/types';

export interface FeaturedToolCardProps {
  tool: ToolMetadata;
  onAction?: (tool: ToolMetadata) => void;
  actionLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FeaturedToolCard({
  tool,
  onAction,
  actionLabel,
  icon,
  className,
}: FeaturedToolCardProps): React.JSX.Element {
  const displayAction = actionLabel || (tool.isInteractive ? 'Mulai' : 'Buka');
  const displayDesc = tool.featuredDescription || tool.description;

  return (
    <div
      className={cn(
        'group relative p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs',
        'hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]',
        'transition-all duration-200 ease-out flex flex-col justify-between gap-5',
        className,
      )}
    >
      <div className="space-y-3.5">
        {/* Top bar: Icon & Featured badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-stone-950 group-hover:border-amber-500 transition-all duration-200 shadow-2xs">
            {icon || <Sparkles className="w-6 h-6" />}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/80 text-amber-900 border border-amber-200/50">
              <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
              <span>Utama</span>
            </span>
            {tool.categoryLabel && (
              <span className="text-[11px] font-medium text-stone-400">
                {tool.categoryLabel}
              </span>
            )}
          </div>
        </div>

        {/* Content: Title & Punchy Description */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-normal line-clamp-2">
            {displayDesc}
          </p>
        </div>
      </div>

      {/* Bottom bar: Primary Action */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-stone-400">
          {tool.requiresAuth ? 'Perlu login guru' : 'Siap pakai'}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAction?.(tool)}
          className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold border-amber-600/20 shadow-xs group/btn min-h-[36px]"
        >
          <span>{displayAction}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
