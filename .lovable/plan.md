

# Refactor: iOS-First App + Marketing Website

## The Real Problem (It's Not as Bad as It Feels)

After reviewing the codebase, the core issue is **routing and layout**, not the entire app. Here's what's actually going on:

| Layer | Status | Needs Work? |
|-------|--------|-------------|
| Backend (20+ edge functions, DB, auth) | Solid, platform-agnostic | No |
| iOS UI components (IOSPageLayout, tabs, etc.) | Clean, well-built | No |
| iOS pages (10 dedicated pages) | Working | Minor cleanup |
| Business logic (hooks, services, contexts) | Shared and reusable | No |
| Routing (App.tsx) | Web + iOS mixed together | Yes -- this is the problem |
| Web portal pages (Dashboard, Account, etc.) | Redundant for iOS-only | Remove from app routes |
| Marketing pages (Index, Pricing, About, etc.) | Good for petlinkid.io | Keep, simplify |

Starting from scratch would mean **rebuilding months of backend work, security policies, edge functions, and tested business logic** -- all for a problem that's really just about cleaning up the routing layer.

## The Plan: Phased Refactor (Not a Rewrite)

### Phase 1: Split the Router
Restructure `App.tsx` to cleanly separate two experiences:

**iOS App (native):**
- `/auth` -- Login (email + biometric)
- `/ios-home` -- Pet dashboard
- `/ios-settings` -- Settings hub
- `/pets/:id` -- Pet details (already has iOS layout)
- `/pets/:id/edit` -- Edit pet (already routes to IOSEditPet)
- `/pets/:id/weight` -- Weight tracker
- `/pets/new` -- Add pet (already routes to IOSAddPet)
- `/reminders` -- Health reminders (already has iOS layout)
- `/settings/*` -- Profile, plans, sharing, legal pages
- `/found/:publicToken` -- Found pet (public, needed for QR tags)
- `/pet/:publicToken` -- Public pet profile (public, needed for QR tags)
- `/help`, `/contact`, `/faq` -- Support (already have iOS layouts)

**Marketing Website (web only):**
- `/` -- Landing page (hero, features, pricing CTA)
- `/pricing` -- Pricing page
- `/about` -- About page
- `/downloads` -- App Store download link
- `/smart-tags` -- Smart tag product page
- `/privacy`, `/terms`, `/refunds`, etc. -- Legal pages
- `/support` -- Support/contact page

### Phase 2: Remove Web-Only App Pages
These pages become unnecessary once the app is iOS-only:
- `src/pages/Dashboard.tsx` -- replaced by IOSHome
- `src/pages/AddPet.tsx` -- replaced by IOSAddPet
- `src/pages/Account.tsx` -- replaced by IOSSettings + sub-pages
- `src/pages/settings/BillingSettings.tsx` -- handled in iOS settings
- `src/pages/settings/DeleteAccount.tsx` -- handled in iOS settings
- `src/pages/settings/ExportData.tsx` -- handled in iOS settings

The web Header/Footer stay for the marketing site. The iOS app uses IOSPageLayout exclusively.

### Phase 3: Clean Up Dual-Mode Code
Remove `isNative` conditional branches from shared pages (PetDetails, Reminders, Contact, HelpCentre, etc.) -- they now only need their iOS layout since web users will never access them.

This affects approximately 17 files that currently have `if (isNative)` checks.

## What You Keep (and Why It Matters)

- All 20+ backend functions (create-pet, delete-account, export-data, etc.)
- Database schema, RLS policies, and security configuration
- Authentication system (email + biometric)
- Plan/entitlement system
- RBAC and admin tools
- All iOS components and page layouts
- Push notifications, image handling, QR codes
- Apple IAP integration

## What You Remove

- Web-specific dashboard, account, and add/edit pet pages
- `isNative` branching from shared pages
- Web-only components (some Header nav items, web-specific PetCard layouts)
- The IOSAppRouter redirect logic (no longer needed when routing is split)

## Estimated Effort

This is roughly **5-8 focused sessions** of work, not a multi-week rewrite. Each phase can be done incrementally without breaking the app.

## Technical Details

The key change in `App.tsx` would look conceptually like this:

```text
function AppContent() {
  const isNative = useIsNativeApp();

  if (isNative) {
    return <NativeAppRoutes />;    // iOS-only routes with IOSPageLayout
  }

  return <MarketingWebRoutes />;   // Marketing site with Header/Footer
}
```

This single structural change cleanly separates the two experiences, after which we systematically simplify the iOS pages by removing their web fallback code.

No database changes, no edge function changes, no auth changes required.
