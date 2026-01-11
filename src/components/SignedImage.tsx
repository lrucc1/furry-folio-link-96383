import { useState, forwardRef, useEffect } from 'react';
import { useSignedUrl, isFullUrl } from '@/hooks/useSignedUrl';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SignedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Storage path or legacy full URL */
  storagePath: string | null | undefined;
  /** Fallback content when image fails to load or is not available */
  fallback?: React.ReactNode;
  /** Show loading skeleton while fetching signed URL */
  showLoading?: boolean;
  /** Custom loading skeleton className */
  skeletonClassName?: string;
}

/**
 * Image component that automatically handles signed URLs for Supabase storage
 * 
 * For pet-documents bucket photos stored as:
 * - New format (path): "user-id/filename.jpg" 
 * - Legacy format (URL): "https://xxx.supabase.co/storage/v1/object/public/pet-documents/user-id/filename.jpg"
 * 
 * The component will:
 * 1. Detect if input is a path or full URL
 * 2. Generate a signed URL for private bucket access
 * 3. Handle loading states and fallbacks
 */
export const SignedImage = forwardRef<HTMLImageElement, SignedImageProps>(
  ({ storagePath, fallback, showLoading = true, skeletonClassName, className, alt, ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    
    // Use signed URL hook
    const { url, loading, error } = useSignedUrl(storagePath);

    // Reset error state when storagePath changes - must be in useEffect to avoid state update during render
    useEffect(() => {
      if (storagePath) {
        setImgError(false);
      }
    }, [storagePath]);

    // No image path provided
    if (!storagePath) {
      return fallback ? <>{fallback}</> : null;
    }

    // Loading state
    if (loading && showLoading) {
      return (
        <Skeleton 
          className={cn('w-full h-full', skeletonClassName || className)} 
        />
      );
    }

    // Error state
    if (error || imgError || !url) {
      return fallback ? <>{fallback}</> : null;
    }

    return (
      <img
        ref={ref}
        src={url}
        alt={alt}
        className={className}
        onError={() => setImgError(true)}
        {...props}
      />
    );
  }
);

SignedImage.displayName = 'SignedImage';

/**
 * Wrapper for Avatar-style circular images
 */
interface SignedAvatarImageProps {
  storagePath: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function SignedAvatarImage({ storagePath, alt, className, fallback }: SignedAvatarImageProps) {
  return (
    <SignedImage
      storagePath={storagePath}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      fallback={fallback}
      showLoading={true}
    />
  );
}
