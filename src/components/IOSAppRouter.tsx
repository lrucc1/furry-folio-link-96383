import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isNativeApp } from '@/lib/iosPaymentFlow';

/**
 * iOS App Router
 * Handles iOS-specific routing to skip marketing homepage
 * 
 * Behavior:
 * - iOS app (logged out): Redirect "/" to "/auth"
 * - iOS app (logged in): Redirect "/" to "/dashboard"
 * - Web: Normal behavior, show marketing homepage
 */
export function IOSAppRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only redirect on iOS native app
    if (!isNativeApp()) return;

    // Don't redirect if not on homepage
    if (location.pathname !== '/') return;

    // Wait for auth to load
    if (loading) return;

    // Redirect based on auth state
    if (user) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return <>{children}</>;
}
