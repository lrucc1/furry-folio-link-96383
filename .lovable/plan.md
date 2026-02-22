

# Fix All 5 UAT Bugs

## Bug 1 (Critical): Add `/privacy-policy` route alias
**File:** `src/routes/MarketingWebRoutes.tsx`
Add a duplicate route so Apple's App Store link (`petlinkid.io/privacy-policy`) resolves correctly:
```
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
```

## Bug 2 (Critical): Fix Login button 404
**File:** `src/components/Header.tsx`
The Login and "Add Pet" buttons navigate to `/auth`, which doesn't exist in `MarketingWebRoutes`. Since the web is marketing-only (the app is iOS-only), these buttons should direct users to the App Store download page instead.
- Change `navigate('/auth')` to `navigate('/downloads')` for both the Login button (line 264) and the Add Pet button (line 273).
- In the hamburger menu, change unauthenticated links from `/auth` to `/downloads` (lines 97, 115).
- In the desktop nav, change unauthenticated links from `/auth` to `/downloads` (lines 204, 218).

## Bug 3 (Medium): Clean up hamburger menu dead links
**File:** `src/components/Header.tsx`
When a user IS logged in on web, the menu shows native-only routes (`/ios-home`, `/reminders`, `/ios-settings`, `/settings/billing`) that 404 on the marketing site. Fix:
- "My Pets" link: change `/ios-home` to `/downloads` for logged-in web users (lines 97, 204).
- "Reminders" link: change `/reminders` to `/downloads` (lines 115, 218).
- "Account" link (`/ios-settings`): change to `/help` or remove entirely (line 137).
- "Billing Settings" (`/settings/billing`): remove from web hamburger menu (lines 145-152).

## Bug 4 (Low): Update footer copyright
**File:** `src/components/Footer.tsx`
Change line 98 from:
```
© {currentYear} PetLinkID. All rights reserved.
```
to:
```
© {currentYear} BETAMETRICS PTY LTD. All rights reserved.
```

## Bug 5 (Low): Fix deprecated meta tag
**File:** `index.html`
Replace the deprecated `apple-mobile-web-app-capable` (line 6) with the standard:
```html
<meta name="mobile-web-app-capable" content="yes" />
```

## Technical Summary

| File | Changes |
|------|---------|
| `src/routes/MarketingWebRoutes.tsx` | Add 1 route alias (`/privacy-policy`) |
| `src/components/Header.tsx` | Replace `/auth`, `/ios-home`, `/reminders` with `/downloads`; remove `/ios-settings` and `/settings/billing` from web menu |
| `src/components/Footer.tsx` | Update copyright text |
| `index.html` | Replace deprecated meta tag |

All changes are cosmetic/routing only -- no database or backend changes required.
