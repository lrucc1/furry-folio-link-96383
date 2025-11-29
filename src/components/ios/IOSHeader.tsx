import { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { Logo } from '@/components/Logo';

interface IOSHeaderProps {
  title?: string;
  rightContent?: ReactNode;
}

export function IOSHeader({ title, rightContent }: IOSHeaderProps) {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top)]"
      style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex-1">
          {title ? (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          ) : (
            <Logo iconClassName="w-8 h-8" textClassName="text-lg font-bold" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {rightContent || <NotificationsDropdown />}
        </div>
      </div>
    </header>
  );
}
