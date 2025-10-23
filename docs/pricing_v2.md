# Pricing V2: FREE + PRO + 7-Day Trial Implementation

**Status:** ✅ Phase 1 Complete (Core Foundation + Critical Features)  
**Date:** October 23, 2025  
**Version:** 2.0.0

## Overview

This document describes the complete Pricing V2 implementation for PetLinkID, introducing a simplified FREE + PRO tier system with automatic 7-day trial onboarding.

---

## Plans & Pricing (AUD)

### FREE (Forever)
- **Price:** A$0
- **Entitlements:**
  - 1 pet profile max
  - QR tag linking & lost/found contact enabled
  - 1 caregiver with read-only access (share-only)
  - 2 active reminders max
  - 100MB document storage (configurable via `VITE_FREE_DOCS_STORAGE_MB`)

### PRO
- **Monthly:** A$2.99/month
- **Yearly:** A$28.99/year (≈20% savings)
- **Stripe Price IDs:**
  - Monthly: Set via `VITE_STRIPE_PRICE_PRO_MONTHLY_AUD`
  - Yearly: Set via `VITE_STRIPE_PRICE_PRO_YEARLY_AUD`
- **Entitlements:**
  - Unlimited pet profiles
  - Full caregiver access (read + write)
  - Unlimited health reminders
  - 5GB document storage (configurable via `VITE_PRO_DOCS_STORAGE_MB`)
  - Data export capability
  - Priority support

### TRIAL (7-Day Pro Trial)
- **Duration:** 7 days
- **Entitlements:** Same as PRO
- **Auto-onboarding:** Every new signup automatically starts on trial
- **Auto-downgrade:** If no purchase by trial end, user downgrades to FREE with data preserved

---

## Implementation Components

### 1. Configuration (`src/config/pricing.ts`)

Central source of truth for:
- Plan definitions (FREE, PRO, TRIAL)
- Entitlements per plan
- Pricing in AUD
- Stripe price IDs
- Environment variable integration

**Environment Variables:**
```env
VITE_STRIPE_PRICE_PRO_MONTHLY_AUD=price_xxx
VITE_STRIPE_PRICE_PRO_YEARLY_AUD=price_xxx
VITE_TRIAL_DAYS=7
VITE_FREE_DOCS_STORAGE_MB=100
VITE_PRO_DOCS_STORAGE_MB=5000
```

### 2. Database Schema Updates

**New Fields on `profiles` table:**
- `plan_v2`: TEXT ('FREE', 'PRO', 'TRIAL')
- `trial_end_at`: TIMESTAMP (trial expiration)
- `subscription_status`: TEXT ('active', 'past_due', 'canceled', 'trialing', 'none')
- `next_billing_at`: TIMESTAMP

**New `storage_usage` table:**
- Tracks total document storage per user
- Auto-updates via trigger on `pet_documents`

**Database Functions:**
- `initialize_user_trial()`: Sets new users to TRIAL with 7-day expiration
- `check_trial_expired()`: Auto-downgrades expired trials to FREE
- `calculate_user_storage()`: Computes storage usage
- `get_user_plan()`: Returns effective plan for user

**Triggers:**
- `set_trial_on_new_user`: Initializes trial on signup
- `check_trial_expired_trigger`: Checks expiration on profile updates
- `update_storage_on_document_change`: Updates storage tracking

### 3. Services & Hooks

**`EntitlementServiceV2` (`src/services/EntitlementServiceV2.ts`):**
- Singleton service for entitlement checks
- Methods:
  - `getUserPlan(userId)`: Get current plan
  - `getUserUsage(userId)`: Get usage stats (pets, reminders, storage)
  - `checkEntitlement(userId, feature, incrementBy)`: Check if feature allowed
  - `isOverLimit(userId)`: Check if user exceeds FREE limits

**`usePlanV2` Hook (`src/hooks/usePlanV2.ts`):**
- React hook for plan state management
- Real-time updates via Supabase subscriptions
- Returns:
  - `plan`, `planConfig`, `entitlement`
  - `usage` (pets, caregivers, reminders, storage)
  - `trialEndAt`, `daysUntilTrialEnd`, `isTrialActive`
  - `isPro`, `isFree`
  - `refresh()`: Manual refresh function

### 4. UI Components

