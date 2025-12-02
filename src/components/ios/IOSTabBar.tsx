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
  height?: string;
}

export function IOSTabBar({ visible = true, height }: IOSTabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border",
        "transition-opacity duration-200 ease-out",
        "shadow-[0_-6px_24px_rgba(0,0,0,0.06)]",
        !visible && "opacity-0 pointer-events-none"
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: height ?? 'calc(56px + env(safe-area-inset-bottom))',
        // Ensure the tab bar sits at the absolute bottom
        bottom: 0,
      }}
    >
      <div className="flex items-center justify-around h-full px-3 gap-1">
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
