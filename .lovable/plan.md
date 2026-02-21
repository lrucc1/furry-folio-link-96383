

# Fix: Password Reset Flow + Block Web App Access

## What's Broken

Two related issues:

1. **Password reset never works**: When you tap "Reset Password" in the email, the link opens in your phone's web browser (not the iOS app). The Supabase verify endpoint auto-creates a login session, the Auth page sees you're logged in and tries to redirect to `/ios-home`, but `/ios-home` doesn't exist on the marketing website. You never see a "set new password" form. Your password stays unchanged.

2. **Web browser shows logged-in state**: After clicking the reset link, the web browser has an active session, so the Header shows your avatar/menu even though the marketing site shouldn't have any logged-in functionality.

## The Fix (3 changes)

### Change 1: Create a dedicated `/reset-password` page

A new page at `src/pages/ResetPassword.tsx` that:
- Detects the recovery session from the URL hash (Supabase passes `type=recovery` in the URL fragment)
- Shows a "Set New Password" form with confirm field
- Calls `supabase.auth.updateUser({ password })` to actually change the password
- Shows success message and tells the user to go back to the iOS app to sign in
- Works on both web and native routes

### Change 2: Update the redirect URL in password reset

In `src/pages/Auth.tsx`, change the `redirectTo` from:
```
${window.location.origin}/auth?type=recovery
```
to:
```
https://petlinkid.io/reset-password
```

This ensures the reset link always goes to the production website's reset page (which works in any browser), not to the app's `/auth` route.

### Change 3: Add the `/reset-password` route to both route files

- Add to `MarketingWebRoutes.tsx` so it works when opened in a browser from the email link
- Add to `NativeAppRoutes.tsx` so it also works if opened within the app

### Change 4: Sign out on the marketing web after password change

After the password is successfully changed, call `supabase.auth.signOut()` on the web so the marketing site doesn't retain a logged-in session. Show a message: "Password changed successfully. Open the PetLinkID app to sign in with your new password."

## Technical Details

### New file: `src/pages/ResetPassword.tsx`

```text
- useEffect listens for onAuthStateChange with event === 'PASSWORD_RECOVERY'
- Shows two password fields (new password + confirm)
- Validates passwords match and minimum length (8 chars)
- Calls supabase.auth.updateUser({ password: newPassword })
- On success: signs out the web session, shows success message
- On error: shows error toast
- No protected route wrapper (must be publicly accessible)
```

### Modified file: `src/pages/Auth.tsx`

Line 206 changes from:
```typescript
{ redirectTo: `${window.location.origin}/auth?type=recovery` }
```
to:
```typescript
{ redirectTo: 'https://petlinkid.io/reset-password' }
```

### Modified file: `src/routes/MarketingWebRoutes.tsx`

Add import and route:
```typescript
import ResetPassword from "@/pages/ResetPassword";
// ...
<Route path="/reset-password" element={<ResetPassword />} />
```

### Modified file: `src/routes/NativeAppRoutes.tsx`

Add import and route:
```typescript
import ResetPassword from "@/pages/ResetPassword";
// ...
<Route path="/reset-password" element={<ResetPassword />} />
```

## What This Fixes

- Password reset email link opens in browser, shows a proper "Set New Password" form
- Password actually gets changed
- Web session is cleaned up after password change (no lingering logged-in state)
- User is told to return to the iOS app to sign in with their new password
- Works regardless of whether the email is opened on the same device as the app or a different device

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ResetPassword.tsx` | New — dedicated password reset form |
| `src/pages/Auth.tsx` | Update redirectTo URL |
| `src/routes/MarketingWebRoutes.tsx` | Add `/reset-password` route |
| `src/routes/NativeAppRoutes.tsx` | Add `/reset-password` route |
