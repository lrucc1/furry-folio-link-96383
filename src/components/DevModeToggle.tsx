import { useState, useEffect } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const DEV_EMAIL = 'leonrucci@hotmail.com';

export function DevModeToggle() {
  const { user } = useAuth();
  const [isIOS, setIsIOS] = useState(false);

  // Check URL param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsIOS(params.get('forceIOS') === 'true');
  }, []);

  // Only show for dev account
  if (user?.email !== DEV_EMAIL) return null;

  const toggleMode = () => {
    const url = new URL(window.location.href);
    if (isIOS) {
      url.searchParams.delete('forceIOS');
    } else {
      url.searchParams.set('forceIOS', 'true');
    }
    window.location.href = url.toString();
  };

  return (
    <button
      onClick={toggleMode}
      className={cn(
        'fixed bottom-24 right-4 z-[9999] flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all',
        'text-xs font-medium backdrop-blur-sm border',
        isIOS 
          ? 'bg-blue-500/90 text-white border-blue-400 hover:bg-blue-600' 
          : 'bg-background/90 text-foreground border-border hover:bg-muted'
      )}
    >
      {isIOS ? (
        <>
          <Smartphone className="w-4 h-4" />
          iOS
        </>
      ) : (
        <>
          <Monitor className="w-4 h-4" />
          Web
        </>
      )}
    </button>
  );
}
