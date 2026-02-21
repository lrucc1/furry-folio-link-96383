

# Phase 3: Strip Dual-Mode Layout Branches

## What We're Doing
Removing the web layout branches from 5 pages that are now exclusively routed through `NativeAppRoutes`. These pages currently have `if (isNative) { return iOS layout } else { return web layout }` patterns -- the web branch is dead code.

## Files to Simplify (5 files)

| File | What Changes |
|------|-------------|
| `src/pages/PetDetails.tsx` | Remove ~400 lines of web layout; keep only the `IOSPageLayout` branch. Remove `useIsNativeApp` import and `isNative` variable. |
| `src/pages/PetWeightTracker.tsx` | Remove web layout return block (~30 lines); keep only the `IOSPageLayout` branch. Remove `useIsNativeApp`, `isNative`, web-only back button, and the `if (isNative)` conditional. |
| `src/pages/Reminders.tsx` | Remove web layout branch (~100 lines) and web-specific sizing conditionals (`isNative ? 'text-xl' : 'text-2xl'`); simplify to iOS sizes only. Remove `useIsNativeApp` import. |
| `src/pages/BillingSuccess.tsx` | Remove web layout branch (~40 lines); keep only the `IOSPageLayout` return. Remove `useIsNativeApp` import. |
| `src/pages/BillingCancel.tsx` | Remove web layout branch (~40 lines); keep only the `IOSPageLayout` return. Remove `useIsNativeApp` import. |

## Files NOT Changed (and why)

| File | Reason |
|------|--------|
| `HelpCentre.tsx` | Shared between both route trees (marketing site needs web layout) |
| `Contact.tsx` | Shared between both route trees |
| `Pricing.tsx` | Shared between both route trees |
| `Header.tsx` | Used by MarketingWebRoutes; `isNative` null-return is defensive, harmless |
| `IOSSettings.tsx` | Uses `isNative` for native feature gating (push, biometrics), not layout |
| `IOSPlans.tsx` | Uses `isNative` for restore purchases button visibility |
| `IOSAddPet.tsx` | Uses `Capacitor.isNativePlatform()` for camera access |
| `ManageSubscriptionModal.tsx` | Uses `isNativeApp()` for Apple IAP logic |
| `UpgradeInline.tsx` | Uses `isNativeApp()` for Apple IAP logic |

## Estimated Impact
- ~600+ lines of dead web-portal layout code removed
- 5 files simplified to single-path rendering
- No backend, database, or edge function changes
- No visual change to the iOS app

## Technical Details

For each file, the pattern is the same:
1. Remove the `useIsNativeApp` import and `const isNative = useIsNativeApp()` variable
2. Remove the web layout return block (the `else` or final return after the `if (isNative)` block)
3. Promote the iOS layout to be the only return
4. Remove any `isNative`-conditional class names (e.g., `isNative ? 'text-xl' : 'text-2xl'` becomes just `'text-xl'`)
5. Remove unused web-only imports (e.g., `ArrowLeft`, `Link` if only used in web branch)

