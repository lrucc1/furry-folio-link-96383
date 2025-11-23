import { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration
 * 
 * DEVELOPMENT MODE (Current):
 * - Server URL enabled for hot reload from Lovable preview
 * - Changes reflect instantly in app without rebuilding
 * 
 * PRODUCTION MODE (App Store Builds):
 * - Comment out the entire "server" block below
 * - Run: npm run build && npx cap sync ios
 * - Open in Xcode and build for release
 * - App will use bundled assets from dist/ folder
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
