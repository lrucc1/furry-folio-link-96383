# PetLinkID Working Memory (Baseline)

Last updated: 2026-04-03

## Product in one line
PetLinkID is an iOS-first pet identity and records app that helps owners manage profiles, health reminders, documents, and recovery-sharing flows from a trusted mobile experience.

## Scope and release posture
- Current emphasis is production hardening and release readiness, not prototype experimentation.
- iOS/TestFlight/App Store readiness is the primary near-term delivery target.
- Web routes primarily support marketing, legal/support pages, and public QR-based pet recovery views.

## Technical baseline
- Frontend: React + TypeScript + Vite + Tailwind + shadcn/Radix UI.
- Data/auth/backend: Supabase (Auth, Postgres, Storage, Edge Functions, migrations).
- Mobile packaging: Capacitor iOS project with Xcode Cloud/manual archive workflows.
- State/data access: React Query + context providers for auth and entitlement state.

## Architecture shape (current)
- Runtime chooses route trees by platform:
  - Native app: protected app experience (pets, reminders, billing/settings, invite flows, admin tools).
  - Web: marketing and support shell with selected shared/public routes.
- Auth is centralized in `AuthContext` and uses Supabase session listeners, plus subscription checks through edge functions.
- Native auth persistence uses biometric/keychain-backed storage with in-memory fallback protections.

## Non-negotiables to preserve
- No secrets committed in source.
- Keep environment separation explicit and validated before release.
- Prioritize safe auth/session behavior and data integrity.
- Keep changes small, reversible, and production-minded.

## Known uncertainty buckets to track continuously
- Environment parity (dev/staging/prod) and final production values.
- iOS production configuration drift and App Store setup details.
- Payment path alignment (Apple IAP readiness and related entitlement flow).
- End-to-end reliability across auth, invites/sharing, reminders, and public pet recovery routes.

## How to use this memory
When starting work, assume this file is the baseline context. Validate assumptions against code and docs, then update this file when architecture, risks, or release posture materially changes.
