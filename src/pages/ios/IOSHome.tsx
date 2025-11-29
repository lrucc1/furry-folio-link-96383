import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/lib/plan/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PawPrint, 
  Bell, 
  AlertTriangle, 
  HelpCircle, 
  Tag, 
  Crown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { toast } from 'sonner';
import { au } from '@/lib/auEnglish';

interface TileProps {
  icon: typeof PawPrint;
  title: string;
  subtitle?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'destructive' | 'warning';
  onClick: () => void;
  gradient?: string;
}

function Tile({ icon: Icon, title, subtitle, badge, badgeVariant = 'default', onClick, gradient }: TileProps) {
  return (
    <Card 
      className={cn(
        'cursor-pointer active:scale-[0.98] transition-transform border-0 shadow-md',
        gradient
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          gradient ? 'bg-white/20' : 'bg-primary/10'
        )}>
          <Icon className={cn('w-6 h-6', gradient ? 'text-white' : 'text-primary')} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-semibold text-base',
            gradient ? 'text-white' : 'text-foreground'
          )}>
            {title}
          </h3>
          {subtitle && (
            <p className={cn(
              'text-sm truncate',
              gradient ? 'text-white/80' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        
        {badge !== undefined && badge !== 0 && (
          <Badge 
            variant={badgeVariant === 'warning' ? 'outline' : badgeVariant}
            className={cn(
              badgeVariant === 'warning' && 'border-amber-500 text-amber-600 bg-amber-50',
              gradient && 'bg-white/20 text-white border-0'
            )}
          >
            {badge}
          </Badge>
        )}
        
        <ChevronRight className={cn(
          'w-5 h-5',
          gradient ? 'text-white/60' : 'text-muted-foreground'
        )} />
      </CardContent>
    </Card>
  );
}

export default function IOSHome() {
  const { user } = useAuth();
  const { tier } = usePlan();
  const navigate = useNavigate();
  const [petCount, setPetCount] = useState(0);
  const [lostPetCount, setLostPetCount] = useState(0);
  const [upcomingReminders, setUpcomingReminders] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Fetch pet counts
      const { data: pets } = await supabase
        .from('pets')
        .select('id, is_lost')
        .eq('user_id', user.id);
      
      setPetCount(pets?.length || 0);
      setLostPetCount(pets?.filter(p => p.is_lost).length || 0);

      // Fetch upcoming reminders (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { count: reminderCount } = await supabase
        .from('health_reminders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', false)
        .lte('reminder_date', nextWeek.toISOString());
      
      setUpcomingReminders(reminderCount || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = async () => {
    await fetchData();
    toast.success('Refreshed');
  };

  const {
    containerRef,
    isRefreshing,
    pullDistance,
    shouldShowLoader,
    loaderOpacity,
    loaderRotation,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  if (loading) {
    return (
      <IOSPageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </IOSPageLayout>
    );
  }

  return (
    <IOSPageLayout>
      <div 
        ref={containerRef}
        className="px-4 py-6 space-y-4"
        style={{ 
          transform: `translateY(${pullDistance}px)`, 
          transition: isRefreshing ? 'transform 0.3s ease-out' : 'none' 
        }}
      >
        {shouldShowLoader && (
          <div 
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
            style={{ opacity: loaderOpacity }}
          >
            <RefreshCw 
              className="w-6 h-6 text-primary" 
              style={{ transform: `rotate(${loaderRotation}deg)` }}
            />
          </div>
        )}

        {/* Welcome message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {au('Welcome back!')}
          </h2>
          <p className="text-muted-foreground">
            {au('Manage your pets and stay on top of their health.')}
          </p>
        </div>

        {/* Plan badge */}
        {tier === 'pro' && (
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0">
              <Crown className="w-3 h-3 mr-1" />
              {au('Pro Plan')}
            </Badge>
          </div>
        )}

        {/* Main tiles */}
        <div className="space-y-3">
          <Tile
            icon={PawPrint}
            title={au('My Pets')}
            subtitle={petCount === 0 ? au('Add your first pet') : `${petCount} ${petCount === 1 ? 'pet' : 'pets'} registered`}
            badge={petCount > 0 ? petCount : undefined}
            onClick={() => navigate('/dashboard')}
          />

          <Tile
            icon={Bell}
            title={au('Health Reminders')}
            subtitle={upcomingReminders > 0 ? `${upcomingReminders} upcoming this week` : au('All caught up!')}
            badge={upcomingReminders > 0 ? upcomingReminders : undefined}
            badgeVariant={upcomingReminders > 3 ? 'warning' : 'default'}
            onClick={() => navigate('/reminders')}
          />

          {lostPetCount > 0 && (
            <Tile
              icon={AlertTriangle}
              title={au('Lost Pet Alert')}
              subtitle={`${lostPetCount} ${lostPetCount === 1 ? 'pet' : 'pets'} marked as lost`}
              badge={lostPetCount}
              badgeVariant="destructive"
              onClick={() => navigate('/dashboard')}
              gradient="bg-gradient-to-r from-red-500 to-red-600"
            />
          )}

          <Tile
            icon={Tag}
            title={au('Smart Recovery Tags')}
            subtitle={au('QR tags for quick pet recovery')}
            onClick={() => navigate('/smart-tags')}
          />

          <Tile
            icon={HelpCircle}
            title={au('Help & Support')}
            subtitle={au('FAQs, guides, and contact')}
            onClick={() => navigate('/help')}
          />

          {tier === 'free' && (
            <Tile
              icon={Crown}
              title={au('Upgrade to Pro')}
              subtitle={au('Unlimited pets & premium features')}
              onClick={() => navigate('/pricing')}
              gradient="bg-gradient-to-r from-primary to-primary/80"
            />
          )}
        </div>
      </div>
    </IOSPageLayout>
  );
}
