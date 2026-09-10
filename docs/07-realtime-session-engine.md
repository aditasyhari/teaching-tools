# 07 — Realtime & Classroom Session Engine

## Goal
Provide one reliable realtime foundation for all interactive classroom tools.

## Session lifecycle
```
DRAFT
  ↓
READY
  ↓
LIVE
  ↓
PAUSED
  ↓
LIVE
  ↓
ENDED
  ↓
EXPIRED
```

Transitions must be validated server-side.

## Session responsibilities
- authenticate/authorize teacher
- create and expire sessions
- generate secure short-lived join code
- manage participants
- expose current activity state
- broadcast state changes
- receive participant actions
- validate actions
- handle reconnects
- prevent cross-session access

## Event model
Events should be typed and versioned.

Example:
```
session:joined
session:state
activity:started
activity:paused
activity:resumed
activity:advanced
participant:joined
participant:left
quiz:answer-submitted
poll:response-submitted
hand:raised
question:submitted
brainstorm:response-submitted
session:ended
```

Do not expose internal database structures as socket payloads.

## Server authority
The server is authoritative for:
- session membership
- activity state
- scoring where relevant
- participant permissions
- activity transitions

Never trust client-side score or role claims.

## Reconnect
Client:
1. detects disconnect
2. retries with bounded exponential backoff
3. re-authenticates session
4. receives authoritative current state
5. reconciles local UI

## Duplicate actions
Use action/event IDs or idempotency mechanisms for actions that may be retried.

## Rate limits
Apply limits to:
- join attempts
- response submissions
- question submissions
- brainstorm messages
- repeated control actions

## Privacy
Projector broadcasts only data intended for public display.
Private teacher controls and sensitive metadata stay on authorized channels.

## Scaling
V1 can run on a single API instance if traffic permits. Do not introduce distributed infrastructure prematurely. Design the session layer so an adapter for shared pub/sub can be added later if horizontal scaling becomes necessary.
