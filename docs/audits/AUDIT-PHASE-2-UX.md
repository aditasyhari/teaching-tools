# UX & Classroom Usability Audit

**Audit Date**: 14 September 2026  
**Auditor Roles**: Senior Product Designer, UX Researcher, Classroom Technology Specialist & Senior Frontend Engineer  
**Product**: WaliKelas Teaching Tools V1 (`https://tools.walikelas.id`)  
**Scope**: Real Teacher Workflow, Classroom Operations, Multi-Device UX, and Design System Integrity

---

## Executive Summary

This Phase 2 UX Audit simulated and stress-tested **WaliKelas Teaching Tools V1** from the perspective of a real teacher conducting an active classroom lesson under realistic conditions: standing at the front of a classroom, operating a laptop or mobile device under time pressure, and managing 30+ students on mobile devices.

### Primary Question Answered
> *"If I am a teacher who has never used WaliKelas Teaching Tools before, can I understand and operate this product without needing technical assistance?"*

**Answer**: **Yes, for local utilities and basic session creation; but with notable friction and confusion during live multi-activity classroom switching.**

A first-time teacher can launch local tools (Timer, Random Picker, Group Maker) in **under 5 seconds with zero configuration**, and can create an active classroom session in **under 20 seconds**. The Indonesian educational terminology is natural, the typography is clear, and the student join flow is straightforward.

However, once a session is active, significant UX bottlenecks emerge:
1. **Modal Fragmentation**: 5 interactive tools (Question Box, Raise Hand, Brainstorm, Exit Ticket, Timer) open as full modal dialogs, blocking the teacher's view of student rosters and other ongoing activities, and preventing simultaneous multi-tool usage.
2. **Action Overcrowding in Hero Banner**: 8 large buttons (including the destructive "Akhiri Sesi Kelas") are jammed into a single header card.
3. **Broken Projector Navigation**: The "Mode Proyektor" button links to `/projector/demo` which results in a 404 error.
4. **Participant Mobile Tab Clutter**: 5 activity tabs wrap awkwardly into 2–3 rows on standard 360px mobile viewports, obscuring the primary content when mobile keyboards open.
5. **No Auto-Switching on Student Devices**: When the teacher starts a Quiz or Poll, students on another tab receive only a subtle badge/ping and are not automatically guided to the active activity.

**Final UX Verdict**: **NEEDS REMEDIATION**

---

## Teacher Journey

### 1. Discovery & Onboarding
- **Flow**: Visits landing page (`/`) &rarr; Clicks "Mulai Mengajar" &rarr; Logs in via Google OAuth &rarr; Arrives at `/teacher`.
- **Experience**: Fast, welcoming, and intuitive. Login via Google OAuth is standard for teachers in Indonesia (e.g., `belajar.id`).
- **Friction**: The Teacher Dashboard displays hardcoded fake statistics (`42 Pertanyaan Kuis`, `8 Aktivitas`) that do not change when the teacher creates content.

### 2. Session Setup
- **Flow**: Clicks "Mulai Sesi Baru" &rarr; Enters session title (e.g. "Kelas 8A - IPA") &rarr; Clicks "Buat Sesi Sekarang".
- **Experience**: Takes **3 clicks** and **~15 seconds**. Redirects immediately to `/teacher/sessions/[id]`.
- **Strengths**: Giant 6-character join code, 1-click "Salin Kode" and "Salin Link" buttons, and clean participant roster grid with live online indicators.

### 3. Live Activity Management
- **Flow**: Starting activities while teaching.
- **Experience**:
  - **Live Quiz & Live Poll**: Excellent inline HUD. Renders directly in page flow, allowing teacher to monitor both question progress and student roster.
  - **Question Box, Raise Hand, Brainstorm, Exit Ticket, Timer**: Each opens as a modal dialog that covers the entire screen. If a student raises a hand while the teacher is reviewing Brainstorm ideas, the teacher cannot see or interact with the hand queue without closing the Brainstorm modal first.
  - **Accident Risk**: The red "Akhiri Sesi Kelas" button sits directly adjacent to the Timer button in the hero bar. A rushed click can trigger the end-session modal during a live activity.

