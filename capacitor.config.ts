import { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration for PetLinkID
 * 
 * =====================================================================
 * PRODUCTION BUILD INSTRUCTIONS (App Store / TestFlight)
 * =====================================================================
 * 
 * Before archiving for App Store submission:
 * 
 * 1. Comment out the entire "server" block below (lines 35-38)
 * 2. Run: npm run build
 * 3. Run: npx cap sync ios
 * 4. Open in Xcode: npx cap open ios
 * 5. Select "Any iOS Device (arm64)" as build target
 * 6. Product → Archive
 * 7. Distribute via App Store Connect
 * 
 * ⚠️  CRITICAL: Never submit to App Store with server.url enabled!
 *     The app will be rejected if it loads from a remote URL.
 * 
 * =====================================================================
 * DEVELOPMENT MODE (Hot Reload)
 * =====================================================================
 * 
 * For development with live preview:
 * - Keep the server block uncommented
 * - Run: npx cap sync ios && npx cap run ios
 * 
 */

const config: CapacitorConfig = {
  appId: 'com.petlinkid.app',
  appName: 'PetLinkID',
  webDir: 'dist',
  
  // ═══════════════════════════════════════════════════════════════════
  // DEVELOPMENT: Hot reload from Lovable preview
  // PRODUCTION: Comment out this entire block for App Store builds
  // ═══════════════════════════════════════════════════════════════════
  server: {
    url: 'https://a2e9460f-c391-4768-8955-cf1b862df298.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // ═══════════════════════════════════════════════════════════════════
  
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    // Recommended: Add these for better iOS experience
    // backgroundColor: '#ffffff',
    // preferredContentMode: 'mobile',
  },
  
  android: {
    allowMixedContent: false, // Security: Block mixed content in production
    captureInput: true,
  },
};

export default config;
