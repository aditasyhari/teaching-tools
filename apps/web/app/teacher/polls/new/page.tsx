'use client';

import React from 'react';
import { PollEditorView } from '../../../../features/poll/poll-editor-view';

export default function NewPollPage(): React.JSX.Element {
  return <PollEditorView isEditing={false} />;
}
