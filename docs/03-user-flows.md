# 03 — User Flows

## Teacher: first visit
Landing → choose tool → use immediately when possible → optional sign-in to save.

## Teacher: classroom session
1. Sign in.
2. Select Active Classroom if the tool requires classroom context.
3. Create/open activity.
4. Start Classroom Session.
5. Generate join code + QR.
6. Open Projector Mode if needed.
7. Students join.
8. Teacher starts activity.
9. Students interact.
10. Teacher controls/reveals results.
11. End activity or switch activity.
12. Optionally save results/activity.

## Student
1. Scan QR or open join URL.
2. Enter session code if not embedded in URL.
3. Enter display name where required.
4. Join.
5. Wait for teacher.
6. Participate.
7. Receive completion state.
8. Leave when session ends.

## Teacher remote
1. Teacher starts session on desktop.
2. Android remote connects to same authenticated session.
3. Remote shows compact state and controls.
4. Teacher can pause, continue, reveal, next, and monitor supported actions.
5. If remote disconnects, desktop session continues.

## Projector
Projector is a presentation surface, not an admin UI.
- high contrast
- large typography
- minimal controls
- no private participant data unless intentionally revealed
- clear join code/QR before activity starts
- responsive to projector resolutions

## Active Classroom
Active Classroom is context, not a management system.
A teacher can switch among classes they are authorized to use.
Only minimum required roster/context should be exposed to tools.

## Notes
Personal Note:
- independent of class.

Classroom Note:
- associated with a classroom context.

Quick Note:
- fast capture from an active tool/session.
