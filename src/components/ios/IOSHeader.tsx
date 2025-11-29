import { ReactNode } from 'react';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { Logo } from '@/components/Logo';

interface IOSHeaderProps {
  title?: string;
  rightContent?: ReactNode;
}

export function IOSHeader({ title, rightContent }: IOSHeaderProps) {
  return (
    <header className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border">
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
