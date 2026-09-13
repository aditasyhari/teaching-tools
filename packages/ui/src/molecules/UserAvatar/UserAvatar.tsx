import React from 'react';
import { Avatar, type AvatarProps } from '../../atoms/Avatar/Avatar.js';
import { Badge } from '../../atoms/Badge/Badge.js';
import { cn } from '../../utils/cn.js';

export interface UserAvatarProps {
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  status?: AvatarProps['status'];
  size?: AvatarProps['size'];
  showRoleBadge?: boolean;
  className?: string;
}

export function UserAvatar({
  name,
  email,
  role,
  avatarUrl,
  status,
  size = 'md',
  showRoleBadge = false,
  className,
}: UserAvatarProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar src={avatarUrl} name={name} size={size} status={status} />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 truncate">{name}</span>
          {showRoleBadge && role && (
            <Badge variant="neutral" size="sm">
              {role}
            </Badge>
          )}
        </div>
        {email && <span className="text-xs text-slate-500 truncate">{email}</span>}
      </div>
    </div>
  );
}
