import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../atoms/Button/Button.js';
import { cn } from '../../utils/cn.js';
import type { ToolMetadata } from '@walikelas/types';

export interface ToolCardProps {
  tool: ToolMetadata;
  onAction?: (tool: ToolMetadata) => void;
  actionLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ToolCard({
  tool,
  onAction,
  actionLabel,
  icon,
  className,
}: ToolCardProps): React.JSX.Element {
  const displayAction = actionLabel || (tool.isInteractive ? 'Mulai' : 'Buka');
  const displayCategory = tool.categoryLabel;

  return (
    <div
      className={cn(
        'group p-5 bg-white rounded-2xl border border-stone-200/80 transition-all duration-200 ease-out',
        'hover:border-amber-400 hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.99] flex flex-col justify-between gap-4',
        className,
      )}
    >
      <div className="space-y-3">
        {/* Top: Icon, Tool Name & Category */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-stone-50 text-stone-700 border border-stone-200/70 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-stone-950 group-hover:border-amber-500 transition-all duration-200 shadow-2xs">
            {icon || <Sparkles className="w-5 h-5 text-stone-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
              {tool.name}
            </h3>
            {displayCategory && (
              <span className="inline-block text-[11px] font-medium text-stone-400 mt-0.5">
                {displayCategory}
              </span>
            )}
          </div>
        </div>

        {/* Description: 2 lines max, accessible tone */}
        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 font-normal">
          {tool.description}
        </p>
      </div>

      {/* Footer: Auth hint & Clear Action */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-stone-400">
          {tool.requiresAuth ? 'Perlu login guru' : 'Siap pakai'}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAction?.(tool)}
          className="group/btn font-semibold hover:border-amber-300 hover:bg-amber-50/80 hover:text-amber-900 transition-colors min-h-[36px]"
        >
          <span>{displayAction}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