**`DowngradeHelper` (`src/components/DowngradeHelper.tsx`):**
- Automatic modal when user exceeds FREE limits
- Shows violations and current usage
- Two primary actions:
  1. "Upgrade to Pro" → Navigate to /pricing
  2. "Manage Limits to Stay on Free" → Navigate to /dashboard
- Blocking: Disables editing operations until within limits

**`PaywallModal` (`src/components/PaywallModal.tsx`):**
- Reusable upgrade prompt
- Shows monthly/yearly toggle with savings %
- Lists Pro benefits
- "Start 7-Day Free Trial" CTA

**Updated `Pricing` Page (`src/pages/Pricing.tsx`):**
- Two-card layout (FREE vs PRO)
- Monthly/yearly billing period toggle
- Trial status badge for active trials
- 7-day trial CTA for FREE users
- "Manage Subscription" for PRO users

**Updated `BillingSettings` Page (`src/pages/settings/BillingSettings.tsx`):**
- Shows trial countdown for TRIAL users
- Displays trial end date
- "Subscribe Now" CTA during trial
- Renewal date for PRO subscribers

### 5. Feature Gating

**AddPet Page (`src/pages/AddPet.tsx`):**
- Checks `pets_max` entitlement before allowing new pet
- Shows paywall if limit exceeded
- Real-time usage display with progress bar

**Future Integration Points:**
- Health Reminders: Check `reminders_active_max`
- Documents Upload: Check `docs_storage_mb`
- Data Export: Check `export_enabled`
- Caregiver Invites: Check `caregivers_readwrite_enabled`

### 6. Stripe Integration

**Webhook Handler (`supabase/functions/stripe-webhook/index.ts`):**
- Updated to handle `plan_v2` fields
- Events handled:
  - `customer.subscription.created/updated`: Sets plan to PRO or TRIAL
  - `customer.subscription.deleted`: Downgrades to FREE
  - `invoice.payment_failed`: Sets status to `past_due`
  - `customer.subscription.trial_will_end`: Placeholder for notifications

**Checkout Flow:**
- Users click "Start 7-Day Free Trial" or monthly/yearly subscribe
- `create-checkout` edge function creates Stripe session
- Returns to billing page on success
- Webhook updates plan_v2 on completion

**Customer Portal:**
- `customer-portal` edge function generates portal URL
- Allows: Update payment, view invoices, change plan, cancel subscription

### 7. Notifications & Email

**Trial Notifications Edge Function (`supabase/functions/send-trial-notifications/index.ts`):**
- Designed to run as cron job (daily)
- Detects users with trial ending tomorrow (day 6)
- Creates in-app notifications
- Placeholder for email notifications (TODO: Integrate Resend)
- Auto-downgrades expired trials to FREE

**In-App Notifications:**
- Trial ending soon (1 day before)
- Trial ended notification
- Payment failed alerts (via webhook)

**Email Templates (TODO):**
- Trial started
- Trial ends in 1 day
- Trial ended → downgraded
- Payment failed
- Subscription canceled

### 8. Analytics & Telemetry

**Events to Instrument (TODO):**
- `trial_started`
- `trial_ending_notice_sent`
- `trial_ended`
- `checkout_opened`
- `checkout_completed`
- `portal_opened`
- `plan_changed`
- `downgrade_helper_shown`
- `downgrade_completed`
- `paywall_viewed` (with feature)
- `conversion_result`

---

## Migration Plan

### Phase 1: Core Foundation ✅ COMPLETE
- [x] Create pricing config
- [x] Database migration with new fields
- [x] EntitlementServiceV2
- [x] usePlanV2 hook
- [x] DowngradeHelper component
- [x] PaywallModal component
- [x] Updated Pricing page
- [x] Updated BillingSettings page
- [x] Stripe webhook updates
- [x] Trial notifications edge function
- [x] Feature guard on AddPet

### Phase 2: Feature Gating (TODO)
- [ ] Add feature guards to Health Reminders
- [ ] Add storage checks to Document uploads
- [ ] Add export gate to Data Export
- [ ] Add caregiver role checks
- [ ] Comprehensive entitlement middleware

### Phase 3: Notifications & Emails (TODO)
- [ ] Set up Resend integration
- [ ] Email templates (trial, payment, cancel)
- [ ] Cron job for trial notifications
- [ ] In-app notification system enhancements

### Phase 4: Analytics (TODO)
- [ ] Instrument all conversion events
- [ ] Dashboard for plan metrics
- [ ] A/B testing framework
- [ ] Conversion funnel tracking

