# PetLinkID Production Deployment Checklist

## ✅ COMPLETED - Code-Level Security Hardening

- [x] Removed unsafe CSP meta tag from `index.html`
- [x] Created environment validation system (`src/config/environment.ts`)
- [x] Added Stripe key validation (crashes if prod uses test keys)
- [x] Created production Capacitor config (`capacitor.config.production.ts`)
- [x] Generated security headers file (`public/_headers`)
- [x] Created App Store privacy JSON (`docs/app_privacy.json`)
- [x] Added Support page (`/support`)
- [x] Created release readiness report (`docs/release-readiness.md`)
- [x] Created rollback plan (`docs/rollback-plan.md`)

## ⚠️ REQUIRED - Configuration Changes YOU Must Make

### 1. Enable Leaked Password Protection (CRITICAL)
**Where:** Lovable Cloud → Backend → Auth Settings  
**Action:** Toggle ON "Leaked Password Protection"  
**Why:** Prevents users from using compromised passwords

### 2. Configure Security Headers (CRITICAL)
**Where:** Deployment platform settings  
**Action:** Add headers from `public/_headers` file  
**If using Cloudflare/Nginx:** Configure at CDN/server level

### 3. Update Capacitor Config for App Store (CRITICAL)
**Where:** `capacitor.config.ts`  
**Action:** Copy from `capacitor.config.production.ts` OR point to production domain  
**Before build:** Run `npx cap sync ios`

### 4. Verify Stripe Keys (CRITICAL)
**Where:** Lovable Cloud → Secrets  
**Check:**
- `VITE_STRIPE_PUBLISHABLE_KEY` starts with `pk_live_`
- `STRIPE_SECRET_KEY` starts with `sk_live_`
- `STRIPE_WEBHOOK_SECRET` is for live mode

### 5. Update Supabase Redirect URLs
**Where:** Lovable Cloud → Backend → Auth Settings  
**Add:** https://petlinkid.com (your production domain)

## 🧪 PRE-LAUNCH TESTING

- [ ] Test account deletion flow
- [ ] Test data export
- [ ] Verify Stripe checkout with live keys
- [ ] Test iOS app on TestFlight
- [ ] Run Lighthouse audit (target: 90+ all metrics)
- [ ] Test public pet profile sharing
- [ ] Verify email notifications send

## 📱 APP STORE SUBMISSION

- [ ] Upload `docs/app_privacy.json` to App Store Connect
- [ ] Update all URLs to point to production
- [ ] Build with production Capacitor config
- [ ] Submit via Xcode

## 🚀 LAUNCH DAY

- [ ] Monitor error logs in Lovable Cloud
- [ ] Watch Stripe webhook events
- [ ] Track auth success rates
- [ ] Monitor performance metrics

---

**Full Details:** See `docs/release-readiness.md`  
**Emergency Rollback:** See `docs/rollback-plan.md`
