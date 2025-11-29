import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, isBefore } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Calendar, CheckCircle, Heart, Syringe, Clock, Pill, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';
import { EditVaccinationModal } from '@/components/EditVaccinationModal';
import { EditHealthReminderModal } from '@/components/EditHealthReminderModal';
import { ReminderNotifications } from '@/components/ReminderNotifications';
import { HealthReminderModal } from '@/components/HealthReminderModal';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

interface Vaccination {
  id: string;
  vaccine_name: string;
  vaccine_date: string;
  next_due_date: string | null;
  pet_id: string;
  notes: string | null;
  recurrence_enabled: boolean | null;
  recurrence_interval: string | null;
  pets: {
    name: string;
    photo_url: string | null;
  };
}

interface HealthReminder {
  id: string;
  title: string;
  reminder_type: string;
  reminder_date: string;
  description: string | null;
  completed: boolean;
  pet_id: string;
  recurrence_enabled: boolean | null;
  recurrence_interval: string | null;
  pets: {
    name: string;
    photo_url: string | null;
  };
}

interface ReminderItem {
  id: string;
  type: 'vaccination' | 'health';
  title: string;
  petName: string;
  petId: string;
  dueDate: Date;
  daysUntil: number;
  isOverdue: boolean;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  details?: string;
  originalData: Vaccination | HealthReminder;
}

