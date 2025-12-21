# Security & Release Audit (iOS App Store)

## Executive summary (GO/NO-GO)
**GO**, pending configuration of the new `CRON_SECRET` for scheduled Supabase functions and re-running dependency audits in the release environment. All identified Critical/High issues in this repository are remediated in code.

## Repo inventory & detected stack (brief)
- **Frontend**: Vite + React + TypeScript (`src/`, `vite.config.ts`)
- **Mobile wrapper**: Capacitor (`capacitor.config.ts`, `ios/`)
- **Backend**: Supabase (Edge Functions in `supabase/functions/`, migrations in `supabase/migrations/`)
- **Auth**: Supabase Auth (`src/integrations/supabase/client.ts`, `src/pages/Auth.tsx`)
- **Payments**: IAP via `cordova-plugin-purchase` (see `package.json`)
- **Push notifications**: Capacitor Push (`src/lib/pushNotifications.ts`)
- **Storage**: Supabase Storage for pet documents/photos
- **Analytics/SDKs**: Google Maps JS API for address/vet autocomplete (`src/components/AddressAutocomplete.tsx`, `src/components/VetClinicAutocomplete.tsx`)

## Automated checks summary
- `npm audit --audit-level=high` failed due to registry access (403). See **SEC-006** for follow-up.

## Top risks ranked
1. **Public pet contact data exposure** (fixed) — owner contact data was available for non-lost pets.
2. **Auth token storage on iOS** (fixed) — tokens previously stored in UserDefaults.
3. **Unauthenticated cron/admin functions** (fixed) — scheduled functions could be triggered by anyone.
4. **Unauthenticated contact email relay** (fixed) — contact function was open to abuse.
5. **Missing iOS privacy manifest** (fixed) — App Store blocker.

## Remediation checklist
- [x] Gate public pet contact info to lost pets only (SEC-001).
- [x] Move native auth storage into Keychain-backed storage (SEC-002).
- [x] Add cron secret requirement for scheduled functions + update cron schedule (SEC-003).
- [x] Require auth for contact email + remove PII logging (SEC-004).
- [x] Add PrivacyInfo.xcprivacy manifest (SEC-005).
- [ ] Configure `CRON_SECRET` in Supabase Edge Function secrets and DB setting (`app.settings.cron_secret`) before release (SEC-003).
- [ ] Re-run dependency audit in CI or a privileged environment (SEC-006).

## Findings

SEC-001: Public pet contact information exposed for non-lost pets
Severity: High
Where: `supabase/functions/public-pet-contact/index.ts:42-92`, `src/pages/PublicPetProfile.tsx:178-260`
What’s happening:
- The public edge function returned owner email/phone for any valid `public_id`, regardless of lost status, and the UI displayed it unconditionally.
Impact:
- Anyone scanning a QR tag or guessing a public ID could obtain owner contact info for pets not marked lost.
Why it matters:
- This is a direct PII exposure and increases stalking/harassment risk.
Fix:
- Gate owner/emergency contact and microchip data to lost pets only, and hide contact section in the UI unless `is_lost` is true.
Verification:
- Call `public-pet-contact` with a non-lost pet and confirm `owner` + `emergency_contact` are null.
- Open `/found/<public_id>` for a non-lost pet and confirm contact card is hidden.
Notes (optional):
- If product wants optional public contact, add an explicit opt-in field and enforce it in the edge function.

SEC-002: Native auth tokens stored in insecure storage
Severity: High
Where: `src/integrations/supabase/client.ts:11-59`
What’s happening:
- Tokens were stored using `@capacitor/preferences` (UserDefaults) on iOS, which is not secure for auth credentials.
Impact:
- Tokens can be extracted on a compromised device or via backups, enabling account takeover.
Why it matters:
- MASVS storage requirements expect secrets in Keychain/Secure Enclave or equivalent secure storage.
Fix:
- Move Supabase session storage to Keychain-backed storage via `capacitor-native-biometric` (Keychain credentials store) for native platforms.
Verification:
- Sign in on iOS, terminate the app, relaunch, and verify session persistence.
- Inspect Keychain entries (Xcode devices → Keychain) to confirm stored token payload is there, not in UserDefaults.

SEC-003: Scheduled/admin edge functions were unauthenticated
Severity: High
Where: `supabase/functions/send-reminder-emails/index.ts:138-152`, `supabase/functions/send-trial-notifications/index.ts:15-33`, `supabase/functions/cleanup-deleted-accounts/index.ts:15-33`, `supabase/config.toml:36-46`, `supabase/migrations/20251222090000_update_send_reminder_emails_cron_secret.sql:1-12`
What’s happening:
- Functions that use the service role key could be triggered by anyone, leading to mass email spam or account deletion operations.
Impact:
- Abuse could cause data loss, email spam, and operational cost spikes.
Why it matters:
- These endpoints have administrative side effects and must be protected.
Fix:
- Require `CRON_SECRET` header for cron/admin functions and update cron schedule to pass `X-Cron-Secret`.
Verification:
- Invoke each function without `x-cron-secret` and verify 401.
- Invoke with the configured secret and verify 200.
Notes (optional):
- Configure `CRON_SECRET` in Supabase Edge Function secrets and set `app.settings.cron_secret` for the cron job.

SEC-004: Contact email edge function allowed unauthenticated relay + logged PII
Severity: High
Where: `supabase/functions/send-contact-email/index.ts:19-76`, `supabase/config.toml:48-49`, `src/pages/Contact.tsx:33-71`
What’s happening:
- The contact function accepted requests without auth and logged user PII to console.
Impact:
- Abuse as an open relay; sensitive contact details could end up in logs.
Why it matters:
- PII logging and unauthenticated email endpoints can violate App Store and privacy policies.
Fix:
- Require JWT auth for the edge function and enforce sign-in in the client before invoking.
- Remove PII from server logs.
Verification:
- Attempt to submit contact form while logged out → expect error.
- Submit while logged in → email delivered.

SEC-005: Missing iOS privacy manifest (App Store blocker)
Severity: High
Where: `ios/App/App/PrivacyInfo.xcprivacy:1-99`
What’s happening:
- The project did not include the required PrivacyInfo.xcprivacy file.
Impact:
- App Store submission rejection for iOS 17+ requirements.
Why it matters:
- Apple requires privacy manifests for data collection and required reason APIs.
Fix:
- Add PrivacyInfo.xcprivacy declaring collected data and tracking status.
Verification:
- Build the iOS app and confirm PrivacyInfo.xcprivacy is bundled in the app resources.

SEC-006: Dependency audit not executed (environment limitation)
Severity: Medium
Where: `npm audit --audit-level=high`
What’s happening:
- Registry access returned HTTP 403, so audit could not run.
Impact:
- Potential high/critical vulnerabilities may be undiscovered.
Why it matters:
- App Store distribution requires supply-chain due diligence.
Fix:
- Run `npm audit` (or `pnpm audit`) in a CI environment with registry access and remediate any High/Critical items.
Verification:
- Save audit output in release artifacts and confirm zero High/Critical vulnerabilities.

SEC-007: Push notification device token logged in client
Severity: Medium
Where: `src/lib/pushNotifications.ts:52-57`
What’s happening:
- Device push token was logged to console.
Impact:
- Token leakage enables unauthorized push targeting if logs are collected externally.
Why it matters:
- Device tokens are sensitive identifiers and should not be logged.
Fix:
- Remove token from logs; log only success status.
Verification:
- Register for push notifications and confirm logs do not include the token value.

