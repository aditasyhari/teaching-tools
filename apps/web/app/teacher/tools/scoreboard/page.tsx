'use client';

import React from 'react';
import { ScoreboardView } from '../../../../features/scoreboard/scoreboard-view';
import { InConsoleToolHeader } from '@/components/common/in-console-tool-header';

export default function TeacherScoreboardPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <InConsoleToolHeader toolId="scoreboard" toolName="Scoreboard (Papan Skor)" />
      <ScoreboardView />
    </div>
  );
}

