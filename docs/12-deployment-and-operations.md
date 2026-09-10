# 12 — Deployment & Operations

## Production domain
`tools.walikelas.id`

Recommended routing:
- `/` public/teacher web
- `/admin` admin console
- `/join/:code` student join
- API under a controlled API prefix/subdomain according to deployment design

## Infrastructure
V1 can run on a Linux VPS:
- reverse proxy
- Next.js process
- NestJS process
- PostgreSQL
- process manager such as PM2
- TLS via Let's Encrypt/Cloudflare as appropriate

Docker is not required.

## Environment
Keep production secrets outside source control.
Root monorepo `.env` can be used consistently if the deployment scripts are designed around it.

Separate:
- local
- staging
- production

## CI/CD
Pipeline:
1. install with frozen lockfile
2. typecheck
3. lint
4. unit/integration tests
5. build
6. deploy
7. migrate safely
8. restart/reload
9. smoke test
10. report deployment status

## Database migrations
- migrations committed
- never edit production database manually for schema changes
- backup before risky migrations
- seed only intentional non-production or safe reference data

## Health checks
API:
- liveness
- readiness
- database connectivity

Application:
- build/version info
- dependency health

## Monitoring
Monitor:
- CPU/RAM/disk
- PostgreSQL
- API p95 latency
- 4xx/5xx
- WebSocket errors
- active sessions
- reconnect rate
- process restarts

## Logging
Structured logs with:
- timestamp
- level
- service
- request ID
- route/event
- duration
- error metadata

No secrets/tokens/passwords.

## Backup
- automated PostgreSQL backup
- retention policy
- off-server copy where feasible
- periodic restore verification

## Deployment rollback
Every deployment should have:
- identifiable version/commit
- migration compatibility plan
- rollback procedure
- smoke tests
