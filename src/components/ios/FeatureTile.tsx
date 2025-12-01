import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureTileProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick?: () => void;
  gradient?: string;
  disabled?: boolean;
  className?: string;
}

export function FeatureTile({ 
  icon: Icon, 
  title, 
  subtitle, 
  badge, 
  badgeVariant = 'secondary',
  onClick,
  gradient,
  disabled = false,
  className
}: FeatureTileProps) {
  return (
    <Card 
      className={cn(
        'rounded-3xl shadow-sm border-border/40 overflow-hidden',
        !disabled && 'cursor-pointer active:scale-[0.97] transition-all',
        disabled && 'opacity-50',
        gradient,
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-4 flex flex-col items-center text-center min-h-[100px] justify-center">
        <div className={cn(
          'w-10 h-10 rounded-2xl flex items-center justify-center mb-2',
          gradient ? 'bg-white/20' : 'bg-primary/10'
        )}>
          <Icon className={cn(
            'w-5 h-5',
            gradient ? 'text-white' : 'text-primary'
          )} />
        </div>
        
        <h3 className={cn(
          'font-semibold text-sm leading-tight',
          gradient ? 'text-white' : 'text-foreground'
        )}>
          {title}
        </h3>
        
        {subtitle && (
          <p className={cn(
            'text-xs mt-1 line-clamp-2',
            gradient ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {subtitle}
          </p>
        )}
        
        {badge !== undefined && badge !== 0 && (
          <Badge 
            variant={badgeVariant}
            className={cn(
              'mt-2 text-xs',
              gradient && 'bg-white/20 text-white border-0'
            )}
          >
            {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

interface FeatureTileGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function FeatureTileGrid({ children, columns = 2, className }: FeatureTileGridProps) {
  return (
    <div className={cn(
      'grid gap-3',
      columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
      className
    )}>
      {children}
    </div>
  );
}
