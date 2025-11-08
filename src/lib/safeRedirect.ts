/**
 * Safe redirect to Stripe Checkout that handles sandboxed iframes
 * 
 * When running in Lovable preview (sandboxed iframe), opens Stripe in new tab.
 * In production, redirects in the same window.
 */
export function redirectToCheckout(url: string) {
  let isSandboxed = false;
  
  try {
    // Check if we're in a sandboxed iframe
    isSandboxed = window.self !== window.top;
  } catch {
    // If we can't access window.top, we're definitely sandboxed
    isSandboxed = true;
  }
  
  if (isSandboxed) {
    // In preview/sandboxed iframe: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // In production: redirect same window
    window.location.href = url;
  }
}
