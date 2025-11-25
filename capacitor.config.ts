import { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration
 * 
 * DEVELOPMENT MODE (Current):
 * - Server URL enabled for hot reload from Lovable preview
 * - Changes reflect instantly in app without rebuilding
 * 
 * PRODUCTION MODE (App Store Builds):
 * CRITICAL: Follow these exact steps for production builds:
 * 1. Comment out the entire "server" block below (lines 24-27)
 * 2. Run: npm run build
 * 3. Run: npx cap sync ios (or android)
 * 4. Open in Xcode/Android Studio and build for release
 * 5. App will use bundled assets from dist/ folder (no remote URL)
 * 
 * IMPORTANT: Never submit to App Store with server.url enabled!
 */

const config: CapacitorConfig = {
  appId: 'com.petlinkid.app',
  appName: 'PetLinkID',
  webDir: 'dist',
  
  // DEVELOPMENT: Hot reload from Lovable preview
  // PRODUCTION: Comment out this entire block for App Store builds
  server: {
    url: 'https://a2e9460f-c391-4768-8955-cf1b862df298.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
};

export default config;
