import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

interface SignedUrlState {
  url: string | null;
  loading: boolean;
  error: string | null;
}

// Cache for signed URLs to avoid redundant API calls
const urlCache = new Map<string, { url: string; expiresAt: number }>();

// Cleanup interval for expired cache entries
const CACHE_CLEANUP_INTERVAL = 60000; // 1 minute
const URL_EXPIRY_BUFFER = 300000; // 5 minutes before expiry, refresh

/**
 * Extracts the storage path from a URL or returns the path if already a path
 * Handles both legacy full URLs and new storage paths
 */
export function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return '';
  
  // If it's already a relative path (no protocol), return as-is
  if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  
  // Extract path from full Supabase URL
  // Format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
  const match = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/pet-documents\/(.+?)(?:\?|$)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  
  // Fallback: try to extract just the filename with user-id prefix
  const parts = urlOrPath.split('/');
  const lastTwo = parts.slice(-2);
  if (lastTwo.length === 2 && lastTwo[0].includes('-')) {
    // Looks like user-id/filename
    return `${lastTwo[0]}/${lastTwo[1].split('?')[0]}`;
  }
  
  // Last resort: return the last part as filename
  return parts[parts.length - 1].split('?')[0];
}

/**
 * Check if a URL is a full public URL (legacy) or a storage path (new)
 */
export function isFullUrl(urlOrPath: string): boolean {
  return urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://');
}

/**
 * Hook to generate and manage signed URLs for Supabase storage objects
 * 
 * @param storagePath - The storage path (or legacy full URL) to generate a signed URL for
 * @param bucket - The storage bucket name (default: 'pet-documents')
 * @param expiresIn - URL expiry time in seconds (default: 3600 = 1 hour)
 */
export function useSignedUrl(
  storagePath: string | null | undefined,
  bucket: string = 'pet-documents',
  expiresIn: number = 3600
): SignedUrlState {
  const [state, setState] = useState<SignedUrlState>({
    url: null,
    loading: !!storagePath,
    error: null,
  });
  
  const mountedRef = useRef(true);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Get initial session and listen for auth changes
  useEffect(() => {
    mountedRef.current = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mountedRef.current) {
        setSession(initialSession);
        setSessionLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mountedRef.current) return;
        
        setSession(newSession);
        setSessionLoading(false);
        
        // Clear cache on sign out to prevent stale URLs
        if (event === 'SIGNED_OUT') {
          urlCache.clear();
          setState({ url: null, loading: false, error: null });
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const generateSignedUrl = useCallback(async (path: string, currentSession: Session | null) => {
    if (!path) {
      setState({ url: null, loading: false, error: null });
      return;
    }

    // Wait for session - don't attempt without auth for private buckets
    if (!currentSession) {
      // Keep loading state, session may still be initializing
      return;
    }

    // Extract the actual storage path if it's a full URL
    const actualPath = extractStoragePath(path);
    if (!actualPath) {
      setState({ url: null, loading: false, error: 'Invalid storage path' });
      return;
    }

    const cacheKey = `${bucket}:${actualPath}`;
    const now = Date.now();

    // Check cache first
    const cached = urlCache.get(cacheKey);
    if (cached && cached.expiresAt > now + URL_EXPIRY_BUFFER) {
      if (mountedRef.current) {
        setState({ url: cached.url, loading: false, error: null });
      }
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(actualPath, expiresIn);

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error('Failed to generate signed URL');
      }

      // Cache the URL
      urlCache.set(cacheKey, {
        url: data.signedUrl,
        expiresAt: now + expiresIn * 1000,
      });

      if (mountedRef.current) {
        setState({ url: data.signedUrl, loading: false, error: null });
      }
    } catch (err) {
      console.error('[useSignedUrl] Error generating signed URL:', err);
      if (mountedRef.current) {
        setState({
          url: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load image',
        });
      }
    }
  }, [bucket, expiresIn]);

  // Generate signed URL when storagePath or session changes
  useEffect(() => {
    if (!storagePath) {
      setState({ url: null, loading: false, error: null });
      return;
    }

    // If session is still loading, wait
    if (sessionLoading) {
      setState(prev => ({ ...prev, loading: true }));
      return;
    }

    // If no session, stay in loading state (user may be logging in)
    if (!session) {
      setState(prev => ({ ...prev, loading: true }));
      return;
    }

    // We have a session, generate the URL
    setState(prev => ({ ...prev, loading: true }));
    generateSignedUrl(storagePath, session);
  }, [storagePath, session, sessionLoading, generateSignedUrl]);

  return state;
}

/**
 * Generate a signed URL synchronously (returns a promise)
 * Useful for edge functions or one-time URL generation
 */
export async function getSignedUrl(
  storagePath: string,
  bucket: string = 'pet-documents',
  expiresIn: number = 3600
): Promise<string | null> {
  if (!storagePath) return null;

  const actualPath = extractStoragePath(storagePath);
  if (!actualPath) return null;

  const cacheKey = `${bucket}:${actualPath}`;
  const now = Date.now();

  // Check cache
  const cached = urlCache.get(cacheKey);
  if (cached && cached.expiresAt > now + URL_EXPIRY_BUFFER) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(actualPath, expiresIn);

    if (error) throw error;

    if (data?.signedUrl) {
      urlCache.set(cacheKey, {
        url: data.signedUrl,
        expiresAt: now + expiresIn * 1000,
      });
      return data.signedUrl;
    }
    return null;
  } catch (err) {
    console.error('[getSignedUrl] Error:', err);
    return null;
  }
}

// Cleanup expired cache entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of urlCache.entries()) {
      if (value.expiresAt < now) {
        urlCache.delete(key);
      }
    }
  }, CACHE_CLEANUP_INTERVAL);
}
