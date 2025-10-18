# PetLinkID - iOS Free Build Configuration

## Overview
This document covers the **ios_free** build configuration for PetLinkID. This is a login-only iOS client with no in-app purchases, designed for App Store compliance and TestFlight distribution.

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

function MyComponent() {
  const { hasPremium, canShowUpgrade, marketingUrl } = useEntitlement();
  
  if (!hasPremium) {
    // Show info sheet instead of upgrade button
  }
}
```

## Next Steps

### Phase 3: UI Modifications (Pending)
- Remove IAP UI components (Subscribe/Restore buttons)
- Replace upgrade CTAs with info sheets
- Update Settings screen with manage subscription link
- Add Apple-compliant onboarding copy

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
- ⏳ Pending: Onboarding copy review
- ⏳ Pending: Info.plist usage strings

---

**Status**: Phase 2 Complete | Next: Phase 3 (UI Modifications)
