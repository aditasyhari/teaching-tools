'use client';

import React from 'react';
import { GroupMakerView } from '../../../../features/group-maker/group-maker-view';
import { InConsoleToolHeader } from '@/components/common/in-console-tool-header';

export default function TeacherGroupMakerPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <InConsoleToolHeader toolId="group-maker" toolName="Group Maker (Pembagi Kelompok)" />
      <GroupMakerView />
    </div>
  );
}

