import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Smartphone, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { setForceIOS, isDevModeActive } from '@/lib/platformUtils';
import { cn } from '@/lib/utils';

const DEV_EMAIL = 'leonrucci@hotmail.com';

export function DevModeToggle() {
  const { user } = useAuth();
  const location = useLocation();
  const [isIOS, setIsIOS] = useState(false);

  // Check on mount AND on location changes
  useEffect(() => {
    setIsIOS(isDevModeActive());
  }, [location]);

  // Only show for dev account
  if (user?.email !== DEV_EMAIL) return null;

  const toggleMode = () => {
    const newState = !isIOS;
    setForceIOS(newState);
    // Reload current page to apply new mode
    window.location.reload();
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
