'use client';

import React from 'react';
import { TimerView } from '../../../../features/timer/timer-view';
import { InConsoleToolHeader } from '@/components/common/in-console-tool-header';

export default function TeacherTimerPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <InConsoleToolHeader toolId="timer" toolName="Timer Kelas" />
      <TimerView />
    </div>
  );
}

