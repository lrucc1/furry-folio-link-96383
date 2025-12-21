# Threat Model

## System overview
PetLinkID is a Capacitor + React mobile app with a Supabase backend. It stores pet profiles, contact data, reminders, documents/photos, and subscription state. Public pet profiles are accessed via a QR code (public ID) and retrieved through Supabase Edge Functions.

## Data flows
1. **User authentication**
   - Client → Supabase Auth (email/password or OAuth) → session stored on device.
2. **Pet profile management**
   - Client → Supabase PostgREST (RLS enforced) → `pets`, `vaccinations`, `health_reminders`, `pet_documents`.
3. **Public pet profile**
   - Finder → public URL → Edge Function `public-pet-contact` → returns sanitized pet profile data.
4. **Documents/photos**
   - Client → Supabase Storage (pet documents/photos) → public URL only where allowed.
5. **Scheduled jobs**
   - Cron → Edge Functions (`send-reminder-emails`, `send-trial-notifications`, `cleanup-deleted-accounts`).
6. **Support contact**
   - Authenticated client → `send-contact-email` function → Resend email.
7. **Push notifications**
   - Client → Push service → device token stored in `device_tokens`.

## Trust boundaries
- **Client device**: untrusted; storage must be hardened for secrets.
- **Public web endpoints**: unauthenticated traffic (e.g., public pet profile).
- **Supabase Edge Functions**: trusted compute with access to service role keys.
- **Supabase database/storage**: protected by RLS and storage policies.
- **Third-party services**: Resend, Google Maps, Apple IAP.

## Attacker model
- Anonymous internet attacker probing public endpoints.
- Malicious user with valid account attempting horizontal/vertical privilege escalation.
- Compromised device or malware reading local storage.
- Abuse of scheduled functions for spam or data deletion.

## Key assets
- User PII: name, email, phone.
- Pet data: profiles, microchip numbers, photos.
- Auth tokens and refresh tokens.
- Device push tokens.
- Subscription entitlements.

## Abuse cases & mitigations
- **Public ID scraping → owner PII**
  - Mitigation: return contact details only for lost pets, no email/phone otherwise.
- **Token theft from device storage**
  - Mitigation: store Supabase session in Keychain-backed storage on iOS.
- **Cron function abuse**
  - Mitigation: require `CRON_SECRET` for scheduled admin endpoints.
- **Open email relay abuse**
  - Mitigation: require authenticated user for contact emails; rate limit if needed.
- **RLS bypass via service role**
  - Mitigation: service role only used in edge functions with strict access checks.

