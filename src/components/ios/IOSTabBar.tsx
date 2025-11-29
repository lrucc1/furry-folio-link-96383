import { Home, PawPrint, Bell, User } from 'lucide-react';
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
  { icon: User, label: 'Account', path: '/account' },
];

export function IOSTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path === '/dashboard' && location.pathname.startsWith('/pets'));
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('w-6 h-6', isActive && 'fill-primary/20')} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
