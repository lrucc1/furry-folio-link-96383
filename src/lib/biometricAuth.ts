import { Capacitor } from '@capacitor/core';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';

const SERVER_ID = 'app.petlinkid.credentials';

interface BiometricStatus {
  isAvailable: boolean;
  biometryType: BiometryType;
  hasCredentials: boolean;
}

/**
 * Check if biometrics are available on device
 */
export async function checkBiometricAvailability(): Promise<BiometricStatus> {
  if (!Capacitor.isNativePlatform()) {
    return { isAvailable: false, biometryType: BiometryType.NONE, hasCredentials: false };
  }
  
  try {
    const result = await NativeBiometric.isAvailable();
    const hasCredentials = await hasStoredCredentials();
    return {
      isAvailable: result.isAvailable,
      biometryType: result.biometryType,
      hasCredentials
    };
  } catch {
    return { isAvailable: false, biometryType: BiometryType.NONE, hasCredentials: false };
  }
}

/**
 * Check if we have stored credentials
 */
export async function hasStoredCredentials(): Promise<boolean> {
  try {
    await NativeBiometric.getCredentials({ server: SERVER_ID });
    return true;
  } catch {
    return false;
  }
}

/**
 * Store credentials securely in iOS Keychain after successful login
 */
export async function storeCredentials(email: string, password: string): Promise<boolean> {
  try {
    await NativeBiometric.setCredentials({
      username: email,
      password: password,
      server: SERVER_ID,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify biometrics and retrieve stored credentials
 */
export async function authenticateWithBiometrics(): Promise<{ email: string; password: string } | null> {
  try {
    // First verify identity with Face ID / Touch ID
    await NativeBiometric.verifyIdentity({
      reason: 'Sign in to PetLinkID',
      title: 'Biometric Login',
      subtitle: 'Use biometric authentication to sign in',
      description: 'Verify your identity to access your account',
    });
    
    // If verified, retrieve stored credentials
    const credentials = await NativeBiometric.getCredentials({ server: SERVER_ID });
    return {
      email: credentials.username,
      password: credentials.password,
    };
  } catch {
    return null;
  }
}

/**
 * Delete stored credentials (on logout or disable)
 */
export async function clearBiometricCredentials(): Promise<void> {
  try {
    await NativeBiometric.deleteCredentials({ server: SERVER_ID });
  } catch {
    // Ignore if no credentials exist
  }
}

/**
 * Get friendly name for biometry type
 */
export function getBiometryName(type: BiometryType): string {
  switch (type) {
    case BiometryType.FACE_ID:
      return 'Face ID';
    case BiometryType.TOUCH_ID:
      return 'Touch ID';
    case BiometryType.FINGERPRINT:
      return 'Fingerprint';
    case BiometryType.FACE_AUTHENTICATION:
      return 'Face Authentication';
    case BiometryType.IRIS_AUTHENTICATION:
      return 'Iris Authentication';
    default:
      return 'Biometric';
  }
}
