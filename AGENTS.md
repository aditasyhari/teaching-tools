# AGENTS.md — WaliKelas Teaching Tools

## 1. Project Identity

This repository contains **WaliKelas Teaching Tools V1**, a standalone classroom teaching-tools product available at:

`https://tools.walikelas.id`

This product is a separate product from WaliKelas Teacher.

Do not introduce WaliKelas Teacher features such as attendance, grades, report cards, parent communication, school administration, or LMS functionality unless the product documentation is explicitly changed.

---

## 2. Source of Truth

Before implementing anything, read the relevant files under `/docs`.

Required baseline reading:

1. `docs/00-readme.md`
2. `docs/01-product-definition.md`
3. `docs/02-v1-scope.md`
4. `docs/05-technical-architecture.md`
5. `docs/10-security.md`
6. `docs/13-ai-agent-rules.md`
7. `docs/14-implementation-plan.md`

For a specific feature, also read its relevant specification in `docs/`.

The documentation is the product source of truth.

If a requirement is unclear or contradictory:
- do not invent a major product decision;
- identify the conflict;
- prefer the most recent explicit requirement;
- ask for clarification when the decision materially changes architecture or UX.

---

## 3. Current Repository State

The repository currently contains the `docs/` directory only.

Do not assume that `apps/`, `packages/`, configuration files, or application code already exist.

The first implementation phase must establish the repository foundation.

Do not create the complete product in one pass.

---

## 4. Product Scope

V1 contains these tools:

### Local / Utility
- Timer
- Random Picker
- Group Maker
- Scoreboard
- Teacher Notes

### Interactive
- Live Quiz
- Live Poll
- Raise Hand
- Question Box
- Brainstorm Board
- Word Cloud
- Exit Ticket

### Content
- Flashcards

Core product surfaces:

- Public landing/tool discovery
- Teacher Console
- Classroom Session
- Projector Mode
- Student Mobile Web
- Teacher Remote Android
- Admin Console

---

## 5. Authentication

V1 uses **Google OAuth/OIDC only** for teacher and admin authentication.

Do NOT implement:
- email/password login
- password registration
- forgot password
- password reset
- email verification
- local password storage

Students may join classroom sessions using a short-lived session code or QR code without mandatory account creation.

Authentication and authorization must be enforced server-side.

---

## 6. Architecture Principles

### Frontend

Use:
- Next.js
- TypeScript
- feature-based architecture
- Atomic Design for shared UI
- reusable components
- shared design tokens
- strict separation between presentation and business logic

Preferred conceptual structure:

```text
apps/web/
  app/
  components/
  features/
  lib/
  hooks/
```

Shared UI belongs in the appropriate package when the monorepo foundation is established.

### Backend

Use:
- NestJS
- TypeScript
- modular architecture
- clear application/domain/data boundaries

Organize backend modules by domain, for example:

```text
apps/api/
  src/
    auth/
    users/
    classrooms/
    sessions/
    activities/
    quiz/
    poll/
    participants/
    notes/
    templates/
    analytics/
    admin/
    health/
    audit/
```

Do not create giant controllers or services.

### Monorepo

Use pnpm workspaces.

Target structure:

```text
apps/
  web/
  api/
  mobile/

packages/
  ui/
  types/
  config/
  validation/
  api-client/

docs/
```

Do not add packages simply because they are fashionable.

---

## 7. Atomic Design Rules

Atomic Design applies primarily to the shared UI system.

Example:

```text
atoms/
  Button
  Input
  Icon
  Badge

molecules/
  SearchField
  ToolCard
  StudentChip
  JoinCode

organisms/
  ToolGrid
  ClassroomSelector
  SessionHeader
  ParticipantPanel

templates/
  TeacherConsoleLayout
  ToolWorkspace
  ProjectorLayout
```

Do not force feature-specific business logic into Atomic Design folders.

Use feature modules for domain-specific behavior:

```text
features/
  live-quiz/
  live-poll/
  random-picker/
```

Reuse existing components before creating new ones.

Avoid both duplication and premature over-abstraction.

---

## 8. UI / UX Rules

The product must feel like a professional modern teaching product, not an AI-generated SaaS template.

Avoid:
- excessive gradients
- excessive glassmorphism
- floating blobs
- unnecessary decorative illustrations
- random rounded cards
- excessive shadows
- generic dashboard decoration
- visual noise
- animation without purpose

Prioritize:
- clear hierarchy
- fast comprehension
- predictable interaction
- strong typography
- appropriate whitespace
- consistent spacing
- accessible contrast
- responsive behavior
- projector readability

Teacher Console and Projector Mode are different experiences.

Student UI is mobile-first and touch-first.

---

## 9. Realtime Rules

Interactive tools must use one shared Classroom Session Engine.

Do NOT create a separate socket architecture for every tool.

The server is authoritative for:
- session membership
- activity state
- permissions
- scoring
- activity transitions

Every realtime event must:
- be typed;
- be validated;
- be authorized;
- be scoped to the correct session;
- be protected against abuse/replay where applicable.

Implement reconnect handling and authoritative state recovery.

Never trust client-provided:
- role
- score
- classroom ownership
- session ownership
- participant permissions

---

## 10. Security Rules

Security is part of the definition of done.

