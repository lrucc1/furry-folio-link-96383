

# Phase 7: Fix Stale Route References (`/dashboard` and `/account`)

## The Problem

Phases 1-3 deleted the `/dashboard` and `/account` routes, but many files still navigate to them. Any user hitting these paths lands on the `NotFound` page -- a broken experience.

## What Changes

All `/dashboard` references become `/ios-home` and all `/account` references are replaced with the correct iOS equivalent.

## Files to Update (14 files)

### Navigation Fixes (`/dashboard` to `/ios-home`)

| # | File | Line(s) | Current | Replacement |
|---|------|---------|---------|-------------|
| 1 | `src/components/ios/IOSTabBar.tsx` | 13, 68 | `'/dashboard'` in Pets tab path and active check | `'/ios-home'` |
| 2 | `src/components/AdminRoute.tsx` | 26 | `Navigate to="/dashboard"` | `Navigate to="/ios-home"` |
| 3 | `src/components/DowngradeHelper.tsx` | 129 | `navigate('/dashboard')` | `navigate('/ios-home')` |
| 4 | `src/pages/PetDetails.tsx` | 119, 329 | `navigate('/dashboard')` and `Link to="/dashboard"` | `/ios-home` and label "Back to Home" |
| 5 | `src/pages/PetWeightTracker.tsx` | 89 | `navigate('/dashboard')` | `navigate('/ios-home')` |
| 6 | `src/pages/ios/IOSEditPet.tsx` | 120, 286 | `navigate('/dashboard')` (error + delete) | `navigate('/ios-home')` |
| 7 | `src/pages/ios/IOSAddPet.tsx` | 264 | `navigate('/dashboard')` | `navigate('/ios-home')` |
| 8 | `src/pages/invite/AcceptInvite.tsx` | 83 | `navigate('/dashboard')` in `handleGoToDashboard` | `navigate('/ios-home')` |
| 9 | `src/pages/admin/PlanDebug.tsx` | 15 | `navigate('/dashboard')` | `navigate('/ios-home')` |
| 10 | `src/pages/admin/LimitAudit.tsx` | 42 | `navigate('/dashboard')` | `navigate('/ios-home')` |
| 11 | `src/pages/admin/DeletionHistory.tsx` | 119 | `Navigate to="/dashboard"` | `Navigate to="/ios-home"` |
| 12 | `src/pages/NotFound.tsx` | 50-51 | `navigate('/dashboard')` "My Pets Dashboard" | `navigate('/ios-home')` "My Pets" |

### Navigation Fixes (`/account` to correct iOS routes)

| # | File | Line(s) | Current | Replacement |
|---|------|---------|---------|-------------|
| 13 | `src/pages/ios/IOSSettings.tsx` | 380 | `navigate('/account')` for Delete Account | Trigger delete-account flow inline (or navigate to a confirmation modal) |
| 14 | `src/components/PricingCards.tsx` | 268 | `Link to="/account"` "Manage Subscription" | `Link to="/settings/billing"` |

### Shared/Marketing Pages (context-dependent)

| # | File | Line(s) | Current | Action |
|---|------|---------|---------|--------|
| 15 | `src/pages/LostPetGuide.tsx` | 97 | `Link to="/dashboard"` "Report Lost Pet Now" | Change to `/ios-home` |
| 16 | `src/pages/Support.tsx` | 111 | `href="/dashboard"` "Go to Dashboard" | Change to `/ios-home` and label "Go to Home" |
| 17 | `src/components/Header.tsx` | 97, 137 | `to="/dashboard"` and `to="/account"` | `to="/ios-home"` and `to="/ios-settings"` |

## What's NOT Changed

- `src/integrations/supabase/client.ts` -- `isNative` here is Capacitor platform detection, not routing
- `src/components/InstagramShareCard.tsx` / `LostPetPosterModal.tsx` -- `isNative` is for CORS proxy logic, not routing

## Estimated Impact
- 17 files updated with correct route paths
- Zero broken navigations remaining
- No backend, database, or edge function changes
- No visual layout changes -- only navigation targets fixed

## Technical Notes

For `IOSSettings.tsx` line 380 (`navigate('/account')` for Delete Account): The `/account` page previously held the delete-account confirmation UI. Since this no longer exists, this will be updated to trigger the delete flow directly from settings or link to a future confirmation modal. For now, the safest fix is to show a confirmation dialog inline before calling the `delete-account` edge function.
