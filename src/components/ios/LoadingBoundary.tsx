import { ReactNode } from 'react';

interface LoadingBoundaryProps {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

/**
 * Reusable loading boundary component that shows a skeleton while loading
 * and renders children when loading is complete
 */
export function LoadingBoundary({ loading, skeleton, children }: LoadingBoundaryProps) {
  if (loading) {
    return <>{skeleton}</>;
  }
  return <>{children}</>;
}
