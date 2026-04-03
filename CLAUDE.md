# CLAUDE.md

## Project
PetLinkID is an iOS-first pet identity and pet passport application.

Primary goals:
- stable product behaviour
- clean mobile UX
- safe authentication and data flows
- efficient release preparation
- production-ready quality rather than demo quality

## Product context
PetLinkID should feel trustworthy, simple, premium, and easy for everyday pet owners to use.

The app may involve:
- pet profiles
- pet passport-style records
- account management
- secure data storage
- mobile onboarding flows
- App Store release preparation

## Stack
- React
- TypeScript
- Vite
- Tailwind
- Supabase
- Capacitor
- iOS / Xcode

## How to work in this repo
- Inspect existing patterns before introducing new ones.
- Prefer small, targeted, reversible edits.
- Avoid changing unrelated files.
- Do not invent missing config values, secrets, environment variables, database fields, or requirements.
- If something is unclear, inspect the codebase first and state assumptions clearly.
- Preserve existing working behaviour unless there is a strong reason to change it.
- Treat this as a real production product, not a prototype.

## Output expectations
When completing a task:
1. Summarise the issue.
2. Identify the likely root cause.
3. Propose the safest implementation.
4. List the exact files to change.
5. Provide validation or test steps.
6. Note any risks, follow-up work, or unknowns.

For larger tasks:
- Start with a short implementation plan.
- Avoid major refactors unless clearly justified.
- Prefer repo-specific advice over generic guidance.

## Coding preferences
- Keep code readable and maintainable.
- Use clear and consistent naming.
- Follow the existing folder structure unless there is a strong reason to improve it.
- Avoid unnecessary abstraction.
- Keep components focused and practical.
- Handle loading, empty, and error states clearly.
- Prioritise reliability and shipping speed over cleverness.

## Product expectations
- Think mobile-first.
- Optimise for user trust and clarity.
- Keep flows simple and low-friction.
- Use plain-English copy.
- Prefer practical UX improvements that help real users complete tasks quickly.

## Safety and security
- Never hardcode secrets.
- Never expose sensitive keys.
- Use placeholders where credentials are missing.
- Flag risks early around authentication, payments, storage, build config, and production data.
- Respect separation between development, staging, and production environments.

## If uncertain
State assumptions clearly and inspect the repo before recommending major changes.
