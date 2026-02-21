

# Phase 6: Final Cleanup — Dead Branches, Unused Exports, and Empty Directories

## What We're Doing
This phase targets the remaining dead code left over after Phases 1-5: a dead web branch in a component that only runs in native context, unused hook exports that are never imported, and an empty directory left behind from Phase 4.

## Files to Change (2 files)

| File | What Changes |
|------|-------------|
| `src/components/AppLoadingScreen.tsx` | Remove the dead web branch (lines 25-37). This component is only rendered inside `if (isNative && loading)` in `App.tsx`, so the `else` return with `bg-background` styling never executes. Remove `useIsNativeApp` import and `isNative` variable — promote the native return to be the only return. ~15 lines removed. |
| `src/hooks/useIsNativeApp.ts` | Remove the unused `useIsIOSApp()` and `useIsAndroidApp()` exports (lines 14-26). Neither is imported anywhere in the codebase. ~12 lines removed. |

## Directories to Delete (1 directory)

| Path | Reason |
|------|--------|
| `src/features/` | Empty directory — all contents deleted in Phase 4. |

## Files NOT Changed (and why)

| File | Reason |
|------|--------|
| `App.tsx` | Still needs `useIsNativeApp` to choose between NativeAppRoutes and MarketingWebRoutes — this is the core routing split |
| `Header.tsx` | Shared component used by MarketingWebRoutes; `isNative` null-return is correct |
| `HelpCentre.tsx`, `Contact.tsx`, `Pricing.tsx` | Shared between both route trees — dual layout is intentional |
| `IOSSettings.tsx`, `IOSPlans.tsx` | `isNative` used for native feature gating (push, biometrics, restore purchases) |
| `usePushNotifications.ts` | `isNative` used for native push notification registration gating |
| `config/environment.ts` | Local `isNativeApp()` function for environment detection — different from the hook |
| `lib/appleIap.ts` | `isNativeApp()` function for Apple IAP platform checks |
| `ManageSubscriptionModal.tsx`, `UpgradeInline.tsx` | Use `isNativeApp()` from appleIap for IAP logic |

## Estimated Impact
- ~27 lines of dead code removed
- 1 empty directory cleaned up
- 2 unused function exports removed
- No backend, database, or edge function changes
- No visual change to the app

## Technical Details

**AppLoadingScreen.tsx:**
1. Remove `import { useIsNativeApp }` 
2. Remove `const isNative = useIsNativeApp()`
3. Remove the `if (isNative)` wrapper — make the native gradient return the only return
4. Delete the web return block (lines 26-37)

**useIsNativeApp.ts:**
1. Delete the `useIsIOSApp` function (lines 14-19)
2. Delete the `useIsAndroidApp` function (lines 21-26)
3. Keep `useIsNativeApp` — still imported by 8 files

