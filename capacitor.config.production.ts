import { CapacitorConfig } from '@capacitor/cli';

/**
 * Production Capacitor Configuration for iOS App Store Builds
 * 
 * IMPORTANT: Use this configuration for production App Store submissions
 * 
 * To build for production:
 * 1. Update server.url to your production domain
 * 2. Remove or comment out the server configuration entirely to use bundled assets
 * 3. Run: npx cap sync ios
 * 4. Open in Xcode and build for release
 */

const config: CapacitorConfig = {
  appId: 'com.petlinkid.app',
  appName: 'PetLinkID',
  webDir: 'dist',
  
  // PRODUCTION: Comment out server config to use bundled assets
  // For live updates, use your production domain with HTTPS
  // server: {
  //   url: 'https://petlinkid.com',
  //   cleartext: false // Always false in production
  // },
  
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  
  android: {
    allowMixedContent: false, // Security: Block mixed content
    captureInput: true,
  },
};

export default config;
