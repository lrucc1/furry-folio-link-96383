
# Phase 5: COMPLETED ✅

## What Was Done
Stripped dead web layout branches from the 2 remaining iOS-only pages.

### Auth.tsx (~230 lines removed)
- Removed `useIsNativeApp` import and `isNative` variable
- Changed redirect from `isNative ? '/ios-home' : '/dashboard'` → `'/ios-home'`
- Removed `if (!isNative) return` guard on native-auth-bg effect — always runs now
- Removed `isNative &&` guard on biometric setup check — always checks now
- Removed `if (isNative)` wrapper — iOS layout is now the only return
- Deleted entire web layout block (Card + Tabs + web forgot-password) — ~225 lines
- Removed unused imports: `Card`, `CardContent`, `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- Also fixed `emailRedirectTo` in signUp from `/dashboard` to `/ios-home`
- Removed dead `showWebForgotPassword` state variable

### BillingSettings.tsx (~22 lines removed)
- Removed `useIsNativeApp` import and `isNative` variable
- Removed unused `ArrowLeft` import
- Deleted web layout return block (linking back to deleted `/account` page)
- Promoted `IOSPageLayout` return to be the only return

### InviteStatus.tsx — No changes needed
- Already had no `isNative` check or web branch; it's a plain layout
- Could benefit from IOSPageLayout wrapping in a future enhancement pass
