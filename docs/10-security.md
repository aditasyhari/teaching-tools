# 10 — Security Requirements

Security is a V1 acceptance criterion.

## Authentication
V1 uses Google OAuth/OIDC only. There is no local password authentication.

Requirements:
- validate OAuth state
- validate OIDC nonce where applicable
- verify the identity using the provider's trusted response
- securely handle the OAuth callback
- securely create/link the local user from the verified Google identity
- use a secure application session after authentication
- HttpOnly cookies where cookie sessions are used
- Secure cookies in production
- appropriate SameSite policy
- account/session revocation
- rate limit authentication endpoints
- protect OAuth callback and login flows against abuse
- do not store provider access/refresh tokens unless explicitly required
- never trust client-provided role or identity claims

## Authorization
Every protected resource must verify:
1. authenticated identity
2. role/permission
3. ownership or classroom/session membership

Never rely on frontend route guards alone.

## IDOR prevention
Never assume a user may access an object because they know its ID.
Check ownership/membership on every relevant API and socket action.

## Input security
- validate all request bodies, params, and query values
- constrain string lengths
- sanitize/escape user-generated content for display
- prevent XSS
- parameterized ORM queries
- reject malformed realtime payloads

## Realtime security
- authenticate socket connection
- authorize room/session membership
- validate every event
- prevent joining arbitrary sessions
- rate limit abuse-prone events
- prevent teacher-only events from student clients

## Join codes
- high enough entropy
- short-lived where appropriate
- rate-limited attempts
- invalidated when session ends
- never expose internal IDs as join codes

## CSRF
Use an architecture-appropriate CSRF defense for state-changing cookie-authenticated requests.

## Security headers
Configure appropriate:
- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- frame-ancestors / embedding policy as needed for projector/join flows

## Secrets
- no secrets in source
- no secrets in client bundles
- production secrets in environment/secret management
- rotate credentials when compromised

## Privacy
Collect minimum participant information.
Avoid exposing student identity publicly unless needed.
Do not make admin analytics equivalent to unrestricted classroom surveillance.

## Audit
Log security-sensitive admin/account actions.
Never log passwords, tokens, or sensitive payloads.

## Dependencies
- lockfile committed
- vulnerability scanning
- remove unused packages
- review major dependency upgrades

## Abuse controls
Rate limit:
- login
- join
- question submissions
- brainstorm/word-cloud submissions
- session creation
- admin actions

## Backup
PostgreSQL backups must be automated and periodically restore-tested.