export default function Reminders() {
  const { user } = useAuth();
  const isNative = useIsNativeApp();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  const [editingHealthReminder, setEditingHealthReminder] = useState<HealthReminder | null>(null);
  const [pets, setPets] = useState<Array<{id: string, name: string, photo_url: string | null}>>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPetForReminder, setSelectedPetForReminder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllReminders();
      fetchUserPets();
    }
  }, [user]);

  const fetchUserPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('id, name, photo_url')
        .eq('user_id', user?.id)
        .order('name');
      
      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchAllReminders = async () => {
    try {
      setLoading(true);
      
      // Fetch vaccinations
      const { data: vaccinations, error: vacError } = await supabase
        .from('vaccinations')
        .select(`
          id,
          vaccine_name,
          vaccine_date,
          next_due_date,
          pet_id,
          notes,
          recurrence_enabled,
          recurrence_interval,
          pets!inner(name, photo_url, user_id)
        `)
        .eq('pets.user_id', user?.id)
        .not('next_due_date', 'is', null)
        .order('next_due_date', { ascending: true });

      if (vacError) throw vacError;

      // Fetch health reminders
      const { data: healthReminders, error: hrError } = await supabase
        .from('health_reminders')
        .select(`
          id,
          title,
          reminder_type,
          reminder_date,
          description,
          completed,
          pet_id,
          recurrence_enabled,
          recurrence_interval,
          pets!inner(name, photo_url, user_id)
        `)
        .eq('pets.user_id', user?.id)
        .order('reminder_date', { ascending: true });

      if (hrError) throw hrError;

      // Convert to unified format
      const allReminders: ReminderItem[] = [
        ...(vaccinations || []).map((vac: any) => {
          const dueDate = new Date(vac.next_due_date);
          const today = new Date();
          const daysUntil = differenceInDays(dueDate, today);
          const isOverdue = isBefore(dueDate, today);
          
          let priority: 'high' | 'medium' | 'low' = 'low';
          if (isOverdue || daysUntil <= 7) priority = 'high';
          else if (daysUntil <= 30) priority = 'medium';

          return {
            id: vac.id,
            type: 'vaccination' as const,
            title: `${vac.vaccine_name} Vaccination`,
            petName: vac.pets.name,
            petId: vac.pet_id,
            dueDate,
            daysUntil,
            isOverdue,
            priority,
            details: vac.notes,
            originalData: vac
          };
        }),
        ...(healthReminders || []).map((hr: any) => {
          const dueDate = new Date(hr.reminder_date);
          const today = new Date();
          const daysUntil = differenceInDays(dueDate, today);
          const isOverdue = isBefore(dueDate, today) && !hr.completed;
          
          let priority: 'high' | 'medium' | 'low' = 'low';
          if (isOverdue || daysUntil <= 7) priority = 'high';
          else if (daysUntil <= 30) priority = 'medium';

          return {
            id: hr.id,
            type: 'health' as const,
            title: hr.title,
            petName: hr.pets.name,
            petId: hr.pet_id,
            dueDate,
            daysUntil,
            isOverdue,
            priority,
            completed: hr.completed,
            details: hr.description,
            originalData: hr
          };
        })
      ].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

      setReminders(allReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (reminder: ReminderItem) => {
    if (reminder.type !== 'health') return;

    try {
      const { error } = await supabase
        .from('health_reminders')
        .update({ completed: !reminder.completed })
        .eq('id', reminder.id);

      if (error) throw error;

      toast.success(reminder.completed ? 'Reminder marked as incomplete' : 'Reminder marked as complete');
      fetchAllReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const handleAddReminder = () => {
    if (pets.length === 0) {
      toast.error('Please add a pet first before creating reminders');
      return;
    }
    
    if (pets.length === 1) {
      setSelectedPetForReminder(pets[0].id);
      setShowAddModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleReminderSuccess = () => {
    fetchAllReminders();
    setShowAddModal(false);
    setSelectedPetForReminder(null);
  };

  const handleRefresh = useCallback(async () => {
    await fetchAllReminders();
    toast.success('Reminders refreshed');
  }, [user]);

  const getStatusText = (daysUntil: number, isOverdue: boolean, completed?: boolean) => {
    if (completed) return 'Completed';
    if (isOverdue) {
      const daysOverdue = Math.abs(daysUntil);
      return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;
    }
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
  };

  const getIcon = (type: string) => {
    if (type === 'vaccination') return Syringe;
    return Pill;
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);
  const urgentReminders = activeReminders.filter(r => r.isOverdue || r.daysUntil <= 7);
  const upcomingReminders = activeReminders.filter(r => !r.isOverdue && r.daysUntil > 7);

  const addButton = (
    <Button 
      onClick={handleAddReminder}
      size="sm"
      className="gap-2"
    >
      <Plus className="w-4 h-4" />
      Add
    </Button>
  );

  const RemindersContent = () => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`font-bold flex items-center gap-2 mb-1 ${isNative ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
            <Heart className={`${isNative ? 'w-5 h-5' : 'w-6 h-6 sm:w-8 sm:h-8'}`} />
            Health Reminders
          </h1>
          <p className={`text-muted-foreground ${isNative ? 'text-xs' : 'text-sm sm:text-base'}`}>
            Track vaccinations and health reminders
          </p>
        </div>
        {!isNative && (
          <Button 
            onClick={handleAddReminder}
            size="lg"
            className="gap-2 hidden sm:flex"
          >
            <Plus className="w-5 h-5" />
            Add Reminder
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Active ({activeReminders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              Done ({completedReminders.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">
              Emails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeReminders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-medium mb-2">All caught up!</p>
                  <p className="text-muted-foreground">No active health reminders</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {urgentReminders.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Urgent ({urgentReminders.length})
                    </h2>
                    {urgentReminders.map((reminder) => {
                      const Icon = getIcon(reminder.type);
                      return (
                        <Card 
                          key={reminder.id} 
                          className="border-red-200 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => {
                            if (reminder.type === 'vaccination') {
                              setEditingVaccination(reminder.originalData as Vaccination);
                            } else {
                              setEditingHealthReminder(reminder.originalData as HealthReminder);
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <Icon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                 <div className="flex-1">
                                   <h3 className="font-semibold">{reminder.title}</h3>
                                   <p className="text-sm text-muted-foreground">
                                     {reminder.petName} • {format(reminder.dueDate, 'MMM dd, yyyy')}
                                   </p>
                                   {(reminder.originalData as any).recurrence_enabled && (
                                     <Badge variant="secondary" className="mt-1 text-xs">
                                       Repeats {(reminder.originalData as any).recurrence_interval}
                                     </Badge>
                                   )}
                                   {reminder.details && (
                                     <p className="text-sm text-muted-foreground mt-2">{reminder.details}</p>
                                   )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant={reminder.isOverdue ? 'destructive' : 'secondary'}>
                                  {getStatusText(reminder.daysUntil, reminder.isOverdue)}
                                </Badge>
                                {reminder.type === 'health' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleComplete(reminder);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Done
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {upcomingReminders.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Upcoming ({upcomingReminders.length})
                    </h2>
                    {upcomingReminders.map((reminder) => {
                      const Icon = getIcon(reminder.type);
                      return (
                        <Card 
                          key={reminder.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            if (reminder.type === 'vaccination') {
                              setEditingVaccination(reminder.originalData as Vaccination);
                            } else {
                              setEditingHealthReminder(reminder.originalData as HealthReminder);
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                 <div className="flex-1">
                                   <h3 className="font-semibold">{reminder.title}</h3>
                                   <p className="text-sm text-muted-foreground">
                                     {reminder.petName} • {format(reminder.dueDate, 'MMM dd, yyyy')}
                                   </p>
                                   {(reminder.originalData as any).recurrence_enabled && (
                                     <Badge variant="secondary" className="mt-1 text-xs">
                                       Repeats {(reminder.originalData as any).recurrence_interval}
                                     </Badge>
                                   )}
                                   {reminder.details && (
                                     <p className="text-sm text-muted-foreground mt-2">{reminder.details}</p>
                                   )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="outline">
                                  {getStatusText(reminder.daysUntil, reminder.isOverdue)}
                                </Badge>
                                {reminder.type === 'health' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleComplete(reminder);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Done
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedReminders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No completed reminders</p>
                  <p className="text-muted-foreground">Completed health reminders will appear here</p>
                </CardContent>
              </Card>
            ) : (
              completedReminders.map((reminder) => {
                const Icon = getIcon(reminder.type);
                return (
                  <Card 
                    key={reminder.id} 
                    className="opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      if (reminder.type === 'health') {
                        setEditingHealthReminder(reminder.originalData as HealthReminder);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold line-through">{reminder.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {reminder.petName} • {format(reminder.dueDate, 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(reminder);
                          }}
                        >
                          Undo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="notifications">
            <ReminderNotifications />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );

  // iOS Native Layout
  if (isNative) {
    return (
      <IOSPageLayout title="Reminders" headerRight={addButton} onRefresh={handleRefresh}>
        <div className="px-4 py-4">
          <RemindersContent />
        </div>

        {/* Pet selection dialog */}
        {showAddModal && pets.length > 1 && !selectedPetForReminder && (
          <AlertDialog open={showAddModal && !selectedPetForReminder} onOpenChange={(open) => !open && setShowAddModal(false)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Select a Pet</AlertDialogTitle>
                <AlertDialogDescription>
                  Which pet would you like to add a health reminder for?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-2 py-4">
                {pets.map(pet => (
                  <Button
                    key={pet.id}
                    variant="outline"
                    className="justify-start gap-3 h-auto py-3"
                    onClick={() => {
                      setSelectedPetForReminder(pet.id);
                    }}
                  >
                    {pet.photo_url && (
                      <img 
                        src={pet.photo_url} 
                        alt={pet.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium">{pet.name}</span>
                  </Button>
                ))}
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Add Health Reminder Modal */}
        {selectedPetForReminder && (
          <HealthReminderModal
            open={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setSelectedPetForReminder(null);
            }}
            petId={selectedPetForReminder}
            onSuccess={handleReminderSuccess}
          />
        )}

        {editingVaccination && (
          <EditVaccinationModal
            vaccination={editingVaccination}
            petId={editingVaccination.pet_id}
            open={!!editingVaccination}
            onClose={() => setEditingVaccination(null)}
            onSuccess={() => {
              fetchAllReminders();
              setEditingVaccination(null);
            }}
          />
        )}

        {editingHealthReminder && (
          <EditHealthReminderModal
            reminder={editingHealthReminder}
            petId={editingHealthReminder.pet_id}
            open={!!editingHealthReminder}
            onClose={() => setEditingHealthReminder(null)}
            onSuccess={() => {
              fetchAllReminders();
              setEditingHealthReminder(null);
            }}
          />
        )}
      </IOSPageLayout>
    );
  }

  // Web Layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <RemindersContent />
        </div>
      </main>
      <Footer />

      {/* Pet selection dialog */}
      {showAddModal && pets.length > 1 && !selectedPetForReminder && (
        <AlertDialog open={showAddModal && !selectedPetForReminder} onOpenChange={(open) => !open && setShowAddModal(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Select a Pet</AlertDialogTitle>
              <AlertDialogDescription>
                Which pet would you like to add a health reminder for?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2 py-4">
              {pets.map(pet => (
                <Button
                  key={pet.id}
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3"
                  onClick={() => {
                    setSelectedPetForReminder(pet.id);
                  }}
                >
                  {pet.photo_url && (
                    <img 
                      src={pet.photo_url} 
                      alt={pet.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium">{pet.name}</span>
                </Button>
              ))}
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Add Health Reminder Modal */}
      {selectedPetForReminder && (
        <HealthReminderModal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedPetForReminder(null);
          }}
          petId={selectedPetForReminder}
          onSuccess={handleReminderSuccess}
        />
      )}

      {editingVaccination && (
        <EditVaccinationModal
          vaccination={editingVaccination}
          petId={editingVaccination.pet_id}
          open={!!editingVaccination}
          onClose={() => setEditingVaccination(null)}
          onSuccess={() => {
            fetchAllReminders();
            setEditingVaccination(null);
          }}
        />
      )}

      {editingHealthReminder && (
        <EditHealthReminderModal
          reminder={editingHealthReminder}
          petId={editingHealthReminder.pet_id}
          open={!!editingHealthReminder}
          onClose={() => setEditingHealthReminder(null)}
          onSuccess={() => {
            fetchAllReminders();
            setEditingHealthReminder(null);
          }}
        />
      )}
    </div>
  );
}
