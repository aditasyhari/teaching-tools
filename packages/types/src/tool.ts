export type ToolCategory = 'LOCAL' | 'INTERACTIVE' | 'CONTENT';

export type ToolId =
  // Local / utility
  | 'timer'
  | 'random-picker'
  | 'group-maker'
  | 'scoreboard'
  | 'teacher-notes'
  // Interactive
  | 'live-quiz'
  | 'live-poll'
  | 'raise-hand'
  | 'question-box'
  | 'brainstorm-board'
  | 'word-cloud'
  | 'exit-ticket'
  // Content
  | 'flashcards';

export interface ToolMetadata {
  id: ToolId;
  name: string;
  description: string;
  category: ToolCategory;
  isInteractive: boolean;
  requiresAuth: boolean;
  priority: 'P0' | 'P1' | 'P2';
  route: string;
  iconName: string;
  status: 'AVAILABLE' | 'COMING_SOON';
}
