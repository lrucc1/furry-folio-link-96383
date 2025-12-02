import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/lib/plan/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { PageTransition } from '@/components/ios/PageTransition';
import { MobileCard } from '@/components/ios/MobileCard';
import { IOSHomeSkeleton } from '@/components/ios/IOSSkeleton';
import { FeatureTile, FeatureTileGrid } from '@/components/ios/FeatureTile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  PawPrint, 
  Bell, 
  AlertTriangle, 
  HelpCircle, 
  Tag, 
  Crown,
  Scale,
  Heart,
  FileText,
  Plus,
  Syringe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { au } from '@/lib/auEnglish';

interface Pet {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
  is_lost: boolean;
}

export default function IOSHome() {
  const { user } = useAuth();
  const { tier } = usePlan();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [upcomingReminders, setUpcomingReminders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Fetch pets
      const { data: petsData } = await supabase
        .from('pets')
        .select('id, name, species, photo_url, is_lost')
        .order('created_at', { ascending: true });
      
      setPets(petsData || []);
      
      // Select first pet by default
      if (petsData && petsData.length > 0 && !selectedPetId) {
        setSelectedPetId(petsData[0].id);
      }

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

      // Fetch user name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, display_name')
        .eq('id', user.id)
        .single();
      
      setUserName(profile?.display_name || profile?.full_name || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = useCallback(async () => {
    await fetchData();
    toast.success('Refreshed');
  }, [user]);

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const lostPetCount = pets.filter(p => p.is_lost).length;
  const canAddPet = tier === 'pro' || pets.length < 1;

  if (loading) {
    return (
      <IOSPageLayout>
        <IOSHomeSkeleton />
      </IOSPageLayout>
    );
  }

  return (
    <IOSPageLayout onRefresh={handleRefresh}>
      <PageTransition>
      <div className="px-4 py-6 space-y-6 pb-8">
        {/* Welcome Card */}
        <MobileCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {userName ? `Welcome, ${userName}!` : au('Welcome back!')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {au('Manage your pets in one place')}
              </p>
            </div>
            {tier === 'pro' && (
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
        </MobileCard>

        {/* Pet Selector */}
        {pets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground px-1">Your Pets</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {pets.map((pet) => (
                <Card
                  key={pet.id}
                  className={cn(
                    'shrink-0 cursor-pointer transition-all rounded-2xl touch-manipulation active:opacity-90',
                    selectedPetId === pet.id 
                      ? 'border-primary shadow-md ring-2 ring-primary/20' 
                      : 'border-border/50 hover:border-border',
                    pet.is_lost && 'border-destructive/50'
                  )}
                  onClick={() => setSelectedPetId(pet.id)}
                >
                  <CardContent className="p-3 flex flex-col items-center min-w-[80px]">
                    <Avatar className="w-14 h-14 mb-2">
                      <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <PawPrint className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate max-w-[70px]">{pet.name}</span>
                    {pet.is_lost && (
                      <Badge variant="destructive" className="text-xs mt-1 px-1.5 py-0">Lost</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Add Pet Button */}
              {canAddPet && (
                <Card
                  className="shrink-0 cursor-pointer border-dashed border-2 border-muted-foreground/30 hover:border-primary/50 transition-colors rounded-2xl touch-manipulation active:opacity-90"
                  onClick={() => navigate('/pets/new')}
                >
                  <CardContent className="p-3 flex flex-col items-center justify-center min-w-[80px] h-full">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Add Pet</span>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Feature Tiles Grid */}
        {selectedPet && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground px-1">Quick Actions</h3>
            <FeatureTileGrid>
              <FeatureTile
                icon={PawPrint}
                title="Pet Profile"
                subtitle="View details"
                onClick={() => navigate(`/pets/${selectedPet.id}`)}
              />
              <FeatureTile
                icon={Heart}
                title="Health"
                subtitle="Medical info"
                onClick={() => navigate(`/pets/${selectedPet.id}#health`)}
              />
              <FeatureTile
                icon={Scale}
                title="Weight"
                subtitle="Track weight"
                onClick={() => navigate(`/pets/${selectedPet.id}/weight`)}
              />
              <FeatureTile
                icon={Syringe}
                title="Vaccinations"
                subtitle="View records"
                onClick={() => navigate(`/pets/${selectedPet.id}#health`)}
              />
              <FeatureTile
                icon={FileText}
                title="Documents"
                subtitle="Vet records"
                onClick={() => navigate(`/pets/${selectedPet.id}#health`)}
              />
              <FeatureTile
                icon={Tag}
                title="QR Tag"
                subtitle="Recovery tags"
                onClick={() => navigate('/smart-tags')}
              />
            </FeatureTileGrid>
          </div>
        )}

        {/* No Pets State */}
        {pets.length === 0 && (
          <MobileCard className="text-center py-8">
            <PawPrint className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pets yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first pet to get started with PetLinkID
            </p>
            <Button onClick={() => navigate('/pets/new')} className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Pet
            </Button>
          </MobileCard>
        )}

        {/* Lost Pet Alert */}
        {lostPetCount > 0 && (
          <MobileCard className="bg-gradient-to-r from-red-500 to-red-600 border-0">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Lost Pet Alert</h3>
                <p className="text-sm text-white/80">
                  {lostPetCount} {lostPetCount === 1 ? 'pet' : 'pets'} marked as lost
                </p>
              </div>
            </div>
          </MobileCard>
        )}

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1">More</h3>
          <div className="space-y-2">
            <MobileCard onClick={() => navigate('/reminders')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Health Reminders</h4>
                  <p className="text-sm text-muted-foreground">
                    {upcomingReminders > 0 ? `${upcomingReminders} upcoming` : 'All caught up!'}
                  </p>
                </div>
                {upcomingReminders > 0 && (
                  <Badge variant="secondary">{upcomingReminders}</Badge>
                )}
              </div>
            </MobileCard>

            <MobileCard onClick={() => navigate('/help')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Help & Support</h4>
                  <p className="text-sm text-muted-foreground">FAQs and guides</p>
                </div>
              </div>
            </MobileCard>
          </div>
        </div>
      </div>
      </PageTransition>
    </IOSPageLayout>
  );
}
