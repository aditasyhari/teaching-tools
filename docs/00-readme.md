# WaliKelas Teaching Tools — V1 Documentation

## Purpose
This documentation package defines the product, UX, architecture, data model, realtime model, security, testing, deployment, and AI-agent implementation rules for WaliKelas Teaching Tools V1.

Product URL: `https://tools.walikelas.id`

## Product principle
Teaching Tools is a standalone classroom-interaction product. It is not WaliKelas Teacher and must not become a small school-management system.

Core experience:

> Guru buka → pilih tool → jalankan → siswa bergabung → aktivitas berlangsung → hasil dapat digunakan/disimpan.

## Documentation order
1. Product definition
2. V1 scope
3. User flows
4. UX/design system
5. Technical architecture
6. Data model
7. Realtime/session engine
8. Tool specifications
9. Multi-device architecture
10. Security
11. Testing/QA
12. Deployment/operations
13. AI-agent rules
14. Implementation plan

## Authentication decision
V1 uses **Google OAuth only** for teacher/admin authentication. Email/password authentication is intentionally excluded to keep onboarding simple and reduce authentication surface area.

## Non-negotiables
- Atomic Design for shared UI.
- Feature-based frontend architecture.
- Modular backend architecture.
- Clean, reusable, strongly typed code.
- Modern, clean UI; no AI-slop visual patterns.
- Projector-first activity presentation.
- Mobile-first student experience.
- Local tools remain usable without a backend connection where technically possible.
- Interactive tools share one Session Engine.
- Authorization is enforced server-side.
- Privacy is designed in from the beginning.
- Do not add dependencies without a clear technical reason.
