'use client';

import React from 'react';
import { QuizEditorView } from '../../../../features/quiz/quiz-editor-view';

export default function NewQuizPage(): React.JSX.Element {
  return <QuizEditorView isEditing={false} />;
}
