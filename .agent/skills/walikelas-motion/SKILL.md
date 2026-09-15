---
name: walikelas-motion
description: Add tasteful motion to WaliKelas Tools using Framer Motion/Motion for React, GSAP, and Lottie. Use when adding page transitions, hover states, list entrances, generation states, success states, or complex animation sequences.
---

# WaliKelas Tools — Motion System

## Motion philosophy

Motion should communicate:
- hierarchy
- state
- feedback
- continuity
- progress

Motion is not decoration.

The product should feel alive but never noisy.

## Choose the right tool

### Framer Motion / Motion for React
Default choice for:
- React component animation
- page entrance
- list/grid stagger
- hover/tap
- layout transitions
- modal/panel transitions
- presence/exit animation

Use it for most interface motion.

### GSAP
Use only when animation needs:
- complex timelines
- coordinated sequences
- scroll-driven animation
- SVG/path animation
- advanced choreography
- performance-sensitive animation outside normal component transitions

Do not introduce GSAP for simple fades or button hovers.

### Lottie
Use for:
- empty states
- success states
- onboarding moments
- lightweight educational illustrations
- generation completion

Do not put Lottie animations everywhere.

## Default timings

Micro interaction:
120–200ms

Normal UI transition:
180–300ms

Page/section entrance:
250–450ms

Complex sequence:
keep it short and purposeful

Prefer ease-out for entrances.
Avoid slow animations that delay task completion.

## Page entrance

Recommended:
opacity 0 -> 1
translateY 6–12px -> 0

Keep movement subtle.

## Grid/list entrance

Use a small stagger:
- first item immediately
- subsequent items roughly 30–60ms apart
- stop quickly

Do not animate every card with a dramatic spring.

## Hover

Recommended:
- translateY(-1 to -2px)
- border/accent transition
- subtle shadow/elevation
- icon micro-movement

Avoid:
- scale > approximately 1.02
- rotating cards
- bouncing
- exaggerated parallax

## Buttons

Use subtle feedback on hover and tap.

Never make a button jump when clicked.

## Loading

Avoid a generic spinner when the system can communicate meaningful progress.

For AI/tool generation, prefer a staged state:

Creating
→ Preparing
→ Generating
→ Finishing

The exact copy should remain short.

## Success

Use a brief confirmation:
- check icon
- small scale/fade
- optional Lottie only for important moments

Do not make every successful action trigger a celebration.

## Tool catalogue motion

On initial load:
- heading enters first
- filters/search enters second
- tool cards stagger subtly

On hover:
- card lifts slightly
- icon can shift
- CTA becomes clearer

This should create a feeling of polish without slowing discovery.

## Reduced motion

Always respect:
`prefers-reduced-motion`

When reduced motion is enabled:
- remove transform-heavy animation
- shorten transitions
- keep opacity/state changes where useful

## Performance

Prefer transform and opacity.
Avoid expensive layout-triggering animations where possible.

Do not animate large blur/filter effects continuously.

## Animation consistency

Create reusable motion variants/utilities instead of writing random animation values per component.

The product should feel like one motion language.
