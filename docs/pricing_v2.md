# Pricing V2: FREE + PRO + 7-Day Trial Implementation

**Status:** ✅ Phase 1 Complete (Core Foundation + Critical Features)  
**Date:** October 23, 2025  
**Version:** 2.1.0 (Apple IAP Only)

## Overview

This document describes the complete Pricing V2 implementation for PetLinkID, introducing a simplified FREE + PRO tier system with automatic 7-day trial onboarding. **Payments are handled exclusively through Apple In-App Purchases for iOS.**

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
- **Apple IAP Product IDs:**
  - Monthly: Set via `VITE_APPLE_PRO_MONTHLY_PRODUCT_ID`
  - Yearly: Set via `VITE_APPLE_PRO_YEARLY_PRODUCT_ID`
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
- Apple IAP product IDs
- Environment variable integration

**Environment Variables:**
```env
VITE_APPLE_PRO_MONTHLY_PRODUCT_ID=com.petlinkid.pro.monthly
VITE_APPLE_PRO_YEARLY_PRODUCT_ID=com.petlinkid.pro.yearly
VITE_TRIAL_DAYS=7
VITE_FREE_DOCS_STORAGE_MB=100
VITE_PRO_DOCS_STORAGE_MB=5000
```

### 2. Database Schema

**Fields on `profiles` table:**
- `plan_v2`: TEXT ('FREE', 'PRO', 'TRIAL')
- `trial_end_at`: TIMESTAMP (trial expiration)
- `subscription_status`: TEXT ('active', 'past_due', 'canceled', 'trialing', 'none')
- `next_billing_at`: TIMESTAMP
- `billing_interval`: TEXT ('month', 'year')

**`storage_usage` table:**
- Tracks total document storage per user
- Auto-updates via trigger on `pet_documents`

**Database Functions:**
- `initialize_user_trial()`: Sets new users to TRIAL with 7-day expiration
- `check_trial_expired()`: Auto-downgrades expired trials to FREE
- `calculate_user_storage()`: Computes storage usage
- `get_user_plan()`: Returns effective plan for user
- `has_active_subscription()`: Checks if user has active subscription

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

### 4. Apple In-App Purchase Integration

**Receipt Validation (`supabase/functions/validate-apple-receipt/index.ts`):**
- Validates Apple receipts server-side
- Updates user plan based on purchase status
- Handles subscription renewals and cancellations

**iOS Purchase Flow:**
- User initiates purchase in app
- Capacitor IAP plugin handles Apple transaction
- Receipt sent to `validate-apple-receipt` edge function
- Function validates with Apple and updates profile
- UI reflects new plan status

### 5. UI Components

**`DowngradeHelper` (`src/components/DowngradeHelper.tsx`):**
- Automatic modal when user exceeds FREE limits
- Shows violations and current usage
- Two primary actions:
  1. "Upgrade to Pro" → Navigate to /pricing
  2. "Manage Limits to Stay on Free" → Navigate to /dashboard

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

**Updated `BillingSettings` Page (`src/pages/settings/BillingSettings.tsx`):**
- Shows trial countdown for TRIAL users
- Displays trial end date
- "Subscribe Now" CTA during trial
- Renewal date for PRO subscribers
- Restore purchases for iOS

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
- [x] Trial notifications edge function
- [x] Feature guard on AddPet
- [x] Remove Stripe integration

### Phase 2: Feature Gating
- [ ] Add feature guards to Health Reminders
- [ ] Add storage checks to Document uploads
- [ ] Add export gate to Data Export
- [ ] Add caregiver role checks
- [ ] Comprehensive entitlement middleware

### Phase 3: Notifications & Emails
- [ ] Set up Resend integration
- [ ] Email templates (trial, payment, cancel)
- [ ] Cron job for trial notifications
- [ ] In-app notification system enhancements

### Phase 4: Analytics
- [ ] Instrument all conversion events
- [ ] Dashboard for plan metrics
- [ ] A/B testing framework
- [ ] Conversion funnel tracking

### Phase 5: Admin Tools
- [ ] Admin plan override UI
- [ ] View user plan history
- [ ] Manual trial extensions
- [ ] Resend notification buttons

### Phase 6: Testing & QA
- [ ] Unit tests for EntitlementServiceV2
- [ ] E2E tests for Apple IAP flow
- [ ] E2E tests for trial → downgrade flow

---

## Testing Checklist

### New User Flow
1. Sign up → Verify plan_v2='TRIAL', trial_end_at=7 days
2. Access Pro features → Should work
3. Wait 7 days (or manipulate trial_end_at) → Auto-downgrade to FREE
4. Verify data preserved
5. Check DowngradeHelper appears if over limits

### Upgrade Flow (iOS)
1. FREE user taps "Upgrade"
2. Apple IAP sheet appears
3. User completes purchase
4. Receipt validated via edge function
5. Profile updated to plan_v2='PRO'
6. UI reflects Pro status

### Downgrade Flow
1. User cancels in Apple Subscriptions settings
2. Apple notifies via server-to-server notification
3. Plan stays PRO until period_end
4. At period_end, downgrades to FREE
5. If over limits, DowngradeHelper blocks editing

### Feature Gating
1. FREE user with 1 pet tries to add another
2. Paywall modal appears
3. User taps "Upgrade" → Apple IAP sheet
4. Same for reminders (>2), storage (>100MB)

---

## Edge Cases Handled

1. **Trial expired mid-session:** Trigger on profile update auto-downgrades
2. **Cancelled mid-period:** Keeps PRO until `next_billing_at`
3. **Manual admin override:** Respects `manual_override` flag
4. **Deleted users:** Skip profiles with `deletion_scheduled=true`
5. **Over limits on downgrade:** DowngradeHelper provides guided resolution

---

## Environment Setup

### Required Apple Configuration
1. Create PRO product in App Store Connect
2. Create two subscription products:
   - Monthly: A$2.99
   - Yearly: A$28.99
3. Set environment variables in Lovable Cloud secrets
4. Configure App Store Server Notifications (optional)
5. Test in Sandbox environment

### Supabase Configuration
1. Migration already applied ✅
2. Real-time enabled for profiles table
3. Edge functions deployed automatically

---

## Known Limitations

1. **Email notifications:** Placeholder only, requires Resend integration
2. **Analytics:** Events defined but not instrumented
3. **Admin tools:** Basic override exists, comprehensive UI pending
4. **Server notifications:** Apple S2S notifications not yet implemented
5. **Grace period:** None currently, instant downgrade at subscription end

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

## Changelog

### 2025-10-26 - v2.1.0
- Removed Stripe integration
- Switched to Apple IAP only for iOS
- Updated documentation

### 2025-10-23 - v2.0.0
- Initial implementation
- Core foundation complete
- Feature gating on AddPet
- Trial notification system
- Documentation
