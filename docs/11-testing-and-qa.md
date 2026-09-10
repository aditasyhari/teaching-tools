# 11 — Testing & QA

## Test pyramid
### Unit
- state transitions
- scoring
- validation
- group generation
- timer logic
- permissions
- utility functions

### Integration
- auth
- classroom access
- session lifecycle
- activity persistence
- API authorization
- database constraints

### Realtime
- join/leave
- reconnect
- duplicate action
- unauthorized event
- teacher control
- concurrent responses
- session expiry

### E2E
Critical flows:
1. landing → tool → use
2. teacher login
3. create session
4. student joins by code
5. projector opens
6. live quiz end-to-end
7. poll end-to-end
8. session reconnect
9. teacher remote control
10. notes save/search

## Device matrix
Minimum:
- Chrome desktop
- Edge desktop
- Safari where supported
- Android Chrome
- representative low/mid-range Android device
- projector/TV resolution tests

## Performance budgets
Define measurable budgets before launch:
- initial page performance
- JS bundle size for core routes
- API p95 latency
- realtime event latency
- join/session creation latency

Do not optimize based only on subjective feel.

## Accessibility QA
- keyboard-only pass
- screen-reader smoke tests
- contrast
- focus
- reduced motion
- touch target checks

## Security QA
- authorization tests
- IDOR tests
- XSS payload tests
- rate-limit tests
- invalid socket event tests
- session isolation tests

## Release gate
No V1 release if:
- core E2E flows fail
- critical security issue exists
- realtime session cannot recover from transient disconnect
- projector view leaks private data
- teacher cannot recover from common user mistakes
