# 04 — UX & Design System

## Visual direction
Modern educational software with a professional, calm, purposeful visual language.

Avoid:
- excessive gradients
- glassmorphism everywhere
- floating blobs
- oversized decorative illustrations
- random rounded cards
- excessive shadows
- generic AI-generated SaaS layouts
- decorative motion without purpose

## UI hierarchy
The product should visually prioritize:
1. current teaching task
2. primary action
3. participant/activity state
4. secondary controls
5. navigation

## Atomic Design
Use:
- atoms: Button, Input, IconButton, Badge, Text, Divider, Spinner
- molecules: SearchField, ToolCard, StudentChip, TimerDisplay, JoinCode
- organisms: ToolGrid, ClassroomSelector, SessionHeader, ParticipantPanel, ActivityControlBar
- templates: TeacherConsoleLayout, ToolWorkspace, ProjectorLayout

Do not force domain logic into Atomic Design folders. Feature modules own feature-specific composition.

## Feature structure
Example:
```
features/
  live-quiz/
    components/
    hooks/
    state/
    api/
    schemas/
    types/
    utils/
```

Shared components live in the design system, not inside random features.

## Responsive behavior
Desktop:
- teacher console
- projector
- rich controls

Mobile:
- student participation
- teacher remote
- quick actions

## Accessibility
- keyboard navigation
- visible focus states
- semantic HTML
- sufficient contrast
- reduced-motion support
- touch targets appropriate for mobile
- screen-reader labels for icon-only actions
- no color-only status communication

## Motion
Use motion to communicate:
- state changes
- selection
- transitions
- feedback
Keep classroom/projector motion restrained and readable.

## Empty/loading/error states
Every tool must define:
- empty state
- loading state
- error state
- offline/disconnected state where relevant
- success/completed state

## UX quality gate
A teacher should understand the primary action without reading documentation.
