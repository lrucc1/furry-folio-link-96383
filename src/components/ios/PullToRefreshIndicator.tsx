import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({ 
  pullDistance, 
  isRefreshing,
  threshold = 80 
}: PullToRefreshIndicatorProps) {
  if (pullDistance <= 0 && !isRefreshing) return null;

  const opacity = Math.min(pullDistance / threshold, 1);
  const rotation = (pullDistance / threshold) * 360;
  const scale = Math.min(0.5 + (pullDistance / threshold) * 0.5, 1);

  return (
    <div 
      className="flex items-center justify-center pointer-events-none"
      style={{
        height: Math.max(pullDistance, isRefreshing ? 60 : 0),
        opacity: isRefreshing ? 1 : opacity,
        transition: isRefreshing ? 'height 0.3s ease' : 'none',
      }}
    >
      <div
        className="bg-primary/10 rounded-full p-2"
        style={{
          transform: `scale(${scale})`,
          transition: isRefreshing ? 'transform 0.3s ease' : 'none',
        }}
      >
        <RefreshCw 
          className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
          }}
        />
      </div>
    </div>
  );
}
