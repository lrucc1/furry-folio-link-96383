# Status Update

**COMPLETED** - Plan steps 1-2 are implemented:
1. ✅ `vite.config.ts` - Conditional define (only sets values when truthy, uses SUPABASE_ANON_KEY fallback, constructs URL from project ID)
2. ✅ `src/main.tsx` - Safety net with dynamic import and friendly error screen

**CURRENT STATE**: The app shows "App Temporarily Unavailable" with diagnostic code `ENV_CONFIG_MISSING`.

This is the CORRECT BEHAVIOR - the safety net is working. The environment variables aren't being compiled into the build.

**NEXT STEP (Step 4)**: The platform's environment injection isn't working. The `.env` file exists with correct values (visible in Lovable Cloud config), but they're not reaching the Vite build.

Suggested user action: Try a hard refresh of the preview, or check if there's a backend/Cloud reconnection needed.

---

Goal: Fix the blank Preview caused by `Error: supabaseUrl is required` (crash happens while importing `src/integrations/supabase/client.ts`, before React renders).

What I found (root cause)
- `src/integrations/supabase/client.ts` does `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, ...)`.
- Preview is crashing because `import.meta.env.VITE_SUPABASE_URL` is being compiled to an empty string.
- In `vite.config.ts`, we currently always set:
  - `"import.meta.env.VITE_SUPABASE_URL"` to `JSON.stringify(supabaseUrl)`
  - and `supabaseUrl` can become `""` in the preview build environment.
- Because it is an unconditional replacement, it can override otherwise-correct environment injection and force the URL to empty at build time.
- Also, the common fallback key name is typically `SUPABASE_ANON_KEY` (not `SUPABASE_PUBLISHABLE_KEY`). Your own docs confirm this (`SECURITY_REGRESSION_TESTS.md` says: `VITE_SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY)`).

Plan (implementation steps)
1) Fix `vite.config.ts` so it never overwrites with empty strings
   - Change the env mapping logic so we only define the replacements when we actually have non-empty values.
   - Use the correct fallback names:
     - URL fallback: `SUPABASE_URL`
     - key fallback: `SUPABASE_ANON_KEY`
   - Implementation approach (high level):
     - Compute:
       - `url = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL`
       - `key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY`
     - Build `define` object conditionally:
       - only set `"import.meta.env.VITE_SUPABASE_URL"` if `url` is truthy
       - only set `"import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"` if `key` is truthy
     - If neither is available, omit those `define` entries entirely (do not set them to `""`).
   - Why this works:
     - It prevents compile-time replacement to an empty string (the direct cause of the crash).
     - It still supports environments where only `SUPABASE_URL` / `SUPABASE_ANON_KEY` exist.

2) Add a “no-blank-screen” safety net in `src/main.tsx` (robustness)
   - Right now `main.tsx` imports `App` statically; if anything in the import tree crashes (like the Supabase client), you get a blank screen.
   - Update `main.tsx` to:
     - validate that required env vars exist (presence only; do not log values to protect privacy/security),
     - then dynamically import `App` (`import("./App")`) only after validation passes,
     - otherwise render a minimal, user-friendly configuration error UI (example: “App is temporarily unavailable. Please try again later.” plus a non-sensitive diagnostic code).
   - This ensures:
     - In production/preview, misconfiguration doesn’t become a hard blank screen.
     - No secret leakage (we will not print keys/URLs; only boolean “configured: yes/no”).

3) Verify end-to-end in Preview after the fix
   - Load Preview root route `/` and confirm the app renders.
   - Navigate to `/auth` and confirm email auth page loads (no Google sign-in).
   - Hard refresh and confirm the session initialization doesn’t crash.

4) If it still fails: confirm backend env injection exists
   - If the environment variables truly are not being provided to the build, the app cannot initialize the backend client.
   - Next action would be to check Lovable Cloud backend settings to ensure the project’s backend connection is active and the frontend build is receiving:
     - `VITE_SUPABASE_URL` (or `SUPABASE_URL`)
     - `VITE_SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_ANON_KEY`)
   - If missing, we’d restore them via Lovable Cloud configuration rather than hardcoding (to stay secure and aligned with Australian privacy expectations).

Files involved
- `vite.config.ts` (primary fix: conditional env defines + correct fallback key name)
- `src/main.tsx` (secondary fix: dynamic import + friendly error screen to prevent blank screens)

Security/Privacy notes (AU privacy readiness)
- Do not log URLs/keys/tokens. Validation and diagnostics will be presence-only.
- This change reduces outage risk (blank screen) without exposing any personal data.

Expected outcome
- Preview no longer crashes with `supabaseUrl is required`.
- If backend config is missing, users see a controlled error screen instead of a blank page, and we get actionable diagnostics without leaking sensitive info.