Always:
- validate input;
- authorize protected operations server-side;
- prevent IDOR;
- sanitize/escape user-generated content;
- protect against XSS;
- use parameterized database access;
- rate-limit abuse-prone endpoints;
- secure OAuth callbacks;
- protect WebSocket events;
- avoid leaking internal errors;
- never log passwords, tokens, or secrets;
- keep secrets out of source control.

Do not disable security controls merely to make local development easier unless the change is explicitly scoped to development configuration.

---

## 11. Performance Rules

Performance is a design requirement.

Prefer:
- server components where appropriate;
- minimal client-side JavaScript;
- lazy loading for heavy tools;
- optimized assets;
- efficient database queries;
- appropriate indexes;
- bounded API payloads;
- no N+1 queries;
- WebSocket events instead of unnecessary polling;
- cleanup of subscriptions/listeners/timers;
- sensible caching.

Do not optimize prematurely based on guesses.

Measure before making complex infrastructure decisions.

---

## 12. Offline / Network Rules

Local tools should remain usable without network access where specified.

Interactive tools depend on the realtime session.

When network connectivity is interrupted:
- show a clear connection state;
- reconnect automatically;
- recover authoritative session state;
- do not silently show stale or incorrect results.

---

## 13. Code Quality

Follow these rules:

- TypeScript strict mode.
- Small, focused modules.
- Single Responsibility.
- Clear naming.
- Explicit types for important boundaries.
- Reusable logic where reuse is real.
- No giant files.
- No god objects/services/controllers.
- No duplicated business rules.
- No unnecessary abstraction layers.
- No dead code.
- No unused dependencies.
- Keep functions easy to test.

Do not refactor unrelated areas while implementing a feature unless necessary.

---

## 14. Data & API Rules

- Use DTO/schema validation.
- Keep API contracts explicit.
- Do not expose database models directly as public API contracts.
- Use pagination for potentially large collections.
- Add indexes based on actual access patterns.
- Enforce ownership and membership at the data-access/application boundary.
- Keep migrations versioned.
- Never manually alter production schema as a substitute for migrations.

---

## 15. Testing Rules

For meaningful functionality, add appropriate tests.

At minimum, cover:
- business logic;
- validation;
- authorization;
- session transitions;
- important realtime behavior;
- critical user flows.

Critical V1 flows must eventually have E2E coverage:

1. Teacher authentication
2. Start local tool
3. Create session
4. Student joins
5. Projector opens
6. Live Quiz
7. Live Poll
8. Reconnect
9. Teacher Remote
10. Teacher Notes

Do not claim a feature is complete if required checks are failing.

---

## 16. Implementation Workflow

For every phase:

### Step 1 — Read
Read the relevant documentation first.

### Step 2 — Inspect
Inspect the existing repository and understand what already exists.

### Step 3 — Plan
Create a concise implementation plan before making significant changes.

### Step 4 — Implement
Make the smallest coherent set of changes required by the phase.

### Step 5 — Verify
Run applicable:
- typecheck
- lint
- tests
- build

### Step 6 — Review
Check:
- security
- responsive behavior
- accessibility
- performance
- duplicated logic
- unintended scope expansion

### Step 7 — Report
Summarize:
- what changed
- files/modules affected
- checks run
- known limitations
- follow-up items

---

## 17. Phase Discipline

Follow `docs/14-implementation-plan.md`.

Do not skip ahead and implement all V1 features simultaneously.

Do not implement:
- realtime tools before the Session Engine is ready;
- mobile before shared contracts are established;
- admin analytics before event instrumentation exists;
- billing before entitlement architecture is required;
- unnecessary infrastructure before traffic/reliability requirements justify it.

Each phase should leave the repository in a working state.

---

## 18. Dependency Discipline

Before adding a dependency, determine:
1. What problem does it solve?
2. Can existing project code solve it cleanly?
3. Is it maintained?
4. Does it increase bundle/runtime complexity?
5. Does it introduce security or licensing concerns?

Prefer fewer, well-understood dependencies.

---

## 19. Database Discipline

Use PostgreSQL and Prisma as specified by the architecture.

Do not:
- create duplicate sources of truth;
- store sensitive information unnecessarily;
- expose internal IDs as public join codes;
- create tables for every transient UI state.

Persistent state and realtime transient state must remain conceptually separate.

---

## 20. Admin Rules

Admin Console is a separate product surface.

Admin role authorization must happen server-side.

Admin features:
- dashboard
- users
- activity/templates
- session metadata
- analytics
- system health
- audit logs
- basic settings

Admin should not automatically have unrestricted access to private classroom content.

---

## 21. Definition of Done

A feature is complete only when applicable:

- product behavior matches documentation;
- UI is responsive;
- loading state exists;
- empty state exists;
- error state exists;
- offline/disconnected state exists where relevant;
- authorization is enforced;
- input validation exists;
- tests are added;
- lint passes;
- typecheck passes;
- build passes;
- accessibility basics are satisfied;
- no critical security issue is introduced;
- documentation is updated when behavior/architecture changes.

---

## 22. Important Agent Behavior

Do not:
- invent features;
- change product scope silently;
- replace architecture without justification;
- remove security checks to fix an error;
- hide failing tests;
- claim success without verification;
- generate huge amounts of code before validating the architecture;
- create placeholder implementations that look finished.

When uncertain about a major architectural or product decision, stop and request clarification rather than making an irreversible assumption.

The goal is not maximum code output.

The goal is a **clean, maintainable, secure, performant, production-quality WaliKelas Teaching Tools V1**.
