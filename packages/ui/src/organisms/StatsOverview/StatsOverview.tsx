import React from 'react';
import { StatCard, type StatCardProps } from '../../molecules/StatCard/StatCard.js';
import { cn } from '../../utils/cn.js';

export interface StatsOverviewProps {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsOverview({
  stats,
  columns = 4,
  className,
}: StatsOverviewProps): React.JSX.Element {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colClasses[columns], className)}>
      {stats.map((stat, idx) => (
        <StatCard key={`${stat.label}-${idx}`} {...stat} />
      ))}
    </div>
  );
}
