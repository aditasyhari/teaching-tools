# 01 — Product Definition

## Product
**WaliKelas Teaching Tools**

## Domain
`tools.walikelas.id`

## Positioning
A practical toolbox for teachers to make classroom activities more active and interactive.

## Target users
### Primary
Teachers who teach one or many classes and need fast tools during lessons.

### Secondary
Students participating in teacher-led activities through mobile web.

### Operational
Product administrators managing users, templates, sessions, analytics, and system health.

## Product boundaries
Teaching Tools does NOT manage:
- attendance
- academic grades
- report cards
- school schedules
- parent communication
- student administration as a primary workflow
- school management

It may consume minimal classroom/participant context when required by an activity.

## Product surfaces
1. Public landing/tool discovery
2. Teacher Console
3. Projector Mode
4. Student Join/Participant experience
5. Teacher Remote on Android
6. Admin Console

## Core product principles
1. Instant utility: tools should be usable with minimal setup.
2. Classroom-first: workflows reflect real teaching moments.
3. Reusable engine: interactive tools share the same session infrastructure.
4. Device-aware: desktop, projector, teacher mobile, and student mobile have distinct UX.
5. Offline-aware: local utilities should degrade gracefully.
6. Privacy by default.
7. Performance before decoration.
8. Accessibility is a product requirement.
9. No feature exists merely because it looks impressive.
10. Reusability without premature abstraction.

## Success criteria for V1
A teacher can:
- open the product quickly;
- start a local tool without complicated onboarding;
- establish an active classroom context when needed;
- start a realtime session;
- display a clean activity on a projector;
- let students join with QR/code;
- receive participant responses reliably;
- control the activity from the teacher console;
- reconnect after transient network problems;
- save/reuse supported activities;
- use teacher notes without leaving the teaching workflow.

## Product validation metrics
Track:
- activation rate
- first tool launch
- first session created
- first student joined
- completed sessions
- weekly returning teachers
- sessions per active teacher
- tool usage by category
- saved/reused activities
- realtime failure rate
- average session duration
