# 14 — V1 Implementation Plan

## Phase 0 — Repository & project setup
- initialize pnpm monorepo
- Next.js web
- NestJS API
- mobile app foundation
- shared packages
- environment strategy
- lint/typecheck/test tooling
- CI baseline

Acceptance:
- clean install
- typecheck/lint/build pass
- apps run independently

## Phase 1 — Product shell & design system
- public landing
- tool discovery
- authenticated teacher shell
- admin shell
- Atomic Design primitives
- responsive foundations
- theme/tokens
- accessibility baseline

Acceptance:
- responsive navigation
- consistent component system
- no duplicated foundational UI

## Phase 2 — Google OAuth, users & classroom context
- Google OAuth/OIDC
- secure OAuth callback
- application session
- teacher profile
- classroom context
- minimal roster model
- authorization
- account settings

Acceptance:
- teacher can securely sign in
- unauthorized classroom access is blocked

## Phase 3 — Local tools
Implement:
- Timer
- Random Picker
- Group Maker
- Scoreboard
- Teacher Notes

Acceptance:
- usable without backend where specified
- projector support
- tests for business logic
- polished UX

## Phase 4 — Session Engine
- session lifecycle
- join code
- QR
- participant management
- WebSocket auth
- reconnect
- event contracts
- session isolation

Acceptance:
- multiple browser clients can join one session
- unauthorized users cannot join/control another session
- reconnect restores authoritative state

## Phase 5 — Interactive tools
Implement:
- Live Quiz
- Live Poll
- Raise Hand
- Question Box
- Brainstorm Board
- Word Cloud
- Exit Ticket

Acceptance:
- all use the same session engine
- realtime state is reliable
- projector/public state is separated from teacher state

## Phase 6 — Projector & classroom UX
- dedicated projector layout
- QR/join experience
- public result views
- fullscreen
- classroom error/reconnect UX

Acceptance:
- readable from typical classroom distance
- no private data leaks

## Phase 7 — Mobile
- student mobile web
- teacher remote Android
- shared contracts
- reconnect behavior

Acceptance:
- student can participate on Android Chrome
- teacher can control supported session actions from Android

## Phase 8 — Saved activities/templates
- activity persistence
- reusable activities
- templates
- basic history

Acceptance:
- teacher can save and reuse supported activities

## Phase 9 — Admin & analytics
- admin dashboard
- users
- templates
- session metadata
- product analytics
- health
- audit logs

Acceptance:
- admin access is role-protected
- sensitive classroom content is not broadly exposed

## Phase 10 — Security, performance & QA hardening
- security testing
- load/realtime testing
- performance budgets
- accessibility audit
- backup/restore verification
- monitoring
- incident/rollback runbook

Acceptance:
- release checklist complete
- no critical security defects
- critical E2E flows pass

## Phase 11 — Production launch
- production environment
- DNS/TLS
- CI/CD
- database migration
- smoke test
- monitoring
- launch

## Definition of Done
A feature is done only when:
- UX implemented
- responsive behavior covered
- authorization covered
- validation covered
- error/loading/empty states covered
- tests added where appropriate
- lint/typecheck pass
- build pass
- documentation updated
- no known critical security/performance issue
