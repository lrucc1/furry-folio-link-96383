import { Home, PawPrint, Bell, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TabItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const tabs: TabItem[] = [
  { icon: Home, label: 'Home', path: '/ios-home' },
  { icon: PawPrint, label: 'Pets', path: '/dashboard' },
  { icon: Bell, label: 'Reminders', path: '/reminders' },
  { icon: Settings, label: 'Settings', path: '/ios-settings' },
];

interface IOSTabBarProps {
  visible?: boolean;
}

/**
 * ⚠️ CRITICAL iOS TAB BAR - DO NOT MODIFY POSITIONING/SIZING WITHOUT TESTING ON PHYSICAL DEVICE
 * 
 * This component's layout was carefully tuned to eliminate the gap between the tab bar
 * and the bottom screen edge on all iPhone models. Key requirements:
 * 
 * 1. `ios-tab-bar` class: Applies `bottom: 0 !important` CSS fallback
 * 2. Inline `bottom: 0`: Ensures positioning even if Tailwind classes fail
 * 3. `paddingBottom: env(safe-area-inset-bottom)`: Extends background behind home indicator
 * 4. Fixed 56px inner height: Keeps content above the home indicator area
 * 
 * The background must extend to the true bottom of the screen, with only the
 * interactive content (icons/labels) staying within the safe area.
 */
export function IOSTabBar({ visible = true }: IOSTabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border ios-tab-bar",
        "transition-opacity duration-200 ease-out",
        "shadow-[0_-6px_24px_rgba(0,0,0,0.06)]",
        !visible && "opacity-0 pointer-events-none"
      )}
      /**
       * ⚠️ CRITICAL: These inline styles ensure flush bottom positioning.
       * - bottom: 0 - Explicit override for iOS WebView quirks
       * - paddingBottom: env() - Background extends behind home indicator
       * - paddingLeft/Right: env() - Handles landscape safe areas
       */
      style={{
        bottom: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* ⚠️ Fixed 56px height keeps tab content above home indicator */}
      <div 
        className="flex items-center justify-around px-3 gap-1"
        style={{ height: '56px' }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path ||
            (tab.path === '/dashboard' && location.pathname.startsWith('/pets'));
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full transition-opacity rounded-2xl touch-manipulation',
                'active:opacity-80 px-2 py-1.5',
                isActive ? 'text-primary bg-primary/5' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('w-5 h-5', isActive && 'fill-primary/20')} />
              <span className="text-[11px] font-medium tracking-[0.01em]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
