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
    <div className="min-h-screen bg-background">
      {showHeader && <IOSHeader title={title} rightContent={headerRight} />}
      
      <main className={`
        pt-[env(safe-area-inset-top)] 
        ${showTabBar ? 'pb-[calc(4rem+env(safe-area-inset-bottom))]' : 'pb-[env(safe-area-inset-bottom)]'}
      `}>
        {children}
      </main>
      
      {showTabBar && <IOSTabBar />}
    </div>
  );
}
