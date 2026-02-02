

## Remove Google Sign-In Feature

### Overview
Remove all Google OAuth sign-in functionality from the app. Users will authenticate using email/password only (plus biometric sign-in for returning iOS users).

### Files to Modify

#### 1. `src/pages/Auth.tsx`
**Remove Google-related code:**
- Remove `googleLoading` state variable (line 71)
- Remove `handleOAuthCancel` callback (lines 74-82)
- Remove `useOAuthCallback` import and usage (lines 14, 84)
- Remove `Browser` import from Capacitor (line 15)
- Remove `handleGoogleSignIn` function (lines 216-267)
- Remove `GoogleSignInButton` component (lines 269-295)
- Remove `SocialSignInButtons` component (lines 297-300)
- **iOS Welcome Screen**: Remove the "Continue with Google" button (lines 401-426)
- **Web Sign-In Tab**: Remove "Or continue with" divider and `SocialSignInButtons` (lines 906-918)
- **Web Sign-Up Tab**: Remove "Or continue with" divider and `SocialSignInButtons` (lines 989-999)

#### 2. `src/hooks/useOAuthCallback.ts`
**Delete this file entirely** - it's only used for Google OAuth callback handling.

#### 3. `src/App.tsx`
**Remove OAuth callback handling:**
- Remove `useOAuthCallback` import (line 18)
- Remove `isOAuthProcessing` usage (line 75)
- Update loading condition to remove OAuth processing check (line 78)

### No Backend Changes Required
- No database migrations needed
- No edge functions to modify
- Google OAuth configuration in backend can remain (doesn't affect app functionality)

### Impact Summary

| Area | Change |
|------|--------|
| iOS Welcome Screen | Google button removed, email/biometric options remain |
| Web Sign-In | Google button removed, email form remains |
| Web Sign-Up | Google button removed, email form remains |
| OAuth Callback | Hook deleted, no longer needed |
| App Loading | Simplified (no OAuth processing state) |

### Technical Details

The following imports will be cleaned up:
- `@capacitor/browser` - no longer needed in Auth.tsx
- `useOAuthCallback` hook - deleted entirely

Email/password authentication and biometric sign-in will continue to work exactly as before. The authentication flow becomes simpler with only one method (email/password) for new users.

