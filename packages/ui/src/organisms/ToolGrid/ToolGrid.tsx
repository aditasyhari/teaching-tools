import React from 'react';
import type { ToolMetadata } from '@walikelas/types';
import { ToolCard } from '../../molecules/ToolCard/ToolCard.js';
import { EmptyState } from '../../molecules/EmptyState/EmptyState.js';
import { cn } from '../../utils/cn.js';

export interface ToolGridProps {
  tools: ToolMetadata[];
  onSelectTool?: (tool: ToolMetadata) => void;
  categoryFilter?: string;
  searchQuery?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  toolIcons?: Record<string, React.ReactNode>;
  className?: string;
}

export function ToolGrid({
  tools,
  onSelectTool,
  categoryFilter,
  searchQuery,
  emptyTitle = 'Tidak ada perkakas yang ditemukan',
  emptyDescription = 'Coba gunakan kata kunci pencarian atau kategori lain.',
  toolIcons,
  className,
}: ToolGridProps): React.JSX.Element {
  const filteredTools = tools.filter((tool) => {
    if (categoryFilter && categoryFilter !== 'ALL' && tool.category !== categoryFilter) {
      return false;
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.description.toLowerCase().includes(q);
      const matchId = tool.id.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchId) {
        return false;
      }
    }
    return true;
  });

  if (filteredTools.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
      {filteredTools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          icon={toolIcons ? toolIcons[tool.id] : undefined}
          onAction={onSelectTool}
        />
      ))}
    </div>
  );
}
