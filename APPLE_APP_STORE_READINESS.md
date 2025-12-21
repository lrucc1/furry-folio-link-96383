# Apple App Store Readiness Review

## Compliance checklist

### Privacy & data collection
- [x] **Privacy manifest present**: `ios/App/App/PrivacyInfo.xcprivacy`
- [x] **Privacy policy routes**: `/privacy` and `/privacy-australia` (web + iOS routes)
- [x] **Data access/export/delete**: in-app Export Data + Delete Account flows
- [x] **Sensitive data storage**: native auth tokens stored in Keychain-backed storage
- [ ] **App Store Connect privacy labels**: align with `docs/app_privacy.json` and `PrivacyInfo.xcprivacy`

### Required usage strings (Info.plist)
- [x] NSCameraUsageDescription
- [x] NSPhotoLibraryUsageDescription / NSPhotoLibraryAddUsageDescription
- [x] NSUserNotificationUsageDescription
- [x] NSFaceIDUsageDescription
- [ ] **Location**: Not currently used by native APIs; if added later, include NSLocation* strings.

### Tracking / ATT
- [x] No ATT prompt required (no tracking SDKs detected). Keep `NSPrivacyTracking = false`.

### Payments & subscriptions
- [x] In-app purchase plugin detected (`cordova-plugin-purchase`).
- [ ] Ensure **no external purchase links** for digital goods in-app; keep any Stripe/web checkout gated to web-only or for physical goods.

### Export compliance
- [x] Uses standard TLS only; no custom encryption identified.
- [ ] Confirm in App Store Connect: **“App uses encryption”** = Yes (standard), **“Exempt”** likely Yes under standard cryptography.

### Account deletion / data retention
- [x] Delete Account flow in app (`/settings/delete-account`)
- [x] Export Data flow in app (`/settings/export-data`)

### Regional readiness
- [x] Legal pages present (/terms, /subscription-terms)
- [x] Privacy contact email present in app (privacy@petlinkid.com)

## Likely App Review rejection risks & fixes

1. **Missing privacy manifest** (fixed)
   - File added at `ios/App/App/PrivacyInfo.xcprivacy`. Ensure it is included in Xcode build phases.

2. **Mismatch between App Store privacy labels and actual data use**
   - Fix: Align App Store Connect disclosures with `PrivacyInfo.xcprivacy` and `docs/app_privacy.json`.

3. **External payment links for digital goods**
   - Fix: Ensure all digital features/subscriptions on iOS go through IAP and remove any external checkout links from the iOS build.

4. **Unauthenticated contact or admin endpoints** (fixed)
   - Fix: Require auth for support contact and cron secret for admin functions.

5. **Privacy/PII exposure via public pet profiles** (fixed)
   - Fix: Contact details only shown for pets marked lost.

## Notes for App Store submission
- Ensure the new `PrivacyInfo.xcprivacy` file is in the app bundle and that App Store Connect privacy labels match its contents.
- Confirm App Store Connect URLs for Privacy Policy and Terms are valid and reachable.
- Ensure the **Support URL** and **Contact Email** are current and monitored.
- If you enable push notifications, verify the app clearly explains why notifications are needed.

