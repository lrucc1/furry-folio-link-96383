import { useState, useRef, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

export const SwipeableItem = ({ children, onDelete, className = '' }: SwipeableItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasTriggeredHaptic = useRef(false);

  const DELETE_THRESHOLD = 80;
  const MAX_SWIPE = 100;

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = translateX;
    isDraggingRef.current = true;
    hasTriggeredHaptic.current = false;
  }, [translateX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.touches[0].clientX - startXRef.current;
    const newTranslateX = Math.max(-MAX_SWIPE, Math.min(0, currentXRef.current + deltaX));
    
    // Trigger haptic when crossing threshold
    if (Math.abs(newTranslateX) >= DELETE_THRESHOLD && !hasTriggeredHaptic.current) {
      triggerHaptic();
      hasTriggeredHaptic.current = true;
    } else if (Math.abs(newTranslateX) < DELETE_THRESHOLD && hasTriggeredHaptic.current) {
      hasTriggeredHaptic.current = false;
    }
    
    setTranslateX(newTranslateX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    
    if (Math.abs(translateX) >= DELETE_THRESHOLD) {
      // Swipe past threshold - trigger delete
      setIsDeleting(true);
      triggerHaptic();
      setTimeout(() => {
        onDelete();
      }, 200);
    } else {
      // Snap back
      setTranslateX(0);
    }
  }, [translateX, onDelete]);

  const handleDeleteClick = useCallback(() => {
    setIsDeleting(true);
    triggerHaptic();
    setTimeout(() => {
      onDelete();
    }, 200);
  }, [onDelete]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Delete background */}
      <div 
        className="absolute inset-y-0 right-0 w-24 bg-destructive flex items-center justify-center"
        style={{ opacity: Math.min(1, Math.abs(translateX) / DELETE_THRESHOLD) }}
      >
        <button
          onClick={handleDeleteClick}
          className="w-full h-full flex items-center justify-center touch-manipulation"
        >
          <Trash2 className="w-5 h-5 text-destructive-foreground" />
        </button>
      </div>
      
      {/* Swipeable content */}
      <div
        className={`relative bg-background transition-transform ${
          isDraggingRef.current ? '' : 'duration-200'
        } ${isDeleting ? 'opacity-0 scale-95 duration-200' : ''}`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
