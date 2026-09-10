# 09 — Multi-device Architecture

## Device roles

### Teacher Desktop/Web
Primary control surface:
- tool discovery
- classroom context
- activity setup
- session control
- result inspection
- saved activities

### Projector/Web
Presentation surface:
- large text
- activity content
- QR/join code
- public results
- no private controls

### Student Mobile Web
Participation:
- join
- display name
- answer
- vote
- raise hand
- submit question/idea
- completion state

No mandatory app install for participation.

### Teacher Android
Remote:
- session status
- start/pause/resume
- next/reveal
- monitor responses
- quick note
- reconnect to active session

## Shared contracts
Web and mobile consume shared:
- TypeScript types
- validation schemas
- API contracts
- session event definitions

Do not duplicate business rules in mobile.

## Android strategy
V1 can launch with student mobile web and a teacher remote foundation. Native Android capabilities should be introduced only where they materially improve classroom use.

## Deep links
Support join links such as:
`https://tools.walikelas.id/join/<code>`

Validate code server-side.

## Network constraints
Assume:
- weak Wi-Fi
- intermittent mobile data
- device sleep
- browser tab suspension
- reconnects

Local tools must not depend on the network.
Interactive tools must recover state after reconnect.
