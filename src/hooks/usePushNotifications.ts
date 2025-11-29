import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import {
  isPushSupported,
  registerForPush,
  saveDeviceToken,
  setupPushListeners,
  getPermissionStatus,
  PushNotificationState,
} from '@/lib/pushNotifications';
import { PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { toast } from 'sonner';

export function usePushNotifications() {
  const { user } = useAuth();
  const isNative = useIsNativeApp();
  
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
  });
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isLoading, setIsLoading] = useState(false);

  // Check if push is supported
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isSupported: isPushSupported() && isNative,
    }));
  }, [isNative]);

  // Check permission status on mount
  useEffect(() => {
    if (state.isSupported) {
      getPermissionStatus().then(setPermissionStatus);
    }
  }, [state.isSupported]);

  // Handle notification received
  const handleNotificationReceived = useCallback((notification: PushNotificationSchema) => {
    // Show a toast when notification is received in foreground
    toast(notification.title || 'Notification', {
      description: notification.body,
    });
  }, []);

  // Handle notification action (tap)
  const handleNotificationAction = useCallback((action: ActionPerformed) => {
    // Handle navigation based on notification data
    const data = action.notification.data;
    if (data?.type === 'reminder' && data?.petId) {
      // Could navigate to pet details page
      window.location.href = `/pet/${data.petId}`;
    }
  }, []);

  // Set up listeners
  useEffect(() => {
    if (!state.isSupported) return;

    const cleanup = setupPushListeners(
      handleNotificationReceived,
      handleNotificationAction
    );

    return cleanup;
  }, [state.isSupported, handleNotificationReceived, handleNotificationAction]);

  // Register for push notifications
  const register = useCallback(async () => {
    if (!state.isSupported || !user) {
      return false;
    }

    setIsLoading(true);

    try {
      const token = await registerForPush();
      
      if (token) {
        // Save token to database
        const saved = await saveDeviceToken(token, user.id);
        
        if (saved) {
          setState(prev => ({
            ...prev,
            isRegistered: true,
            token,
          }));
          setPermissionStatus('granted');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error registering for push:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.isSupported, user]);

  return {
    ...state,
    permissionStatus,
    isLoading,
    register,
  };
}
