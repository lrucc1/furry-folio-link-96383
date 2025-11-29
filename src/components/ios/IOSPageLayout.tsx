import { ReactNode } from 'react';
import { IOSTabBar } from './IOSTabBar';
import { IOSHeader } from './IOSHeader';

interface IOSPageLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showTabBar?: boolean;
  headerRight?: ReactNode;
}

export function IOSPageLayout({ 
  children, 
  title,
  showHeader = true,
  showTabBar = true,
  headerRight
}: IOSPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {showHeader && <IOSHeader title={title} rightContent={headerRight} />}
      
      <main className={`
        ${showHeader ? 'pt-[calc(3.5rem+env(safe-area-inset-top))]' : 'pt-[env(safe-area-inset-top)]'}
        ${showTabBar ? 'pb-[calc(5rem+env(safe-area-inset-bottom))]' : 'pb-[env(safe-area-inset-bottom)]'}
        overflow-y-auto
        -webkit-overflow-scrolling-touch
      `}>
        {children}
      </main>
      
      {showTabBar && <IOSTabBar />}
    </div>
  );
}
