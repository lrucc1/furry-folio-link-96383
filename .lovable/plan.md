

# Phase 5: Strip Web Layout Branches from Remaining iOS-Only Pages

## What We're Doing
Three more pages still carry dead web-layout return blocks despite being routed exclusively through `NativeAppRoutes`. This phase removes those branches and cleans up the `isNative` checks, continuing the same pattern from Phase 3.

## Files to Simplify (3 files)

| File | Lines Removed | What Changes |
|------|-------------|-------------|
| `src/pages/Auth.tsx` | ~225 lines | Remove the entire "Web Layout" return block (lines 640-863). Fix the post-login redirect from `isNative ? '/ios-home' : '/dashboard'` to just `'/ios-home'`. Remove `useIsNativeApp` import and `isNative` variable. The `if (isNative)` guard around the iOS return becomes the only return. |
| `src/pages/settings/BillingSettings.tsx` | ~20 lines | Remove the "Web Layout" return block (lines 331-351) which links back to the deleted `/account` page. Remove `useIsNativeApp` import, `isNative` variable, `ArrowLeft` import. Promote the iOS `IOSPageLayout` return to be the only return. |
| `src/pages/InviteStatus.tsx` | Check needed | Only used by `NativeAppRoutes` -- if it has a web branch, strip it. |

## Files NOT Changed (still shared between both route trees)

| File | Reason |
|------|--------|
| `HelpCentre.tsx` | Used by both NativeAppRoutes AND MarketingWebRoutes |
| `Contact.tsx` | Used by both route trees |
| `Pricing.tsx` | Used by both route trees |
| `FAQ.tsx`, `Support.tsx`, `LostPetGuide.tsx` | Used by both route trees |
| `FoundPet.tsx`, `PublicPetProfile.tsx` | Used by both route trees (QR scans) |
| `Header.tsx` | Used by MarketingWebRoutes |
| `IOSSettings.tsx`, `IOSPlans.tsx` | `isNative` used for native feature gating, not layout |

## Estimated Impact
- ~250 lines of dead web-portal layout code removed
- 2-3 files simplified to single-path rendering
- No backend, database, or edge function changes
- No visual change to the iOS app

## Technical Details

**Auth.tsx** (the biggest change):
1. Remove `useIsNativeApp` import and `const isNative = useIsNativeApp()` 
2. Change line 98: `navigate(isNative ? '/ios-home' : '/dashboard')` becomes `navigate('/ios-home')`
3. Remove the native-auth-bg effect's `if (!isNative) return` guard -- it always runs now
4. Remove the biometric `isNative &&` guard (line 118) -- always check biometrics
5. Remove the `if (isNative) {` wrapper around the iOS return -- make it the only return
6. Delete the entire web layout block (lines 640-863)

**BillingSettings.tsx**:
1. Remove `useIsNativeApp` import and `isNative` variable
2. Remove unused `ArrowLeft` import
3. Delete the web layout return (lines 330-351)
4. Promote the iOS layout to be the only return