---

## Participant Journey

### 1. Joining
- **Flow**: Student opens `tools.walikelas.id/join` or scans QR &rarr; Enters code & name &rarr; Clicks "Masuk ke Kelas".
- **Experience**: Fast and frictionless. No registration, no password, no email collection.
- **Strengths**: Code auto-uppercased; auto-focuses on name if code is provided via URL parameter (`/join/[code]`).

### 2. Waiting Room
- **Flow**: If session is in `WAITING` state, student sees "Ruang Tunggu: Menunggu Guru Memulai Sesi" with participant counter.
- **Experience**: Reassuring and clear.

### 3. Participating in Activities
- **Active Quiz**: Clean, large colored option cards (A, B, C, D) with immediate submission lock and instant feedback upon question completion.
- **Active Poll**: Single-choice polls submit instantly on tap; multiple-choice polls have explicit checkbox toggles.
- **Raise Hand**: Excellent feedback. Displays queue position (`#2 dalam antrean`), animated speaking banner (`Giliran Anda Berbicara!`), and clear "Selesai Berbicara" button.
- **Question Box**: Intuitive composer with anonymous toggle and "Sedang Dibahas Guru" pin.
- **Brainstorm Board**: Sticky-note layout with approval/visibility indicators.
- **Exit Ticket**: 1–5 scale star/number picker, clean radio cards, and character-counted feedback box.

### 4. Gaps in Participant UX
- **No Automatic Tab Navigation**: If a student is in "Tanya Guru" and the teacher launches a Live Quiz, the student remains on "Tanya Guru" with only a subtle pulsating dot on "Aktivitas Kelas". Many students miss the start of the quiz.
- **Tab Reload Data Loss**: Refreshing the browser resets the component state to unjoined, requiring the student to re-enter their name.

---

## Click / Interaction Analysis

| Task | Clicks | Modals | Time-to-Action | Cognitive Complexity | Rating |
|---|---|---|---|---|---|
| **Launch Local Timer** | 1 | 0 | 2s | Minimal (0 decisions) | Excellent |
| **Pick Random Student** | 1 | 0 | 3s | Minimal | Excellent |
| **Make Balanced Groups** | 2 | 0 | 5s | Low | Excellent |
| **Start Classroom Session** | 3 | 1 | 15s | Low (1 text input) | Good |
| **Launch Live Poll** | 3 | 1 | 10s | Low (Select preset/poll) | Good |
| **Launch Live Quiz** | 3 | 1 | 12s | Low (Select quiz) | Good |
| **Start Classroom Timer** | 4 | 1 | 8s | Low (Select preset & start) | Fair (Modal blocks view) |
| **Moderate Raised Hand** | 2 | 1 | 6s | Medium (Requires opening modal) | Fair |
| **Launch Brainstorm Board** | 4 | 1 | 25s | Medium (Must type prompt live) | Fair |
| **Launch Exit Ticket** | 3 | 1 | 12s | Low (Uses 1-click preset) | Good |
| **Switch Between Activities** | 4–6 | 2 | 15–20s | High (Close modal, open next modal) | Poor |

---

## Cognitive Load Issues

1. **Modal-Hopping Mental Overhead**:
   - In a dynamic classroom, a teacher needs to monitor the Speaking Queue, check the Classroom Timer, and see Brainstorm ideas simultaneously. Because each is an isolated modal, the teacher must constantly open, close, and re-open modal windows.
2. **Visual Clutter in Hero Banner**:
   - Placing 8 separate primary action buttons inside one dark indigo card overwhelms the teacher. There is no visual hierarchy separating primary teaching activities (Quiz/Poll) from persistent background tools (Timer/Hands).
3. **Proximity of Destructive Action**:
   - The red "Akhiri Sesi Kelas" button is colocated with normal activity buttons, inducing anxiety about terminating the class prematurely.
4. **Live Prompt Writing Under Pressure**:
   - Brainstorm Board has no pre-saved templates. A teacher has to stand in front of the class and type out prompts on the fly.

