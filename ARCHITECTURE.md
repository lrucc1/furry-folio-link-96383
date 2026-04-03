# ARCHITECTURE.md

## Purpose
This document captures the current technical architecture of PetLinkID. It should reflect verified architecture decisions and highlight any assumptions that still need confirmation.

## High-level architecture
PetLinkID is expected to use a modern web-to-mobile stack:
- Frontend application built in React with TypeScript
- Build tooling via Vite
- UI styling via Tailwind CSS
- Backend services via Supabase
- Mobile packaging for iOS via Capacitor

## Expected system layers

### 1. Client application
Responsible for:
- User interface
- Navigation and mobile-first user flows
- Form handling and validation
- Session-aware rendering
- Pet profile and record management screens

### 2. Backend services
Expected responsibilities:
- Authentication
- Database storage
- File or image storage if media uploads are supported
- Possibly row-level security and API access controls

### 3. Mobile wrapper
Capacitor likely provides:
- iOS packaging
- Native bridge functionality where needed
- App build and deployment support through Xcode

## Expected technology stack
This section should be verified against the repo.

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Capacitor
- Xcode / iOS build tooling

## Likely functional modules
These should be adjusted once the codebase is reviewed:
- Authentication and account
- Onboarding
- Pet profiles
- Pet records or passport-style records
- Media or document upload and storage
- Settings and account management
- Support, help or static information pages

## Expected auth flow
Working assumption until confirmed:
1. User signs up or signs in
2. Supabase auth issues a session
3. Session is stored and restored on app launch
4. Protected screens require valid authentication state
5. Sign-out clears local session state cleanly

## Expected data areas
Working assumption until confirmed:
- User accounts
- Pet profiles
- Pet attributes and identification details
- Record or passport-related entries
- Uploaded files, images or supporting assets
- App configuration or reference data

## Environment model
This should be verified and tightened if not already in place.

Recommended model:
- Development environment
- Staging or test environment
- Production environment

Rules:
- No shared secrets in code
- Environment variables clearly separated
- Production services never reused casually for testing
- Build and deployment targets clearly identified

## iOS layer
Likely responsibilities:
- Native project generated or maintained through Capacitor
- App signing and provisioning
- Native plugin configuration
- Apple Sign In if enabled
- Camera, file access or notification permissions if needed

## Recommended repo-level architecture checks
Claude should inspect and confirm:
- `package.json`
- `src/`
- `supabase/`
- `capacitor.config.*`
- `ios/`
- `.env.example` or equivalent
- any auth, storage or routing modules

## Architectural risks to verify
- Session persistence and token refresh handling
- Environment separation
- Native iOS config drift from web app config
- Incomplete error handling in critical flows
- Hidden dependency on hardcoded URLs or keys
- Data model gaps for future passport-style features

## Documentation rule
Once a technical decision is confirmed in code, replace assumptions here with verified details.

