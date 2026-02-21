
# Update Outdated Legal Page Dates to 2026

## Problem
Four legal pages still display 2024 dates, which need to be updated to "February 2026" before App Store submission.

## Pages to Update

| Page | File | Current Date | New Date |
|------|------|-------------|----------|
| Terms of Service | `src/pages/Terms.tsx` | September 22, 2024 | February 2026 |
| Australian Privacy | `src/pages/AustralianPrivacy.tsx` | September 22, 2024 | February 2026 |
| iOS Terms | `src/pages/ios/IOSTerms.tsx` | September 22, 2024 | February 2026 |
| iOS Subscription Terms | `src/pages/ios/IOSSubscriptionTerms.tsx` | December 2024 | February 2026 |

## Pages Already Correct (no changes needed)
- Privacy Policy -- January 2026
- Subscription Terms (web) -- January 2026
- Refunds and Guarantees -- January 2026
- Data Handling -- January 2026
- Footer copyright -- dynamic (2026)

## Technical Details
Each fix is a single line change replacing the hardcoded date string:
- `src/pages/Terms.tsx` line 32: change "September 22, 2024" to "February 2026"
- `src/pages/AustralianPrivacy.tsx` line 60: change "September 22, 2024" to "February 2026"
- `src/pages/ios/IOSTerms.tsx` line 28: change "September 22, 2024" to "February 2026"
- `src/pages/ios/IOSSubscriptionTerms.tsx` line 28: change "December 2024" to "February 2026"

No other code changes, dependencies, or database modifications required.
