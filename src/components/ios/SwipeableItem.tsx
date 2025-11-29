import { useState, useRef, useCallback } from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onComplete?: () => void;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  className?: string;
}

export const SwipeableItem = ({ 
  children, 
  onDelete, 
  onComplete,
  deleteConfirmTitle = "Delete item?",
  deleteConfirmDescription = "This action cannot be undone.",
  className = '' 
}: SwipeableItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasTriggeredHaptic = useRef(false);

  const ACTION_THRESHOLD = 80;
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
    let newTranslateX = currentXRef.current + deltaX;
    
    // Clamp: allow right swipe only if onComplete is provided
    if (onComplete) {
      newTranslateX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, newTranslateX));
    } else {
      newTranslateX = Math.max(-MAX_SWIPE, Math.min(0, newTranslateX));
    }
    
    // Trigger haptic when crossing threshold in either direction
    if (Math.abs(newTranslateX) >= ACTION_THRESHOLD && !hasTriggeredHaptic.current) {
      triggerHaptic();
      hasTriggeredHaptic.current = true;
    } else if (Math.abs(newTranslateX) < ACTION_THRESHOLD && hasTriggeredHaptic.current) {
      hasTriggeredHaptic.current = false;
    }
    
    setTranslateX(newTranslateX);
  }, [onComplete]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    
    if (translateX <= -ACTION_THRESHOLD) {
      // Swipe left past threshold - show delete confirmation
      triggerHaptic();
      setShowDeleteConfirm(true);
      setTranslateX(0);
    } else if (translateX >= ACTION_THRESHOLD && onComplete) {
      // Swipe right past threshold - trigger complete
      setIsDeleting(true);
      triggerHaptic();
      setTimeout(() => {
        onComplete();
      }, 200);
    } else {
      // Snap back
      setTranslateX(0);
    }
  }, [translateX, onComplete]);

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    triggerHaptic();
    setTimeout(() => {
      onDelete();
    }, 200);
  }, [onDelete]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setTranslateX(0);
  }, []);

  return (
    <>
      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        {/* Complete background (right swipe) */}
        {onComplete && (
          <div 
            className="absolute inset-y-0 left-0 w-24 bg-primary flex items-center justify-center"
            style={{ opacity: Math.min(1, Math.max(0, translateX) / ACTION_THRESHOLD) }}
          >
            <CheckCircle className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        
        {/* Delete background (left swipe) */}
        <div 
          className="absolute inset-y-0 right-0 w-24 bg-destructive flex items-center justify-center"
          style={{ opacity: Math.min(1, Math.abs(Math.min(0, translateX)) / ACTION_THRESHOLD) }}
        >
          <Trash2 className="w-5 h-5 text-destructive-foreground" />
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
