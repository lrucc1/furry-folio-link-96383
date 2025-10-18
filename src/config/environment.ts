export type BuildProfile = 'web' | 'ios_free';

export interface EnvironmentConfig {
  envTarget: 'web' | 'ios';
  buildProfile: BuildProfile;
  useInAppPurchases: boolean;
  showManageAccountLink: boolean;
  entitlementsEndpoint: string;
  appLoginRequired: boolean;
  allowSignupInApp: boolean;
  checkoutUrl: string;
  marketingUrl: string;
  supportUrl: string;
  privacyUrl: string;
  termsUrl: string;
}

// Detect build profile from environment or default to web
const BUILD_PROFILE = (import.meta.env.VITE_BUILD_PROFILE as BuildProfile) || 'web';

export const ENV_CONFIG: EnvironmentConfig = {
  envTarget: BUILD_PROFILE === 'ios_free' ? 'ios' : 'web',
  buildProfile: BUILD_PROFILE,
  useInAppPurchases: BUILD_PROFILE !== 'ios_free',
  showManageAccountLink: BUILD_PROFILE === 'ios_free',
  entitlementsEndpoint: '/functions/v1/get-entitlements',
  appLoginRequired: BUILD_PROFILE === 'ios_free',
  allowSignupInApp: true,
  checkoutUrl: BUILD_PROFILE === 'ios_free' ? '' : '/pricing',
  marketingUrl: 'https://petlinkid.io',
  supportUrl: 'https://petlinkid.io/support',
  privacyUrl: 'https://petlinkid.io/privacy',
  termsUrl: 'https://petlinkid.io/terms',
};

export const isIOSFree = BUILD_PROFILE === 'ios_free';
export const canShowUpgrade = ENV_CONFIG.useInAppPurchases;
