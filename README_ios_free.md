# PetLinkID - iOS Free Build Configuration

## Overview
This document covers the **ios_free** build configuration for PetLinkID. This is a login-only iOS client with no in-app purchases, designed for App Store compliance and TestFlight distribution.

---

## Phase 4: Xcode Export & Submission ✅

### Completed Features

1. **Info.plist Configuration**
   - Bundle identifier: `com.betametrics.petlinkid.free`
   - Display name: PetLinkID
   - Apple-compliant usage descriptions for Camera, Photos, Location
   - App Transport Security configured
   - URL Schemes: `petlinkid://`

2. **Comprehensive Xcode Setup Guide**
   - Step-by-step configuration instructions
   - Signing & Capabilities setup
   - App Store Connect listing creation
   - Metadata preparation (description, keywords, screenshots)
   - TestFlight distribution process
   - App Store submission checklist
   - Troubleshooting guide

3. **Developer Workflow Documentation**
   - Local setup commands
   - Build and archive process
   - TestFlight beta distribution
   - Version update procedures

### Files Created
- ✅ `ios/App/App/Info.plist`
- ✅ `XCODE_SETUP_GUIDE.md` (comprehensive 400+ line guide)
- ✅ `IMPLEMENTATION_COMPLETE.md` (full report)

### Quick Start

```bash
# 1. Clone and setup
git clone <your-repo>
npm install
npx cap add ios

# 2. Build for iOS free
VITE_BUILD_PROFILE=ios_free npm run build
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. Configure signing and archive
# See XCODE_SETUP_GUIDE.md for details
```

### App Store Information

**Bundle ID**: `com.betametrics.petlinkid.free`  
**Category**: Lifestyle  
**Price**: Free  
**Subtitle**: "Secure pet profiles on the go"

**Test Account for Apple Review**:
```
Email: test@petlinkid.io
Password: TestPass123!
Note: Free account with sample pet data
```

---

## Phase 3: UI Modifications ✅

### Completed Features

1. **PremiumInfoSheet Component**
   - Neutral info dialog for iOS free builds
   - Shows "PetLinkID Premium" title with Crown icon
   - Message: "Premium requires an active subscription linked to your account. Create or manage your subscription at petlinkid.io."
   - Two buttons: "OK" and "Open Website" (opens ENV_CONFIG.marketingUrl)

2. **UpgradeInline Component Updates**
   - Guards upgrade CTAs with ENV_CONFIG.useInAppPurchases check
   - Shows PremiumInfoSheet instead of navigating to /pricing when useInAppPurchases=false
   - Maintains existing behavior for web builds

3. **Account Page Updates**
   - Subscription tab guards manage/upgrade buttons with ENV_CONFIG.useInAppPurchases
   - iOS free build shows: "Manage your subscription at petlinkid.io" with external link
   - Web build keeps existing Stripe checkout/manage flows

4. **Pricing Page Updates**
   - Redirects to home page when ENV_CONFIG.useInAppPurchases=false
   - iOS free build has no pricing/checkout page accessible

5. **Feature Gating**
   - FeatureGuard component uses UpgradeInline (which now respects iOS free config)
   - All premium features show info sheet instead of checkout on iOS free

### Environment-Specific Behavior

**Web Build (USE_IN_APP_PURCHASES=true):**
- Full Stripe checkout flows
- /pricing page accessible
- Upgrade buttons navigate to checkout
- Manage subscription via Stripe portal

**iOS Free Build (USE_IN_APP_PURCHASES=false):**
- No checkout/subscribe UI
- /pricing page redirects to home
- Upgrade CTAs show info sheet with external link
- Account page shows static text with petlinkid.io link

## Phase 2: Environment & Entitlements ✅

### Completed Features

1. **Server-Driven Entitlements**
   - Edge function: `get-entitlements` fetches user plan from database
   - Returns: `{ plan: 'free' | 'premium' | 'family', status, renewal_at }`
   - Secure caching with 5-minute TTL
   - Offline fallback to cached plan

2. **EntitlementService**
   - Singleton service managing entitlement checks
   - Automatic caching in secure local storage
   - Graceful error handling with fallback to 'free'
   - Cache invalidation on auth state changes

3. **useEntitlement Hook**
   - Global hook for accessing user entitlements
   - Auto-refreshes every 60 seconds
   - Provides `hasPremium`, `canShowUpgrade`, `marketingUrl`
   - Loading states for smooth UX

4. **Environment Configuration**
   - `src/config/environment.ts` with build profile detection
   - Feature flags: `useInAppPurchases`, `showManageAccountLink`, etc.
   - Easy toggle between web/ios_free builds

### Environment Variables (ios_free)

```bash
VITE_BUILD_PROFILE=ios_free
# All other Supabase vars remain the same as production
```

### Usage Examples

```typescript
// In any component:
import { useEntitlement } from '@/hooks/useEntitlement';
import { ENV_CONFIG } from '@/config/environment';

function MyComponent() {
  const { hasPremium, canShowUpgrade, marketingUrl } = useEntitlement();
  
  if (!hasPremium) {
    if (ENV_CONFIG.useInAppPurchases) {
      // Show upgrade button
    } else {
      // Show info sheet
    }
  }
}
```

## Next Steps

### Phase 4: Xcode Export (Pending)
- iOS signing configuration
- Archive & distribution setup
- TestFlight submission guide

## Backend Compatibility

✅ **Same backend as web** - uses existing Supabase database
✅ **No changes to profiles table** - reads existing `plan_tier` column
✅ **Stripe-agnostic** - entitlements work regardless of payment provider

## Testing

```bash
# Local development with ios_free profile
VITE_BUILD_PROFILE=ios_free npm run dev

# Test entitlements endpoint
curl -X POST https://[your-project].supabase.co/functions/v1/get-entitlements \
  -H "Authorization: Bearer [user-token]"
```

## App Store Compliance Notes

- ✅ No in-app purchase code in this build
- ✅ External link to petlinkid.io for subscription management
- ✅ Account required for access
- ✅ Neutral onboarding copy (no pricing/discounts in-app)
- ⏳ Pending: Info.plist usage strings
- ⏳ Pending: App Store screenshots

---

**Status**: ✅ All Phases Complete | Ready for Xcode Export & App Store Submission

**Full Documentation**:
- Phase 1-4 Summary: This file
- Detailed Xcode Guide: `XCODE_SETUP_GUIDE.md`
- Complete Report: `IMPLEMENTATION_COMPLETE.md`
