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
    <div 
      className="fixed inset-0 bg-background flex flex-col"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header - static in flex container */}
      {showHeader && <IOSHeader title={title} rightContent={headerRight} />}
      
      {/* Scrollable content area */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
        }}
      >
        <div className={`${showTabBar ? 'pb-4' : ''}`}>
          {children}
        </div>
      </main>
      
      {/* Tab bar - static in flex container */}
      {showTabBar && <IOSTabBar />}
    </div>
  );
}
