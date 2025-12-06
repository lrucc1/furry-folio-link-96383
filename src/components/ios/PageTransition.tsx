import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.2,
};

/**
 * ⚠️ CRITICAL iOS PAGE TRANSITION - DO NOT ADD TRANSFORM ANIMATIONS
 * 
 * This component MUST use opacity-only transitions. CSS transforms (translateX,
 * translateY, scale) create new stacking contexts in iOS WebView that cause
 * touch hit areas to become misaligned from their visual positions.
 * 
 * Symptoms of breaking this rule:
 * - Tapping a button highlights the wrong element
 * - Touch targets appear offset from where they're rendered
 * - Interactive elements become unresponsive in certain positions
 * 
 * The opacity-only approach was validated through extensive iOS device testing.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  /**
   * ⚠️ OPACITY ONLY - No translateX, translateY, or scale properties allowed.
   * See component docblock above for why this is critical.
   */
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
