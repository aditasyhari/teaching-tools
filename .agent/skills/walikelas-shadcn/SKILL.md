---
name: walikelas-shadcn
description: Build WaliKelas Tools UI using shadcn/ui as the component foundation while keeping a custom, cohesive product design. Use when adding or refactoring buttons, dialogs, forms, cards, navigation, menus, tabs, tables, sheets, tool panels, and other UI primitives.
---

# WaliKelas Tools — shadcn/ui Rules

## Primary rule

Use shadcn/ui as the foundation for common UI primitives, then customize composition and styling to match WaliKelas.

Do not blindly use default shadcn appearance.

The goal is:
shadcn consistency + WaliKelas identity.

## Component-first workflow

Before creating a custom component:
1. Check whether an existing shadcn component fits.
2. Reuse the existing local component if present.
3. Compose multiple primitives when appropriate.
4. Only create a custom primitive when there is a clear product-specific need.

Prefer components such as:
- Button
- Card
- Badge
- Dialog
- Drawer
- Sheet
- Dropdown Menu
- Command
- Tabs
- Tooltip
- Popover
- Select
- Input
- Textarea
- Form/Field
- Skeleton
- Toast/sonner
- Progress
- Separator
- Sidebar

## Do not create component duplication

Avoid:
ButtonA
ButtonB
ButtonC

when one component with variants is sufficient.

Extend variants rather than duplicating components.

## Styling

Use the project's existing CSS variables and Tailwind tokens.

Do not hardcode arbitrary colors throughout JSX.

Prefer semantic tokens:
- background
- foreground
- muted
- border
- primary
- secondary
- destructive
- accent

## Buttons

Every page should have a clear primary action.

Primary button:
- compact
- readable
- strong contrast

Secondary button:
- visually quieter

Do not create huge CTA buttons unless the page specifically needs one.

## Cards

Cards should create meaningful grouping.

Do not wrap every paragraph or section in Card.

For tool cards:
- icon
- title
- optional tag
- short description
- CTA

Keep card anatomy consistent.

## Dialogs and drawers

Use:
- Dialog for focused desktop interaction
- Drawer/Sheet when mobile interaction benefits from bottom/side presentation

Avoid deeply nested modal flows.

## Forms

Use labels and clear validation.
Keep forms short and progressive.

Do not show every advanced option immediately.
Prefer progressive disclosure.

## Icons

Use one icon system consistently, preferably the project's configured shadcn/Lucide icon library.

Icons should communicate meaning, not decorate empty space.

## Implementation quality

- Preserve existing behavior.
- Preserve routes and API contracts.
- Do not rewrite working business logic during a visual refactor.
- Do not introduce a new UI library just to solve one component.
- Check existing `components.json` and project conventions before adding components.
