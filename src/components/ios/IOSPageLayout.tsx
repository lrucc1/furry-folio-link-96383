import { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { IOSTabBar } from './IOSTabBar';
import { IOSHeader } from './IOSHeader';
import { PullToRefreshIndicator } from './PullToRefreshIndicator';

interface IOSPageLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showTabBar?: boolean;
  headerRight?: ReactNode;
  onRefresh?: () => Promise<void>;
}

export function IOSPageLayout({ 
  children, 
  title,
  showHeader = true,
  showTabBar = true,
  headerRight,
  onRefresh
}: IOSPageLayoutProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const main = mainRef.current;
    if (!main || !onRefresh) return;
    
    // Only start pull if at the top of scroll
    if (main.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
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
    }
  }, [isRefreshing, onRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || !onRefresh) return;
    isPulling.current = false;

    if (pullDistance >= 80 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60);

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

  return (
    <div 
      className="fixed inset-0 bg-background flex flex-col"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {showHeader && <IOSHeader title={title} rightContent={headerRight} />}
      
      <main 
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
        }}
      >
        {onRefresh && (
          <PullToRefreshIndicator 
            pullDistance={pullDistance} 
            isRefreshing={isRefreshing} 
          />
        )}
        <div className={`${showTabBar ? 'pb-4' : ''}`}>
          {children}
        </div>
      </main>
      
      {showTabBar && <IOSTabBar />}
    </div>
  );
}