### Phase 5: Admin Tools (TODO)
- [ ] Admin plan override UI
- [ ] View user plan history
- [ ] Manual trial extensions
- [ ] Resend notification buttons

### Phase 6: Testing & QA (TODO)
- [ ] Unit tests for EntitlementServiceV2
- [ ] Integration tests for webhooks
- [ ] E2E tests for checkout flow
- [ ] E2E tests for trial → downgrade flow
- [ ] Load testing Stripe integration

---

## Testing Checklist

### New User Flow
1. Sign up → Verify plan_v2='TRIAL', trial_end_at=7 days
2. Access Pro features → Should work
3. Wait 7 days (or manipulate trial_end_at) → Auto-downgrade to FREE
4. Verify data preserved
5. Check DowngradeHelper appears if over limits

### Upgrade Flow
1. FREE user clicks "Upgrade"
2. Stripe checkout opens
3. Subscribe successfully
4. Webhook updates plan_v2='PRO'
5. User sees Pro features unlocked
6. Billing page shows active subscription

### Downgrade Flow
1. PRO user cancels subscription
2. Plan stays PRO until period_end
3. At period_end, webhook downgrades to FREE
4. If over limits, DowngradeHelper blocks editing

### Payment Failure
1. Simulate failed payment
2. Webhook sets subscription_status='past_due'
3. Alert shows on billing page
4. User can update payment in portal

### Feature Gating
1. FREE user with 1 pet tries to add another
2. Paywall modal appears
3. User clicks "Upgrade" → Redirects to /pricing
4. Same for reminders (>2), storage (>100MB)

---

## Edge Cases Handled

1. **Trial expired mid-session:** Trigger on profile update auto-downgrades
2. **Cancelled mid-period:** Keeps PRO until `next_billing_at`
3. **Payment past_due:** Shows alert, links to portal, subscription still active
4. **Manual admin override:** Respects `manual_override` flag (backwards compat)
5. **Deleted users:** Webhooks skip profiles with `deletion_scheduled=true`
6. **Over limits on downgrade:** DowngradeHelper provides guided resolution

---

## Environment Setup

### Required Stripe Configuration
1. Create PRO product in Stripe
2. Create two prices:
   - Monthly: A$2.99
   - Yearly: A$28.99
3. Set environment variables in Lovable Cloud secrets
4. Configure webhook endpoint with signing secret
5. Enable Stripe Customer Portal

### Supabase Configuration
1. Migration already applied ✅
2. Real-time enabled for profiles table
3. Edge functions deployed automatically

---

## Rollout Plan

### Staging
1. Deploy to staging environment
2. Test complete user journey
3. Verify webhook handling
4. Test trial expiration (accelerated)

### Production
1. Deploy database migration
2. Deploy edge functions
3. Verify Stripe configuration
4. Monitor webhook processing
5. Watch for errors in logs
6. Track conversion metrics

### Rollback Plan
If issues arise:
1. Database: Can coexist with old fields (backwards compatible)
2. Code: Revert to previous version
3. Stripe: No changes needed, webhooks handle both

---

## Known Limitations

1. **Email notifications:** Placeholder only, requires Resend integration
2. **Analytics:** Events defined but not instrumented
3. **Admin tools:** Basic override exists, comprehensive UI pending
4. **Mobile app:** Assumes server-side entitlement enforcement
5. **Grace period:** None currently, instant downgrade at trial end

---

## Support & Documentation

- User-facing: `/pricing` page with clear plan comparison
- Help docs: Update required for new trial flow
- FAQs: Trial duration, downgrade process, data retention

---

## Success Metrics

### KPIs to Track
- Trial signup rate
- Trial → Paid conversion rate
- Churn rate (PRO → FREE)
- Revenue per user (monthly vs yearly)
- Time to first upgrade
- Paywall → conversion rate by feature

### Target Metrics (Initial)
- Trial conversion: >15%
- Monthly churn: <5%
- Yearly adoption: >30% of PRO users

---

## Contributors

- Implementation: Lovable AI
- Review: Product Team (pending)
- QA: Testing Team (pending)

---

## Changelog

### 2025-10-23 - v2.0.0
- Initial implementation
- Core foundation complete
- Feature gating on AddPet
- Stripe webhook integration
- Trial notification system
- Documentation
