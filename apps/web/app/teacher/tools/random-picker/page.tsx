'use client';

import React from 'react';
import { RandomPickerView } from '../../../../features/random-picker/random-picker-view';
import { InConsoleToolHeader } from '@/components/common/in-console-tool-header';

export default function TeacherRandomPickerPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <InConsoleToolHeader toolId="random-picker" toolName="Random Picker (Pemilih Acak)" />
      <RandomPickerView />
    </div>
  );
}

