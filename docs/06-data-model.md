# 06 — Data Model

The model should remain minimal and evolve from real requirements.

## Core entities
### User
- id
- email
- password hash when applicable
- role
- status
- timestamps

### TeacherProfile
- user id
- display name
- preferences

### Classroom
- id
- owner/teacher reference
- name
- subject/context optional
- status
- timestamps

### ClassroomMember
- classroom id
- participant/student reference or managed roster identity
- display name
- status
- timestamps

### Session
- id
- classroom id optional
- teacher id
- status
- join code
- started/ended timestamps
- active activity reference
- session metadata

### SessionParticipant
- session id
- participant identity
- display name
- connection/status metadata
- joined/left timestamps

### Activity
- id
- owner
- type
- title
- configuration JSON validated by tool schema
- visibility/status
- timestamps

### ActivityTemplate
- id
- type
- title
- configuration
- published/status
- version

### Tool-specific persisted data
Only create dedicated tables when queryability, reporting, or relational integrity justifies them. Responses may use normalized tables for high-value interactive tools.

## Notes
TeacherNote:
- id
- owner
- scope (personal/classroom)
- classroom id nullable
- title/body
- pinned
- timestamps

## AuditLog
- id
- actor
- action
- target type/id
- metadata
- timestamp
- request id

## Index principles
Index:
- foreign keys used in filtering
- session join code (unique while active)
- session status + timestamps
- activity owner + updated timestamp
- note owner/scope
- audit timestamp + actor

Avoid indexing every field.

## Data retention
Define retention per data class before launch:
- active session state
- historical responses
- analytics events
- audit logs
- deleted accounts

Never retain sensitive classroom content indefinitely without a reason.
