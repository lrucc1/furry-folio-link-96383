# PetLinkID iOS Setup Guide

This guide walks through cloning the project, building the bundled web assets, and preparing the Capacitor iOS wrapper for Xcode 15+.

## Prerequisites
- Xcode 15 or later with a valid Apple Developer account for signing.
- CocoaPods installed (`sudo gem install cocoapods`).
- Node.js/npm (project uses npm with Vite).

## One-time repository setup
1. Clone the repo and enter it:
   ```bash
   git clone <repo-url>
   cd furry-folio-link-96383
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Build and sync the iOS project
Run these commands from the repository root:
1. Build the web bundle (outputs to `dist`):
   ```bash
   npm run build
   ```
2. Materialize the iOS asset catalog images (kept out of Git to avoid binary diffs):
   ```bash
   npm run ios:assets
   ```
3. Sync Capacitor (copies `dist` into `ios/App/App/public` and installs iOS dependencies):
   ```bash
   npx cap sync ios
   ```
4. Install Pods (from `ios/App`):
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

## Open in Xcode
1. Open the workspace (always use the workspace, not the project file):
   ```bash
   open ios/App/App.xcworkspace
   ```
2. In Xcode:
   - Select the **App** target.
   - Set your **Team** and confirm the Bundle Identifier is `com.petlinkid.app` (or adjust as needed for your account).
   - Choose a real iPhone device as the run destination.
   - Build and run.

## Archiving for TestFlight
1. With `ios/App/App.xcworkspace` open, select **Any iOS Device (arm64)**.
2. From the menu choose **Product → Archive**.
3. In the Organizer, select the new archive and choose **Distribute App → App Store Connect → Upload**.

## Troubleshooting
- **Black screen on launch**
  - Rebuild the web assets with `npm run build`.
  - Re-run `npm run ios:assets` if you cleaned the repo and the asset PNGs are missing.
  - Re-run `npx cap copy ios` or `npx cap sync ios` to refresh `ios/App/App/public`.
  - Confirm `capacitor.config.json` points to `webDir: "dist"` and does not use a remote server URL.

- **CocoaPods script sandbox or permission errors**
  - Ensure `pod install` was run after syncing.
  - The project and Pods targets set `ENABLE_USER_SCRIPT_SANDBOXING = NO` to avoid Xcode 15 sandbox issues, and the Podfile marks `[CP] Embed Pods Frameworks` scripts executable during `pod install`.
  - If a script permission warning persists, manually run:
    ```bash
    chmod +x ios/App/Pods/Target\ Support\ Files/Pods-App/Pods-App-frameworks.sh
    ```

- **Missing pods in this environment**
  - If `npx cap sync ios` warns that CocoaPods is unavailable, install CocoaPods locally and run `pod install` inside `ios/App` before building in Xcode.

## Notes
- The Capacitor configuration loads the bundled `dist` assets by default for offline reliability. For live-reload development you can temporarily enable a dev server URL in `capacitor.config.ts`, but keep it disabled for release builds.
- Code signing is intentionally unset; configure it with your own Apple Developer team in Xcode.
