import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../../atoms/Badge/Badge.js';
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

const categoryLabels: Record<string, string> = {
  LOCAL: 'Lokal',
  INTERACTIVE: 'Interaktif',
  CONTENT: 'Konten',
};

const categoryBadgeVariants: Record<string, 'neutral' | 'default' | 'success'> = {
  LOCAL: 'neutral',
  INTERACTIVE: 'default',
  CONTENT: 'success',
};

export function ToolCard({
  tool,
  onAction,
  actionLabel = 'Buka Perkakas',
  icon,
  className,
}: ToolCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'group p-5 bg-white rounded-xl border border-slate-200 transition-all duration-200',
        'hover:border-blue-500 hover:shadow-sm flex flex-col justify-between gap-4',
        className,
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              {icon || <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {tool.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={categoryBadgeVariants[tool.category] || 'neutral'} size="sm">
                  {categoryLabels[tool.category] || tool.category}
                </Badge>
                {tool.isInteractive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Realtime
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant="neutral" size="sm">
            {tool.priority}
          </Badge>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{tool.description}</p>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          {tool.requiresAuth ? 'Perlu login guru' : 'Siap pakai'}
        </span>
        <Button
          variant={tool.category === 'INTERACTIVE' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onAction?.(tool)}
          className="group/btn"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