---

## Navigation Issues

1. **Dead Link to Projector Mode (404)**:
   - In `TeacherLayout`, `<a href="/projector/demo">` in the top bar and user menu navigates to a non-existent page, breaking teacher expectations for secondary displays.
2. **Missing In-Session Projector Toggle**:
   - Inside `/teacher/sessions/[id]`, there is no direct button to "Buka Tampilan Proyektor" that opens a projector-safe presentation window with large text and clean QR code.
3. **Navbar Overlap on Mobile**:
   - The desktop sidebar correctly hides on mobile, but the bottom navigation bar (`MobileNavigation`) overlaps with bottom elements on some mobile screens.

---

## Mobile UX Audit (360px, 390px, 412px)

### 360px (Entry Android / Low-Cost Mobile Devices)
- **Join Screen**: Well-proportioned; input text size prevents iOS/Android zoom.
- **Session Navigation Tabs**: 5 tab buttons wrap into 3 jagged rows, consuming ~110px of vertical space before any content is visible.
- **Keyboard Pop-up Obstruction**: When typing in "Tanya Guru" or "Papan Ide", the on-screen keyboard consumes 50% of the screen, pushing the submit button off-screen.
- **Touch Targets**: All quiz options and poll bars meet the minimum 48px touch target standard.

### 390px & 412px (Standard Modern Smart Devices)
- **Layout**: Clean spacing and balanced typography.
- **Animations**: Subtle and performant.

---

## Empty / Loading / Error Issues

### Strengths
- **Empty States**: Every panel features descriptive empty states (e.g. "Belum Ada Ide Masuk", "Menunggu Peserta Bergabung", "Belum Ada Pertanyaan").
- **Error Banners**: Clearly styled with red borders, warning icons, and dismiss buttons.
- **Offline / Reconnect Indicator**: The `Wifi` / `WifiOff` pill in the header provides immediate visibility into network status.

### Deficiencies
- **Silent Submission Failure**: If network drops while a student is answering a quiz, the client does not clearly differentiate between "Submitting..." and "Failed to reach server, tap to retry".
- **Unreachable Error Messages**: If an error occurs inside a modal that was just closed, the error toast is hidden from the teacher.

---

## Consistency Issues

1. **Inline HUD vs. Modal Dialog Inconsistency**:
   - Quiz and Poll render as inline, in-page HUDs that preserve the surrounding dashboard context.
   - Question Box, Raise Hand, Brainstorm, Exit Ticket, and Timer render as full-screen modal overlays that obliterate the dashboard context.
2. **Submission Paradigms for Students**:
   - Live Poll (single-choice) submits immediately upon tapping an option.
   - Live Quiz requires tapping an option, which locks in after a slight delay.
   - Exit Ticket requires scrolling to the bottom and clicking a primary submit button.
3. **Color Coding**:
   - Overall color-coding is consistent (Indigo for Quiz, Blue for Poll/Timer, Amber for Hands/Questions, Violet for Brainstorm).

---

## Anti-AI-Slop Findings

1. **Hero Card Button Congestion**:
   - The dark gradient card in `TeacherSessionView` attempting to hold 8 distinct actions looks like an AI-generated template where every feature was appended to a single flex container without interaction hierarchy.
2. **Dashboard Static Vanity Metrics**:
   - Hardcoded metrics on `/teacher` ("42 Bank Soal", "+12% minggu ini") mimic generic SaaS marketing templates rather than practical teaching tools.
3. **Visual Language Compliance**:
   - The UI successfully avoids floating blobs, purple glassmorphism, gratuitous 3D shapes, and decorative animations. The design system is clean, professional, and accessible.

---

## Severity Classification

### P1 — High Priority (Classroom Impact)
1. **Modal Fragmentation**: Teachers cannot monitor Speaking Queue or Timer while managing Brainstorm or Exit Ticket.
2. **Missing Projector Mode & 404 Link**: Teachers cannot safely project activities without exposing their console.
3. **Lack of Auto-Navigation for Active Activities**: Students on other tabs do not automatically switch to a newly launched Quiz or Poll.
4. **Accidental End Session Risk**: "Akhiri Sesi Kelas" is visually grouped with daily activity triggers.

