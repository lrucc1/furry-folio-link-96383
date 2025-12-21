# Remediation Plan

## Priority Fix Plan
### Critical / High
1) **PT-001: Prevent plan tampering**
   - Add server-side trigger guarding plan/entitlement fields.
   - Verify non-admin updates are rejected.

2) **PT-002: Harden public pet lookup**
   - Replace predictable `public_id` with non‑guessable `public_token` for public routes.
   - Add rate‑limit tracking and throttling in the edge function.

3) **PT-003: Bind Apple receipts to users**
   - Enforce bundle ID validation in receipt verification.
   - Persist `original_transaction_id` per user and block cross‑account reuse.

### Medium
4) **PT-004: Web session storage hardening**
   - Enforce native secure storage (Keychain/Keystore via `capacitor-native-biometric`).
   - Ship CSP/security headers and lint guardrails for XSS/token logging.
   - Consider moving web auth sessions to HTTP‑only cookies as a future enhancement.

## Owner / Action Checklist
- [ ] Verify env vars: `APPLE_IAP_BUNDLE_ID`, product IDs, and shared secret are set for edge functions.
- [ ] Backfill `public_token` for existing pets and re‑issue any QR links if required.
- [ ] Run security regression tests (`npm run test:security`) in dev/staging.
- [ ] Apply `public/_headers` or equivalent host configuration for CSP/security headers.
- [ ] Confirm App Store disclosures reflect Apple IAP validation and token storage choices.

## Verification Steps
- Run `npm run test:security` with test user credentials.
- Validate that updating profile plan fields as a normal user fails.
- Confirm public pet endpoints only work with `public_token` and are rate‑limited.
- Validate Apple receipt reuse is blocked across accounts.
