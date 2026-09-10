# 02 — V1 Scope

## V1 tool set

### Local / utility tools
1. Timer
2. Random Picker
3. Group Maker
4. Scoreboard
5. Teacher Notes

### Interactive tools
6. Live Quiz
7. Live Poll
8. Raise Hand
9. Question Box
10. Brainstorm Board
11. Word Cloud
12. Exit Ticket

### Content tool
13. Flashcards

## Tool priority
### P0 — must be excellent
- Timer
- Random Picker
- Group Maker
- Live Quiz
- Live Poll
- Teacher Notes
- Classroom Session
- Projector Mode
- Student Join

### P1
- Scoreboard
- Raise Hand
- Question Box
- Brainstorm Board
- Exit Ticket
- Word Cloud

### P2
- Flashcards
- advanced templates
- advanced analytics

## Explicitly out of V1
- attendance
- gradebook
- report cards
- school administration
- parent portal
- full LMS
- complex curriculum management
- marketplace
- advertising
- AI-generated teaching content as a core dependency
- native desktop application
- mandatory student account creation

## V1 admin console
- Dashboard
- Users
- Activities/Templates
- Sessions metadata
- Product analytics
- System health
- Audit logs
- Basic system settings

Admin must not automatically gain unrestricted access to private classroom content.

## Authentication
Google OAuth is the only authentication method in V1.

There is no email/password authentication, password reset, email verification, or password management flow.

Teacher authentication is required for saved/persistent functionality and managed sessions. Public/local tools should retain a low-friction path where safe.

Students should be able to join a session using a short-lived code/QR without mandatory account creation.

### Google OAuth requirements
- Use Google OAuth/OIDC.
- Validate OAuth state and nonce where applicable.
- Create/link the local user using the verified Google identity.
- Do not trust frontend-supplied identity or role claims.
- Use secure application sessions after OAuth completes.
- Do not store Google access/refresh tokens unless a future feature explicitly requires them.
- Admin is determined by server-side role/permission, never by client input.

## Monetization readiness
V1 should be subscription-ready at the architecture level, but billing does not need to block core launch. Feature entitlement must be implementable without rewriting tool logic.
