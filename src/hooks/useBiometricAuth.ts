import { useState, useEffect, useCallback } from 'react';
import { BiometryType } from 'capacitor-native-biometric';
import {
  checkBiometricAvailability,
  storeCredentials,
  authenticateWithBiometrics,
  clearBiometricCredentials,
  getBiometryName,
} from '@/lib/biometricAuth';

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType>(BiometryType.NONE);
  const [biometryName, setBiometryName] = useState('Biometric');
  const [loading, setLoading] = useState(true);

  // Check status on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount only
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    const status = await checkBiometricAvailability();
    setIsAvailable(status.isAvailable);
    setHasCredentials(status.hasCredentials);
    setBiometryType(status.biometryType);
    setBiometryName(getBiometryName(status.biometryType));
    setLoading(false);
  }, []);

  const enableBiometric = useCallback(async (email: string, password: string) => {
    const success = await storeCredentials(email, password);
    if (success) {
      setHasCredentials(true);
    }
    return success;
  }, []);

  const authenticate = useCallback(async () => {
    return authenticateWithBiometrics();
  }, []);

  const disable = useCallback(async () => {
    await clearBiometricCredentials();
    setHasCredentials(false);
  }, []);

  return {
    isAvailable,
    hasCredentials,
    biometryType,
    biometryName,
    loading,
    enableBiometric,
    authenticate,
    disable,
    refresh: checkStatus,
  };
}
