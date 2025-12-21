import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
}

/**
 * Check if push notifications are supported on this platform
 */
export const isPushSupported = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Request permission for push notifications
 */
export const requestPermission = async (): Promise<boolean> => {
  if (!isPushSupported()) {
    console.log('Push notifications not supported on this platform');
    return false;
  }

  try {
    const permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    }
    
    return permStatus.receive === 'granted';
  } catch (error) {
    console.error('Error requesting push permission:', error);
    return false;
  }
};

/**
 * Register for push notifications and get device token
 */
export const registerForPush = async (): Promise<string | null> => {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.log('Push notification permission denied');
      return null;
    }

    // Register with the native push notification service
    await PushNotifications.register();

    // Return a promise that resolves with the token
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success');
        resolve(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('Error registering for push:', error);
    return null;
  }
};

/**
 * Save device token to the database for the current user
 * Note: Using type assertion because device_tokens table types may not be synced yet
 */
export const saveDeviceToken = async (token: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('device_tokens')
      .upsert({
        user_id: userId,
        token: token,
        platform: Capacitor.getPlatform(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,token'
      });

    if (error) {
      console.error('Error saving device token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving device token:', error);
    return false;
  }
};

/**
 * Remove device token from the database
 */
export const removeDeviceToken = async (token: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('device_tokens')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Error removing device token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing device token:', error);
    return false;
  }
};

/**
 * Set up push notification listeners
 */
export const setupPushListeners = (
  onNotificationReceived?: (notification: PushNotificationSchema) => void,
  onNotificationAction?: (action: ActionPerformed) => void
) => {
  if (!isPushSupported()) {
    return () => {};
  }

  // Handle notification received while app is in foreground
  const receivedListener = PushNotifications.addListener(
    'pushNotificationReceived',
    (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  // Handle notification action (user tapped on notification)
  const actionListener = PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action: ActionPerformed) => {
      console.log('Push notification action performed:', action);
      onNotificationAction?.(action);
    }
  );

  // Return cleanup function
  return () => {
    receivedListener.then(l => l.remove());
    actionListener.then(l => l.remove());
  };
};

/**
 * Get current notification permission status
 */
export const getPermissionStatus = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  if (!isPushSupported()) {
    return 'denied';
  }

  try {
    const status = await PushNotifications.checkPermissions();
    // Map all possible states to our simplified type
    if (status.receive === 'granted') return 'granted';
    if (status.receive === 'denied') return 'denied';
    return 'prompt';
  } catch (error) {
    console.error('Error checking push permission:', error);
    return 'denied';
  }
};
