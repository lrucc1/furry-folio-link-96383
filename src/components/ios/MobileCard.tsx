import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export function MobileCard({ 
  children, 
  className, 
  title, 
  description,
  icon,
  onClick 
}: MobileCardProps) {
  return (
    <Card 
      className={cn(
        'rounded-3xl shadow-sm border-border/40 bg-card/95 touch-manipulation',
        onClick && 'cursor-pointer active:opacity-95 transition-opacity duration-100',
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader className="pb-3">
          {icon && <div className="mb-2">{icon}</div>}
          {title && (
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          )}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={!title && !description ? 'pt-4' : ''}>
        {children}
      </CardContent>
    </Card>
  );
}

interface MobileCardSectionProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardSection({ children, className }: MobileCardSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {children}
    </div>
  );
}
