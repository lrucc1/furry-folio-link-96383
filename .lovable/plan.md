

# Hidden Admin Login Portal for Marketing Website

## Problem
The marketing website has no `/auth` route, so the super admin has no way to log in and access the admin dashboard from the web. The Login button correctly points to `/downloads` for regular users, but admins need a secret way in.

## Solution
Add a hidden, unlisted `/auth` route and the admin routes to `MarketingWebRoutes.tsx`. No visible links will point to `/auth` -- the admin simply bookmarks `petlinkid.io/auth`. After login, admins are redirected to `/admin` instead of the non-existent `/ios-home`.

## Changes

### 1. Add `/auth` and admin routes to MarketingWebRoutes.tsx
- Import `Auth`, `AdminDashboard`, `AdminRoute`, and all admin sub-pages
- Add routes for `/auth`, `/admin`, `/admin/plan-debug`, `/admin/test-emails`, `/admin/email-preview`, `/admin/limit-audit`, `/admin/deletion-history`
- These routes exist but are intentionally not linked from any menu or button

### 2. Fix Auth.tsx redirect for web admins
- Currently, after login, `Auth.tsx` always redirects to `/ios-home` (line 92), which does not exist on the marketing site
- Add logic: if user is logged in AND is on the web (not native), check if they are an admin and redirect to `/admin`. If not admin, redirect to `/downloads` (since regular users shouldn't be logging in on web)

### 3. Fix AdminRoute.tsx fallback for web
- Currently `AdminRoute` redirects non-admins to `/ios-home` (line 23) and unauthenticated users to `/auth`
- The `/auth` redirect is fine now (since we're adding that route), but the non-admin fallback should go to `/` on web instead of `/ios-home`

### 4. Optional: Footer easter egg (subtle hint)
- Make the "BETAMETRICS PTY LTD" text in the footer a clickable link to `/auth` with no visual styling (no underline, no colour change) -- only someone who knows to click it will find it

## Technical Details

| File | Change |
|------|--------|
| `src/routes/MarketingWebRoutes.tsx` | Add imports + routes for `/auth`, `/admin/*` |
| `src/pages/Auth.tsx` | Redirect web users to `/admin` (if admin) or `/downloads` (if not) instead of `/ios-home` |
| `src/components/AdminRoute.tsx` | Change non-admin fallback from `/ios-home` to `/` |
| `src/components/Footer.tsx` | Make company name a subtle link to `/auth` |

No database or backend changes required.

