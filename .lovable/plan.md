

# Remove DevModeToggle from Production Marketing Site

## Problem
The `DevModeToggle` button (bottom-right, shows "Web"/"iOS") is visible on the marketing site when logged in as the dev account. This is a developer-only tool that shouldn't appear on the public website.

## Solution
Remove the `DevModeToggle` from the marketing web routes in `App.tsx`. Keep it only for the native app routes where it's actually useful for development testing.

## Change

**File: `src/App.tsx`**
- Remove `<DevModeToggle />` from the marketing web return block (line 37)
- Keep it in the native app block (line 29) where it serves its purpose

This is a single-line removal — no other files affected.

