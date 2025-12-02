import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  initialVisible?: boolean;
}

interface UseScrollDirectionReturn {
  isNavVisible: boolean;
  isAtTop: boolean;
}

export function useScrollDirection(
  scrollRef: RefObject<HTMLElement | null>,
  options: UseScrollDirectionOptions = {}
): UseScrollDirectionReturn {
  const { threshold = 8, initialVisible = true } = options;
  
  const [isNavVisible, setIsNavVisible] = useState(initialVisible);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollDirection = useCallback(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const currentScrollY = scrollElement.scrollTop;
    const atTop = currentScrollY <= 5;
    
    setIsAtTop(atTop);

    // Always show nav when at top
    if (atTop) {
      setIsNavVisible(true);
      lastScrollY.current = currentScrollY;
      ticking.current = false;
      return;
    }

    const scrollDelta = currentScrollY - lastScrollY.current;

    // Only update if scroll delta exceeds threshold
    if (Math.abs(scrollDelta) >= threshold) {
      // Scrolling down - hide nav
      if (scrollDelta > 0 && currentScrollY > 40) {
        setIsNavVisible(false);
      }
      // Scrolling up - show nav
      else if (scrollDelta < 0) {
        setIsNavVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    }

    ticking.current = false;
  }, [scrollRef, threshold]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollDirection);
      ticking.current = true;
    }
  }, [updateScrollDirection]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef, handleScroll]);

  return { isNavVisible, isAtTop };
}
