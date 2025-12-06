import { CapacitorConfig } from '@capacitor/cli';

/**
 * ⚠️ CRITICAL iOS CONFIGURATION - DO NOT MODIFY WITHOUT TESTING ON PHYSICAL DEVICE
 * 
 * These settings were carefully tuned to eliminate visual gaps and ensure
 * true edge-to-edge rendering on all iPhone models (including Dynamic Island devices).
 */
const config: CapacitorConfig = {
  appId: 'com.petlinkid.app',
  appName: 'PetLinkID',
  webDir: 'dist',
  ios: {
    /**
     * ⚠️ MUST be 'never' - prevents iOS from adding automatic content insets
     * that create gaps between the tab bar and screen edge.
     * Changing this to 'automatic' or 'always' will break the flush bottom layout.
     */
    contentInset: 'never',
    scrollEnabled: true,
    /**
     * ⚠️ MUST match the auth gradient start color (#2E9B8D teal)
     * This prevents white/black flashes at screen edges during app startup
     * and ensures the WebView background matches the app's visual identity.
     */
    backgroundColor: '#2E9B8D',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