### P2 — Medium Priority (Friction & Polish)
5. **Mobile Tab Wrapping on 360px Devices**: 5-tab bar clutters student viewports on budget smartphones.
6. **Live Typing Requirement for Brainstorm**: Lack of pre-saved prompts forces teachers to type under live classroom pressure.
7. **Static Dashboard Vanity Metrics**: Mock stats diminish trust in the Teacher Console.
8. **Student Re-login on Page Refresh**: Accidental reload forces re-entry of name.

### P3 — Low Priority (Minor Refinement)
9. **Inconsistent In-Page vs. Modal Activity HUDs**: Aligning all activities into a consistent workspace layout.
10. **Toast Error Persistence**: Ensuring background errors remain visible across view changes.

---

## Recommended Improvements

| Rank | Priority | Improvement | Classroom Rationale | Effort |
|---|---|---|---|---|
| **1** | P1 | **Separate Background Tools from Primary Activities** | Move Timer, Raise Hand, and Question Box to a persistent side drawer or compact utility floating bar, leaving the main workspace for the active activity (Quiz, Poll, Brainstorm, Exit Ticket). | Medium |
| **2** | P1 | **Build Dedicated Projector Mode (`/sessions/[id]/projector`)** | Provide a clean, high-contrast, presentation-only view with join code, QR, and active activity visuals. | Medium |
| **3** | P1 | **Relocate "Akhiri Sesi Kelas"** | Move destructive end-session button away from activity launchers into a separate secondary header action with a distinct confirmation guard. | Low |
| **4** | P1 | **Implement Active Activity Auto-Focus for Students** | When a teacher starts a Quiz, Poll, or Exit Ticket, automatically switch the student's active tab to that activity, displaying a dismissible toast if they were typing a question. | Low |
| **5** | P2 | **Optimize Mobile Tab Bar (Segmented / Icon Carousel)** | On viewports $\le 390\text{px}$, replace text-heavy tab pills with a compact horizontal scrollable tab bar or icon bar with badges. | Low |
| **6** | P2 | **Persistent Participant Storage** | Store `joined`, `displayName`, and `code` in `sessionStorage` to survive mobile browser tab reloads. | Low |
| **7** | P2 | **Pre-Saved Brainstorm & Reflection Templates** | Allow teachers to select from common classroom prompts (e.g. "Kuis Apersepsi", "Ide Proyek", "Pertanyaan Pemantik") in 1 click. | Medium |
| **8** | P2 | **Dynamic Teacher Dashboard Stats** | Replace static numbers with real counts from user database records. | Low |

---

## Final UX Score

| Dimension | Score (1–10) | Evaluation Notes |
|---|---|---|
| **Teacher Usability** | **7.5 / 10** | Very intuitive to start; high cognitive load during multi-activity switching. |
| **Participant Usability** | **8.5 / 10** | Clear, clean, and engaging for students; hampered by lack of auto-switching. |
| **Speed of Operation** | **8.0 / 10** | Local tools and session creation are instant; activity switching requires too many clicks. |
| **Clarity & Language** | **9.0 / 10** | Outstanding Indonesian pedagogical copy; no confusing tech jargon. |
| **Consistency** | **7.0 / 10** | Discrepancy between inline HUDs and modal popups. |
| **Mobile Usability** | **7.5 / 10** | Touch targets are great; tab wrapping and keyboard occlusion on 360px need polish. |
| **Overall UX Score** | **7.9 / 10** | Solid foundation, needing classroom operational refinement. |

---

## Final Assessment

### Verdict: **NEEDS REMEDIATION**

While the aesthetic direction, typography, and local utilities are exceptionally well-executed, the interactive classroom experience requires remediation to eliminate modal fragmentation, protect against accidental session termination, provide a working projector display, and ensure seamless student mobile navigation during live teaching.

