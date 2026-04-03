# KNOWN_ISSUES.md

## Purpose
Track confirmed issues, recurring risks and unresolved technical questions for PetLinkID. This should remain practical and current.

## Important note
Some items below are inferred from prior project context and may still need confirmation in the repository. Mark each item as Confirmed, In Progress, Needs Verification or Resolved.

---

## 1. Authentication session instability
**Status:** Needs Verification  
**Why it matters:** Users may be logged out unexpectedly or fail to restore sessions correctly.  
**Observed context:** Prior debugging referenced refresh-token issues.  
**Example clue:** `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`  
**Next step:** Inspect auth initialisation, token storage, refresh flow and logout behaviour.

## 2. Environment configuration may be incomplete or inconsistent
**Status:** Needs Verification  
**Why it matters:** Misaligned environment variables can break auth, storage, payments or builds.  
**Observed context:** Project history suggests staging versus live environment confusion.  
**Next step:** Audit `.env` usage, build targets, Supabase URLs, API keys and domain references.

## 3. iOS build and native configuration fragility
**Status:** Needs Verification  
**Why it matters:** The web app may work while iOS builds fail or behave differently.  
**Observed context:** Prior work referenced Capacitor, CocoaPods and Xcode setup issues.  
**Next step:** Validate `npx cap sync ios`, Xcode project health, pod installation, scheme configuration and build reproducibility.

## 4. Apple Sign In or native auth configuration may be incomplete
**Status:** Needs Verification  
**Why it matters:** Sign-in failures damage trust and block release.  
**Observed context:** Prior work referenced Apple login configuration issues.  
**Next step:** Confirm Apple Sign In identifiers, redirect URLs, app capabilities and Supabase auth configuration.

## 5. Payment configuration may be unfinished or not aligned with platform needs
**Status:** Needs Verification  
**Why it matters:** Incorrect payment setup can block monetisation and App Store approval.  
**Observed context:** Prior work referenced Stripe price configuration warnings and uncertainty around Apple in-app purchase versus Stripe.  
**Example clue:** `WARNING: Stripe price IDs not configured. Checkout will not work until configured.`  
**Next step:** Confirm whether payments are in current scope and whether iOS monetisation requires Apple IAP.

## 6. Documentation and working memory are incomplete
**Status:** In Progress  
**Why it matters:** Without stable project docs, AI support becomes inconsistent and development decisions get repeated.  
**Observed context:** The current activity is explicitly about transitioning context into Claude.  
**Next step:** Maintain `CLAUDE.md`, `PROJECT_BRIEF.md`, `CURRENT_STATE.md`, `ARCHITECTURE.md` and this file.

## 7. Production versus prototype boundaries are not yet fully documented
**Status:** Needs Verification  
**Why it matters:** Teams can accidentally treat prototype shortcuts as production-ready solutions.  
**Observed context:** The project appears to be moving from prototype iteration toward production hardening.  
**Next step:** Identify all temporary shortcuts, mock flows, test data and assumptions that must be removed before release.

## 8. Release readiness is unknown
**Status:** Needs Verification  
**Why it matters:** Without a clear release checklist, critical gaps can be missed late.  
**Next step:** Create a release-readiness checklist covering auth, onboarding, crash handling, privacy, app content, legal text, analytics, support and App Store assets.

## 9. Data model may need hardening for passport-style records
**Status:** Needs Verification  
**Why it matters:** Future product goals may outgrow an initial simplified schema.  
**Next step:** Review tables, relationships, storage structure and future extensibility for pet records and supporting documents.

## 10. Unknown repo-specific issues
**Status:** Open  
**Why it matters:** The codebase may contain blockers not yet documented.  
**Next step:** Perform a repo audit and update this file with confirmed issues only.

---

## Issue tracking format
Use this format when adding new issues:

### Issue title
**Status:** Confirmed / In Progress / Needs Verification / Resolved  
**Area:** Auth / Database / UI / iOS / Build / Payments / Release / Docs  
**Impact:** High / Medium / Low  
**Summary:** Brief plain-English problem statement  
**Evidence:** Error message, file path, build output or observed behaviour  
**Next step:** Clear action to investigate or fix  
**Owner:** Optional  
**Last updated:** YYYY-MM-DD

