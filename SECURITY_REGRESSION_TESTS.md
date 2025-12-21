# Security Regression Tests

## Added Tests
- **Node-based security harness**: `scripts/security-regression.mjs`
  - Validates plan tampering is blocked (PT‑001).
  - Attempts cross‑user pet access (IDOR‑style) and expects no access (PT‑002).
  - Verifies admin-only edge function rejects non‑admin user (PT‑001/role enforcement).
  - Optionally checks public pet lookup with `PUBLIC_PET_TOKEN` (PT‑002).
  - Verifies Supabase auth storage is configured for native secure storage (PT‑004).
- **Security lint**: `scripts/security-lint.mjs`
  - Fails if `dangerouslySetInnerHTML` is introduced outside an allowlist.
  - Fails on obvious token logging patterns.

## How to Run
1) Set required environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `TEST_USER_EMAIL`
   - `TEST_USER_PASSWORD`
   - `ALT_TEST_USER_EMAIL`
   - `ALT_TEST_USER_PASSWORD`
   - Optional: `PUBLIC_PET_TOKEN`

2) Run:
   - `npm run test:security`

## What Each Test Prevents
- **Plan tampering**: Ensures profile plan fields cannot be modified by non‑admin users.
- **IDOR attempts**: Ensures cross‑user pet access returns no rows under RLS.
- **Role bypass**: Ensures admin-only edge functions reject non‑admin users.
- **Public lookup control**: Ensures public pet contact fetch works only with non‑guessable tokens.
- **Storage hardening**: Ensures native storage adapter is configured and localStorage guardrail exists.
- **XSS/logging guardrails**: Prevents unsafe HTML injection and token logging regressions.
