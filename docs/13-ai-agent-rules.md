# 13 — AI Agent Engineering Rules

These rules apply to Antigravity or another coding agent.

## Before coding
Read:
- product definition
- V1 scope
- relevant feature specification
- architecture
- data model
- security requirements

Do not invent product behavior when documentation is explicit.

## Implementation rules
1. Use TypeScript strict mode.
2. Keep components small and composable.
3. Follow Atomic Design for shared UI.
4. Keep domain features feature-based.
5. Keep backend modules separated by domain.
6. Reuse existing primitives before creating new ones.
7. Do not duplicate validation between random places.
8. Share schemas/types where appropriate.
9. Avoid giant files.
10. Avoid god services/controllers.
11. Avoid premature generic abstractions.
12. Avoid unnecessary dependencies.
13. Never bypass authorization to make a feature work.
14. Never trust client-provided role, score, classroom, or session ownership.
15. Add tests for non-trivial business logic.
16. Add loading/error/empty states.
17. Ensure projector/private-data boundaries.
18. Keep local tools functional offline where specified.
19. Do not replace working architecture merely for stylistic reasons.
20. Preserve backwards compatibility unless a migration is explicitly planned.

## UI rules
- no generic AI-SaaS visual patterns
- no excessive gradients/glassmorphism
- no random decorative sections
- consistent spacing/type/radius tokens
- meaningful visual hierarchy
- desktop teacher console and projector are different surfaces
- mobile student UI is touch-first

## Performance rules
- avoid unnecessary client components
- lazy-load heavy tools
- avoid waterfall requests
- select only needed database fields
- avoid N+1 queries
- throttle high-frequency realtime events
- clean up subscriptions/listeners

## Security rules
- validate every input
- authorize every protected operation
- sanitize user-generated display content
- do not log secrets
- do not expose internal errors to clients
- rate limit abuse-prone operations
- test session isolation

## Completion protocol
For each implementation phase:
1. inspect current code
2. implement smallest coherent change
3. run typecheck
4. run lint
5. run relevant tests
6. run build when applicable
7. manually verify critical UX
8. summarize files changed and known limitations
9. do not silently skip failing checks
