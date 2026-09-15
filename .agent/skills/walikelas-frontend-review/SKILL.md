---
name: walikelas-frontend-review
description: Audit an existing WaliKelas Tools frontend for visual quality, UX clarity, responsiveness, accessibility, component consistency, and motion before or after UI changes.
---

# WaliKelas Tools — Frontend Review

Use this skill whenever the user asks to:
- improve UI/UX
- make a page more modern
- add animation
- redesign a component
- polish an existing page
- review frontend quality

## Important

Do not immediately rewrite code.

First inspect the existing implementation and identify the highest-impact problems.

## Review order

### 1. Product hierarchy
Check:
- Can the user understand the page quickly?
- Is there one primary action?
- Is the page trying to communicate too much?

### 2. Layout
Check:
- spacing
- alignment
- content width
- grid rhythm
- responsive breakpoints
- excessive empty or crowded areas

### 3. Typography
Check:
- heading hierarchy
- line length
- font weight
- text density
- muted text contrast

### 4. Components
Check:
- repeated patterns
- duplicated components
- inconsistent buttons
- inconsistent badges
- inconsistent radius
- inconsistent spacing

### 5. Visual noise
Look specifically for:
- too many cards
- too many borders
- too many badges
- too many colors
- too many icons
- unnecessary labels
- excessive shadows

### 6. Motion
Check:
- whether motion has a purpose
- whether transitions are consistent
- whether animation is too slow
- whether hover states are useful
- whether reduced motion is respected

### 7. Mobile
Check:
- one-column behavior
- touch targets
- wrapping
- navigation
- dialogs/drawers
- CTA visibility
- horizontal overflow

### 8. Accessibility
Check:
- semantic elements
- keyboard access
- focus state
- labels
- contrast
- reduced motion

## Priority model

Classify findings:

P0 = blocks the user or breaks interaction
P1 = significantly hurts usability or visual quality
P2 = polish opportunity

Do not expose internal P0/P1/P2 product labels in the end-user UI.

## Refactor strategy

Fix high-impact issues first.

Preferred order:
1. layout
2. hierarchy
3. typography
4. component consistency
5. spacing
6. interaction states
7. motion
8. decorative polish

Do not start with animation if the underlying hierarchy is weak.

## Final review

Before finishing:
- desktop screenshot/check
- mobile screenshot/check
- inspect hover/focus states
- inspect loading/empty/error/success states
- verify existing functionality
- verify no unnecessary dependency was introduced
