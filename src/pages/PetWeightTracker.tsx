import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { ArrowLeft, Plus, Scale, TrendingUp, TrendingDown, Minus, Trash2, Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface WeightRecord {
  id: string;
  weight_kg: number;
  recorded_at: string;
  note: string | null;
  created_at: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  weight_kg: number | null;
}

export default function PetWeightTracker() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNative = useIsNativeApp();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (id && user) {
      fetchData();
    }
  }, [id, user]);

  const fetchData = async () => {
    if (!id || !user) return;
    
    try {
      // Fetch pet details
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('id, name, species, weight_kg')
        .eq('id', id)
        .single();
      
      if (petError) throw petError;
      setPet(petData);
      
      // Fetch weight records
      const { data: weightData, error: weightError } = await supabase
        .from('weight_records')
        .select('*')
        .eq('pet_id', id)
        .order('recorded_at', { ascending: false });
      
      if (weightError) throw weightError;
      setRecords(weightData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load weight data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !newWeight) return;
    
    setSaving(true);
    try {
      const weight = parseFloat(newWeight);
      if (isNaN(weight) || weight <= 0 || weight > 500) {
        toast.error('Please enter a valid weight');
        return;
      }

      const { error } = await supabase
        .from('weight_records')
        .insert({
          pet_id: id,
          user_id: user.id,
          weight_kg: weight,
          recorded_at: newDate,
          note: newNote.trim() || null,
        });

      if (error) throw error;

      // Update pet's current weight
      await supabase
        .from('pets')
        .update({ weight_kg: weight })
        .eq('id', id);

      toast.success('Weight recorded');
      setNewWeight('');
      setNewNote('');
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
      setSheetOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error('Failed to save weight');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('weight_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      
      toast.success('Record deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const latestWeight = records[0]?.weight_kg || pet?.weight_kg;
  const previousWeight = records[1]?.weight_kg;
  const weightChange = latestWeight && previousWeight 
    ? (latestWeight - previousWeight).toFixed(1) 
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pet) {
    return null;
  }

  const WeightContent = () => (
    <div className="space-y-6">
      {/* Back Button - iOS */}
      {isNative && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/pets/${id}`)}
          className="-ml-2 h-10 touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to {pet.name}
        </Button>
      )}

      {/* Current Weight Card */}
      <MobileCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="text-center py-4">
          <Scale className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-4xl font-bold text-foreground">
            {latestWeight ? `${latestWeight} kg` : '—'}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {records[0]?.recorded_at 
              ? `Last recorded ${format(new Date(records[0].recorded_at), 'MMM d, yyyy')}`
              : 'No weight recorded yet'
            }
          </p>
          
          {weightChange && (
            <Badge 
              variant="outline" 
              className={`mt-3 ${
                parseFloat(weightChange) > 0 
                  ? 'border-orange-500 text-orange-600 bg-orange-50' 
                  : parseFloat(weightChange) < 0 
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-muted text-muted-foreground'
              }`}
            >
              {parseFloat(weightChange) > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : parseFloat(weightChange) < 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <Minus className="w-3 h-3 mr-1" />
              )}
              {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg from previous
            </Badge>
          )}
        </div>
      </MobileCard>

      {/* Weight History */}
      <MobileCard title="Weight History" description={`${records.length} record${records.length !== 1 ? 's' : ''}`}>
        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Scale className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No weight records yet</p>
            <p className="text-sm">Add your first record to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => {
              const prev = records[index + 1];
              const change = prev ? (record.weight_kg - prev.weight_kg).toFixed(1) : null;
              
              return (
                <div 
                  key={record.id} 
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{record.weight_kg} kg</span>
                      {change && (
                        <span className={`text-xs ${
                          parseFloat(change) > 0 ? 'text-orange-600' : 
                          parseFloat(change) < 0 ? 'text-green-600' : 
                          'text-muted-foreground'
                        }`}>
                          {parseFloat(change) > 0 ? '+' : ''}{change}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(record.recorded_at), 'MMMM d, yyyy')}
                    </p>
                    {record.note && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        {record.note}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRecord(record.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </MobileCard>

      {/* Add Weight Button */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button className="w-full h-12 rounded-full text-base font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            Add Weight Record
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle>Add Weight Record</SheetTitle>
            <SheetDescription>
              Record {pet.name}'s current weight
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleAddRecord} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="e.g., 7.5"
                className="h-12 text-lg"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-12"
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g., After vet visit, post-diet check"
                rows={2}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-full text-base font-semibold"
              disabled={saving || !newWeight}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Record'
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );

  // iOS Layout
  if (isNative) {
    return (
      <IOSPageLayout title="Weight Tracker" showTabBar={false}>
        <div className="px-4 py-6 max-w-md mx-auto pb-24">
          <WeightContent />
        </div>
      </IOSPageLayout>
    );
  }

  // Web Layout
  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-2 w-full justify-start rounded-xl md:w-auto"
        >
          <Link to={`/pets/${id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {pet.name}
          </Link>
        </Button>

        <div className="space-y-2 md:mb-4">
          <h1 className="text-3xl font-bold">Weight Tracker</h1>
          <p className="text-muted-foreground text-sm">Track {pet.name}'s weight over time</p>
        </div>

        <div className="space-y-6">
          <WeightContent />
        </div>
      </main>
    </div>
  );
}
