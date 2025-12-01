import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useNavigationType } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.25,
};

export function PageTransition({ children, className }: PageTransitionProps) {
  const navigationType = useNavigationType();
  
  // Reverse animation direction on back navigation (POP)
  const isBack = navigationType === 'POP';
  
  const pageVariants = {
    initial: {
      opacity: 0,
      x: isBack ? -20 : 20,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: isBack ? 20 : -20,
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
