# iOS Setup and Build Guide

Follow these steps to produce a working iOS build of **PetLinkID** using Capacitor and Xcode 15+.

## Prerequisites
- Xcode 15 or newer installed on macOS.
- Node.js/npm installed.
- CocoaPods installed (`sudo gem install cocoapods`), then `pod repo update` if needed.

## Clean install & build steps
1. Clone the repository and move into it:
   ```bash
   git clone <repo-url>
   cd furry-folio-link-96383
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the web assets (emits to `dist/`):
   ```bash
   npm run build
   ```
4. Generate iOS asset PNGs from the tracked base64 sources (keeps binaries out of git while ensuring Xcode has icons/splashes):
   ```bash
   npm run ios:assets
   ```
5. Sync the Capacitor iOS project with the latest assets and config:
   ```bash
   npx cap sync ios
   ```
6. Install iOS pods (from `ios/App`):
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```
   > The Podfile sets `ENABLE_USER_SCRIPT_SANDBOXING = NO` for all pods and fixes permissions on the CocoaPods framework script to avoid Xcode 15 sandbox errors.
7. Open the workspace in Xcode (always the workspace, never the `.xcodeproj`):
   ```bash
   open ios/App/App.xcworkspace
   ```
8. In Xcode:
   - Select the **App** target.
   - Set your Apple Developer Team and confirm the Bundle Identifier is `com.petlinkid.app` (adjust only if needed for your signing setup).
   - Choose a real iPhone as the run destination.
   - Build & Run.
9. For TestFlight distribution:
   - Select **Any iOS Device (arm64)**.
   - Go to **Product → Archive**, then **Distribute App → App Store Connect → Upload**.

## Troubleshooting
- **Black screen when launching on device**
  - Ensure you ran `npm run build` before `npx cap sync ios` so the bundled assets exist.
  - Confirm `ios/App/App/public` contains `index.html` and assets after syncing.
  - Make sure the app is not pointing at any remote dev server; it loads the bundled `dist` output by default.

- **CocoaPods `[CP] Embed Pods Frameworks` sandbox or permission errors**
  - Re-run `pod install` inside `ios/App` (the Podfile disables user script sandboxing and normalizes script permissions).
  - If the script is still blocked, manually ensure `Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh` is executable (`chmod +x`).

- **Pods not installing**
  - Run `pod repo update`.
  - Verify you have Ruby and CocoaPods installed. If network restrictions block gem downloads, install CocoaPods on a network that allows access to `rubygems.org`.

Following these steps should produce a clean, offline-capable Capacitor iOS app ready for device testing or TestFlight upload.
