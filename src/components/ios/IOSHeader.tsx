import { ReactNode } from 'react';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface IOSHeaderProps {
  title?: string;
  rightContent?: ReactNode;
  visible?: boolean;
}

export function IOSHeader({ title, rightContent, visible = true }: IOSHeaderProps) {
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border",
        "transition-all duration-200 ease-out",
        !visible && "opacity-0 pointer-events-none -translate-y-2"
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-center justify-between h-12 px-4">
        <div className="flex-1">
          {title ? (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          ) : (
            <Logo iconClassName="w-7 h-7" textClassName="text-base font-bold" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {rightContent || <NotificationsDropdown />}
        </div>
      </div>
    </header>
  );
}
