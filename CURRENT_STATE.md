# CURRENT_STATE.md

## Purpose of this file
This document is the working snapshot of where PetLinkID currently stands. It should be updated regularly so Claude and human contributors are aligned on what is actually true today.

## Confirmed direction
- PetLinkID is being developed as an iOS-first product
- Claude is being set up as a project copilot for ongoing development
- GitHub is being used as the primary source of project code context
- The project is transitioning from scattered chat context toward a cleaner documented setup

## Current working assumptions
These need to be checked against the repository and updated once confirmed:
- The app uses React, TypeScript, Vite and Tailwind
- Supabase is used for auth, database and possibly storage
- Capacitor is used to package the app for iOS
- There is an existing GitHub repo connected into Claude Projects
- The product has at least a partial implementation already in place

## What appears to be in progress
- Setting up persistent project context in Claude Projects
- Creating repo-level instructions through `CLAUDE.md`
- Organising project memory so future chats are more accurate and useful
- Preparing for more structured development and release work

## Likely working areas
- Authentication and session reliability
- Pet profile and record management
- iOS build stability
- Environment configuration and project hygiene
- Release preparation and production hardening

## Known uncertainties
The following items should be verified in the repo and updated here:
- Which features are complete, partial or not started
- Whether Apple Sign In is fully configured and stable
- Whether payments are in scope now or later
- Whether staging and production environments are cleanly separated
- Current database schema maturity
- Current iOS build status in Xcode
- Whether the app is testable end to end today

## Suggested current status summary
Use this as a starter until confirmed:
- Product strategy: defined at a high level
- Core technical direction: mostly defined
- App implementation: in progress
- Production readiness: not yet confirmed
- Documentation maturity: improving but still incomplete
- Release readiness: requires validation

## Immediate next checks
1. Read the repo structure and key config files
2. Confirm the current stack and environment model
3. Verify whether auth works end to end
4. Confirm whether the app builds successfully for iOS
5. Identify the biggest blockers to release
6. Replace assumptions in this file with verified facts

## Update rule
Whenever a major technical decision, build outcome, blocker or release milestone changes, update this file first.

