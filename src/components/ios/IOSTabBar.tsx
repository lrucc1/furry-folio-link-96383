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

export function IOSTabBar({ visible = true }: IOSTabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav 
      className={cn(
        "flex-shrink-0 bg-background/95 backdrop-blur-md border-t border-border",
        "transition-transform duration-250 ease-out will-change-transform"
      )}
      style={{
        transitionDuration: '250ms',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-12">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path === '/dashboard' && location.pathname.startsWith('/pets'));
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('w-5 h-5', isActive && 'fill-primary/20')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
