# 05 — Technical Architecture

## Recommended stack
- Web: Next.js + TypeScript
- API: NestJS + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Realtime: WebSocket layer (Socket.IO or equivalent selected deliberately)
- Monorepo: pnpm workspaces
- Android: React Native/Expo or equivalent, sharing types/contracts and design principles with web
- Deployment: Linux VPS, reverse proxy, process manager; no Docker required for V1

## Monorepo
```
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

## Web architecture
- App Router
- server components by default where appropriate
- client components only when interactivity requires them
- feature-based modules
- shared design system
- typed API client
- route-level loading/error boundaries
- lazy loading for heavy tool modules

## Backend architecture
NestJS modules:
```
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

Do not create one giant admin controller/service or one giant tool service.

## Layering
Controller → application/service → domain logic → repository/data access.

Keep transport concerns separate from business rules.

## Authentication architecture
- Google OAuth/OIDC only for teacher/admin authentication.
- Application session is managed by the backend after successful OAuth.
- Google identity is mapped to a local User record.
- Role/authorization is determined server-side.
- No password storage or password-reset subsystem exists in V1.

## API
- versioned API prefix
- DTO validation
- consistent error envelope
- request IDs
- pagination for collections
- idempotency where needed
- rate limits on abuse-prone endpoints

## Realtime
One Session Engine supports interactive tools.
Tool-specific code describes state and rules; it does not implement an independent socket architecture.

## State
Distinguish:
- persistent state: database
- session state: realtime/in-memory with durable checkpoints where necessary
- local-only state: browser/device

## Performance
- avoid unnecessary client bundles
- lazy-load heavy tools
- optimize fonts/images
- database indexes based on actual access patterns
- avoid N+1 queries
- use bounded payloads
- throttle high-frequency events
- use WebSocket instead of polling for realtime state
- clean up expired sessions

## Reliability
- reconnect with backoff
- server-authoritative activity state
- duplicate event protection
- heartbeat/connection health
- session expiry
- graceful handling of participant disconnects

## Observability
- structured logs
- request IDs
- error monitoring
- API latency metrics
- WebSocket connection/error metrics
- database health metrics
- product usage events
