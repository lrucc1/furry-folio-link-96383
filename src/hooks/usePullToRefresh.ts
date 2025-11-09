import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDown?: number;
  refreshTimeout?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  pullDownThreshold = 80,
  maxPullDown = 120,
  refreshTimeout = 2000,
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPulling = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if we're at the top of the page
      if (window.scrollY === 0 && container.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      touchCurrentY.current = e.touches[0].clientY;
      const pullDown = touchCurrentY.current - touchStartY.current;

      if (pullDown > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        
        // Apply resistance curve - slower as you pull further
        const resistance = 0.5;
        const distance = Math.min(pullDown * resistance, maxPullDown);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;

      isPulling.current = false;

      if (pullDistance >= pullDownThreshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(pullDownThreshold);

        try {
          await Promise.race([
            onRefresh(),
            new Promise((resolve) => setTimeout(resolve, refreshTimeout)),
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
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, pullDownThreshold, maxPullDown, isRefreshing, onRefresh, refreshTimeout]);

  const shouldShowLoader = pullDistance > 0;
  const loaderOpacity = Math.min(pullDistance / pullDownThreshold, 1);
  const loaderRotation = (pullDistance / pullDownThreshold) * 360;

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    shouldShowLoader,
    loaderOpacity,
    loaderRotation,
  };
};
