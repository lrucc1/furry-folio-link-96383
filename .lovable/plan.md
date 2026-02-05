
## What’s going on (in plain English)

Your Preview isn’t “randomly broken” — the app is **starting without its required backend configuration**, so it can’t create the backend client and it either:
- used to crash with `Error: supabaseUrl is required`, or
- now shows the controlled fallback screen `ENV_CONFIG_MISSING` (instead of a blank screen).

From the live sandbox response of `/src/main.tsx`, I can see Vite is serving:

- `import.meta.env = { BASE_URL, DEV, MODE, ... }` **only**
- It is **missing** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

That means the Vite preview sandbox process **is not receiving those environment variables at all**, so nothing we do in React can “fix” it unless we get the values injected at build/dev-server time.

## Why it happened (root cause)

1. `src/integrations/supabase/client.ts` creates the backend client from:
   - `import.meta.env.VITE_SUPABASE_URL`
   - `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`

2. In your Preview sandbox, those variables are not present in `import.meta.env`, so:
   - previously `createClient("", ...)` threw `supabaseUrl is required`
   - now `src/main.tsx` blocks app boot and shows `ENV_CONFIG_MISSING`

3. I checked the project’s configured secrets list and it currently **does not include**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - nor the fallback names `SUPABASE_URL` / `SUPABASE_ANON_KEY`

So the Preview server has nothing to inject.

## What we need to do to make Preview + app work reliably

### A) Fix the actual missing configuration (required)
We need to add two environment variables to Lovable Cloud secrets so the Preview sandbox can inject them:

**Add these secrets (recommended names):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**Or add these fallback secrets (also supported by your current `vite.config.ts`):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Notes:
- These are “public client configuration” values (they are required for the web client to connect), but they still should be stored in Lovable Cloud secrets to keep builds consistent and avoid accidental file-based config.
- I will not print the actual values in chat; we’ll just configure them in the secrets UI.

**How you’ll do it (user steps):**
1. Open your project settings for Lovable Cloud secrets (the same place you added Google Maps / Apple IAP / Resend).
2. Add the variables above.
3. Save.
4. Hard refresh the Preview.

### B) Make the code resilient even if env injection fails again (already partially done)
You already have a good “no blank screen” safety net in `src/main.tsx`:
- it checks env var presence
- it blocks boot if missing
- it shows a friendly error screen

That’s correct and production-friendly (especially for Australian privacy expectations), because it prevents users from seeing a broken blank page.

We’ll keep that pattern.

### C) Make Vite config more robust (small improvement)
Right now, your `vite.config.ts` only defines replacements if it finds values in `loadEnv()` or `process.env`.

If we still see missing env after adding secrets, we’ll implement a last-resort fallback approach:
- Always derive the backend URL from the backend project id stored in repo configuration (so URL never goes missing even if the env is absent).
- Still require the publishable key from secrets (we should not hardcode it unless absolutely necessary).

This reduces “single point of failure” to just the key injection, and avoids the `supabaseUrl is required` class of outages entirely.

## Verification checklist (how we’ll confirm it’s fixed)

After secrets are added:

1. Refresh Preview and confirm the app renders (no `ENV_CONFIG_MISSING` screen).
2. Confirm `/auth` loads and you can reach the login UI.
3. Confirm the browser-served `/src/main.tsx` no longer shows only the minimal env object:
   - either `import.meta.env.VITE_SUPABASE_URL` references are replaced at compile time (via `define`)
   - or `import.meta.env` includes the VITE values.
4. Confirm no runtime error: `supabaseUrl is required`.

## Implementation steps I will do once you confirm the secrets are added (code work)
1. Add a small, non-sensitive diagnostic log in development/preview only:
   - logs only booleans like `{ hasUrl: true/false, hasKey: true/false }`
   - never logs the actual values
2. If needed, update `vite.config.ts` to add “project-id-derived URL fallback” so URL cannot be empty in preview builds.
3. Re-check Preview network response for `/src/main.tsx` to confirm env is present/replaced.
4. Re-test key flows: home `/`, `/auth`, dashboard load, and a basic authenticated request.

## One thing I need from you (critical)
Please add the missing secrets in Lovable Cloud:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (preferred)
  OR
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`

Until those exist, Preview will keep showing the config error screen (or crashing), because the backend client cannot be created without them.
