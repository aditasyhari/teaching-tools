---
name: walikelas-ui-system
description: Design and improve the WaliKelas Tools frontend with a modern, minimal, premium education-product visual system. Use when creating or redesigning pages, dashboards, tool cards, navigation, forms, empty states, or responsive layouts.
---

# WaliKelas Tools — UI System

## Product feeling

Build `tools.walikelas.id` as a modern teaching-product, not a traditional school admin dashboard.

Target feeling:
- modern
- simple
- premium
- friendly
- calm
- intelligent
- fast
- slightly playful

Reference the visual discipline of modern productivity products, but do NOT copy another product.

## Current product context

The product already contains 13 teaching/classroom tools, including:
- Timer
- Random Picker
- Group Maker
- Scoreboard
- Teacher Notes
- Live Quiz
- Live Poll
- Raise Hand
- Question Box
- Brainstorm Board
- Word Cloud
- Exit Ticket
- Flashcards

The UI must make a collection of tools feel like one coherent product.

## Core rule

Do not make the interface "fancier" for its own sake.

Optimize for:
1. clarity
2. hierarchy
3. speed
4. discoverability
5. delight

A user should understand the purpose of a page within about 3 seconds.

## Visual principles

### 1. Reduce text
Prefer:
- short title
- one-line description
- clear CTA

Avoid long marketing paragraphs inside application screens.

### 2. Strong hierarchy
Every screen needs:
- one primary action
- one dominant heading
- clear secondary actions

### 3. Whitespace
Use generous spacing. Empty space is intentional.

### 4. Cards are not the default container
Do not put every section inside a bordered card.
Use flat sections, subtle separators, backgrounds, and cards only when grouping improves comprehension.

### 5. Consistent design tokens
Use the existing Tailwind/shadcn tokens whenever possible.
Do not introduce arbitrary colors, shadows, radii, or spacing values.

### 6. Typography
Use a clean sans-serif.
Prefer 2–3 font weights.
Keep headings compact and confident.
Do not use oversized marketing typography inside functional screens.

## Tool catalogue design

The 13-tool catalogue should feel curated, not like an admin table.

Recommended card structure:

icon
title
small category/status tag when useful
short description
subtle metadata
CTA

Do NOT show internal product information such as priority codes like `P0`, `P1`, `P2` to end users unless there is a real user-facing meaning.

Avoid repeating too many labels such as "Lokal" on every card when the information is not useful for choosing a tool.

## Tool card interaction

Desktop:
- subtle border/background transition on hover
- translateY approximately -2px
- icon may move 1–2px
- CTA becomes slightly more prominent
- transition around 180–240ms

Do not:
- scale cards aggressively
- add huge shadows
- make the whole grid bounce
- use gradient animations on every card

## Catalogue layout

Desktop:
- 3 columns is acceptable for the current 13-tool collection
- maintain generous gap and consistent card height

Tablet:
- 2 columns

Mobile:
- 1 column

Do not force equal heights if it creates awkward whitespace; use a consistent card anatomy instead.

## Discovery

Prefer:
- search
- category filters
- featured/recommended tools
- recent tools
- clear "open" actions

Avoid:
- 10+ statistic cards
- dense tables
- unnecessary dashboards

## Color

Use:
- neutral background
- strong foreground
- muted foreground
- subtle border
- one WaliKelas accent
- semantic success/warning/error/info

Accent colors should have meaning.
Do not assign a random bright color to every tool.

## Radius and shadows

Use a small, consistent radius scale.
Prefer subtle shadows only where elevation is meaningful.

Avoid:
- excessive rounded pills
- giant 24–32px cards everywhere
- heavy drop shadows

## Responsive behavior

Mobile is intentionally designed, not a squeezed desktop.

Check:
- touch target size
- text wrapping
- card CTA position
- navigation
- modal/drawer behavior
- horizontal overflow
- reduced animation

## Accessibility

Always preserve:
- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- sufficient contrast
- reduced-motion support

## Before changing a page

1. Understand the user's primary task.
2. Remove unnecessary text.
3. Establish visual hierarchy.
4. Reuse existing components.
5. Use shadcn components where appropriate.
6. Add motion only where it communicates state or interaction.
7. Test desktop and mobile.
8. Preserve all existing functionality and routes.

## Quality gate

Before considering a UI complete, ask:
- Is the primary action obvious?
- Can any text be removed?
- Does anything look like a generic admin template?
- Is there too much card/border repetition?
- Is the page visually calm?
- Does the motion help?
- Does mobile feel designed?
