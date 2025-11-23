import { CapacitorConfig } from '@capacitor/cli';

/**
 * Production Capacitor Configuration
 * 
 * For App Store builds:
 * - Server config commented out to use bundled assets
 * - Run: npm run build && npx cap sync ios
 * - Open in Xcode and build for release
 */

const config: CapacitorConfig = {
  appId: 'com.petlinkid.app',
  appName: 'PetLinkID',
  webDir: 'dist',
  
  // PRODUCTION: Commented out for App Store builds (uses bundled assets)
  // For development/testing, uncomment and point to preview URL
  // server: {
  //   url: 'https://a2e9460f-c391-4768-8955-cf1b862df298.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  
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
