import { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IOSTabBar } from './IOSTabBar';
import { IOSHeader } from './IOSHeader';
import { PullToRefreshIndicator } from './PullToRefreshIndicator';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

interface IOSPageLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showTabBar?: boolean;
  headerRight?: ReactNode;
  onRefresh?: () => Promise<void>;
}

const triggerHaptic = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available
    }
  }
};

export function IOSPageLayout({ 
  children, 
  title,
  showHeader = true,
  showTabBar = true,
  headerRight,
  onRefresh
}: IOSPageLayoutProps) {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const hasTriggeredHaptic = useRef(false);

  // Use scroll direction hook for hide-on-scroll navigation
  const { isNavVisible } = useScrollDirection(mainRef, { threshold: 8 });

  const safeAreaBottom = 'env(safe-area-inset-bottom)';
  const safeAreaTop = 'env(safe-area-inset-top)';

  /**
   * ⚠️ CRITICAL: Content bottom padding must match IOSTabBar's layout exactly.
   * 
   * The tab bar has:
   * - 56px fixed height for content (icons/labels)
   * - paddingBottom: env(safe-area-inset-bottom) for home indicator area
   * 
   * So total space needed = 56px + safe area. When tab bar is hidden (scrolled),
   * only the safe area padding is needed. This calculation prevents content
   * from being hidden behind the fixed tab bar while allowing full scroll access.
   */
  const contentBottomPadding = showTabBar
    ? (isNavVisible ? `calc(56px + ${safeAreaBottom})` : safeAreaBottom)
    : safeAreaBottom;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const main = mainRef.current;
    if (!main || !onRefresh) return;
    
    // Only start pull if at the top of scroll
    if (main.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
      hasTriggeredHaptic.current = false;
    }
  }, [onRefresh]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing || !onRefresh) return;

    const pullDown = e.touches[0].clientY - touchStartY.current;

    if (pullDown > 0 && mainRef.current?.scrollTop === 0) {
      e.preventDefault();
      const resistance = 0.5;
      const distance = Math.min(pullDown * resistance, 120);
      setPullDistance(distance);
      
      // Trigger haptic when crossing threshold
      if (distance >= 80 && !hasTriggeredHaptic.current) {
        hasTriggeredHaptic.current = true;
        triggerHaptic();
      }
    }
  }, [isRefreshing, onRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || !onRefresh) return;
    isPulling.current = false;

    if (pullDistance >= 80 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60);
      
      // Trigger haptic on refresh start
      triggerHaptic();

      try {
        await Promise.race([
          onRefresh(),
          new Promise(resolve => setTimeout(resolve, 3000)),
        ]);
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || !onRefresh) return;

    main.addEventListener('touchstart', handleTouchStart, { passive: true });
    main.addEventListener('touchmove', handleTouchMove, { passive: false });
    main.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      main.removeEventListener('touchstart', handleTouchStart);
      main.removeEventListener('touchmove', handleTouchMove);
      main.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, onRefresh]);

  // Calculate header height (48px + safe area)
  const headerHeight = showHeader ? `calc(48px + ${safeAreaTop})` : '0px';

  return (
    <div
      className="fixed inset-0 flex flex-col min-h-dvh"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {showHeader && <IOSHeader title={title} rightContent={headerRight} visible={isNavVisible} />}
      
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-background"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          // Add top padding for header (fixed position)
          paddingTop: headerHeight,
          // Add bottom padding for tab bar (fixed position)
          paddingBottom: contentBottomPadding,
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          touchAction: 'manipulation',
        }}
      >
        {onRefresh && (
          <PullToRefreshIndicator
            pullDistance={pullDistance}
            isRefreshing={isRefreshing}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <div
            key={location.pathname}
            className="min-h-full"
          >
            {children}
          </div>
        </AnimatePresence>
      </main>
      
      {showTabBar && <IOSTabBar visible={isNavVisible} />}
    </div>
  );
}
