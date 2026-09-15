import React from 'react';
import type { ToolMetadata } from '@walikelas/types';
import { ToolCard } from '../../molecules/ToolCard/ToolCard.js';
import { EmptyState } from '../../molecules/EmptyState/EmptyState.js';
import { Button } from '../../atoms/Button/Button.js';
import { SearchX, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface ToolGridProps {
  tools: ToolMetadata[];
  onSelectTool?: (tool: ToolMetadata) => void;
  categoryFilter?: string;
  searchQuery?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  toolIcons?: Record<string, React.ReactNode>;
  className?: string;
}

export function ToolGrid({
  tools,
  onSelectTool,
  categoryFilter,
  searchQuery,
  emptyTitle = 'Perkakas tidak ditemukan',
  emptyDescription = 'Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.',
  onResetFilters,
  toolIcons,
  className,
}: ToolGridProps): React.JSX.Element {
  const filteredTools = tools.filter((tool) => {
    // Check category filter against teacherCategory or legacy category
    if (categoryFilter && categoryFilter !== 'ALL') {
      const matchesTeacherCat = tool.teacherCategory === categoryFilter;
      const matchesLegacyCat = tool.category === categoryFilter;
      if (!matchesTeacherCat && !matchesLegacyCat) {
        return false;
      }
    }

    // Check search query against name, description, categoryLabel, and id
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.description.toLowerCase().includes(q);
      const matchCategory = tool.categoryLabel?.toLowerCase().includes(q);
      const matchId = tool.id.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCategory && !matchId) {
        return false;
      }
    }

    return true;
  });

  if (filteredTools.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="w-8 h-8 text-stone-400" />}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
        action={
          onResetFilters && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={onResetFilters}
              className="mt-2 font-semibold"
            >
              Reset Pencarian & Filter
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5', className)}>
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
