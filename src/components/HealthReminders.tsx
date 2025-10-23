import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { Calendar, AlertTriangle, CheckCircle, Clock, Syringe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Vaccination {
  id: string;
  name: string;
  date: string;
  due_date: string | null;
  pet_id: string;
  pets: {
    name: string;
    photo_url: string | null;
  };
}

interface HealthReminder {
  id: string;
  type: 'vaccination' | 'checkup' | 'medication';
  title: string;
  petName: string;
  petId: string;
  dueDate: Date;
  daysUntil: number;
  isOverdue: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const HealthReminders = () => {
  const { user } = useAuth();
  const { entitlement } = usePlanV2();
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHealthReminders();
    }
  }, [user]);

  const fetchHealthReminders = async () => {
    try {
      setLoading(true);
      
      // Fetch vaccinations with due dates for user's pets
      const { data: vaccinations, error } = await supabase
        .from('vaccinations')
        .select(`
          id,
          vaccine_name,
          vaccine_date,
          next_due_date,
          pet_id,
          pets!inner(name, photo_url, user_id)
        `)
        .eq('pets.user_id', user?.id)
        .not('next_due_date', 'is', null)
        .order('next_due_date', { ascending: true });

      if (error) {
        console.error('Error fetching vaccinations:', error);
        return;
      }

      // Convert vaccinations to health reminders
      const healthReminders: HealthReminder[] = (vaccinations || []).map((vaccination: any) => {
        const dueDate = new Date(vaccination.next_due_date);
        const today = new Date();
        const daysUntil = differenceInDays(dueDate, today);
        const isOverdue = isBefore(dueDate, today);
        
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (isOverdue || daysUntil <= 7) {
          priority = 'high';
        } else if (daysUntil <= 30) {
          priority = 'medium';
        }

        return {
          id: vaccination.id,
          type: 'vaccination' as const,
          title: `${vaccination.vaccine_name} Vaccination`,
          petName: vaccination.pets.name,
          petId: vaccination.pet_id,
          dueDate,
          daysUntil,
          isOverdue,
          priority
        };
      });

      setReminders(healthReminders);
    } catch (error) {
      console.error('Error fetching health reminders:', error);
      toast.error('Failed to load health reminders');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-destructive text-destructive-foreground';
    switch (priority) {
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getPriorityIcon = (isOverdue: boolean) => {
    return isOverdue ? AlertTriangle : Clock;
  };

  const getStatusText = (daysUntil: number, isOverdue: boolean) => {
    if (isOverdue) {
      const daysOverdue = Math.abs(daysUntil);
      return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;
    }
    
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Health Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const urgentReminders = reminders.filter(r => r.isOverdue || r.daysUntil <= 7);
  const upcomingReminders = reminders.filter(r => !r.isOverdue && r.daysUntil > 7);

  // Apply reminder limits
  const maxReminders = entitlement?.reminders_active_max || 2;
  const displayedReminders = entitlement?.reminders_active_max === null 
    ? reminders 
    : reminders.slice(0, maxReminders);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Health Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedReminders.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Great! No upcoming health reminders. Your pets' health records are up to date.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {urgentReminders.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Urgent ({urgentReminders.length})
                </h4>
                {urgentReminders.map((reminder) => {
                  const Icon = getPriorityIcon(reminder.isOverdue);
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium text-sm">{reminder.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {reminder.petName} • {format(reminder.dueDate, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getPriorityColor(reminder.priority, reminder.isOverdue)}>
                          {getStatusText(reminder.daysUntil, reminder.isOverdue)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {upcomingReminders.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming ({upcomingReminders.length})
                </h4>
                {upcomingReminders.slice(0, 3).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Syringe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.petName} • {format(reminder.dueDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(reminder.priority, false)}>
                        {getStatusText(reminder.daysUntil, false)}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {upcomingReminders.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/dashboard">
                      View {upcomingReminders.length - 3} more reminders
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};