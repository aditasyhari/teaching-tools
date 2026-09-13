import React from 'react';
import { Breadcrumb, type BreadcrumbItem } from '../../molecules/Breadcrumb/Breadcrumb.js';
import { PageHeader } from '../../molecules/PageHeader/PageHeader.js';
import { cn } from '../../utils/cn.js';

export interface PageHeaderSectionProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeaderSection({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
}: PageHeaderSectionProps): React.JSX.Element {
  return (
    <PageHeader
      title={title}
      description={description}
      breadcrumb={breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : undefined}
      actions={actions}
      badge={badge}
      className={cn('mb-8', className)}
    />
  );
}
