import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertTriangle, CheckCircle, Syringe, Heart, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, isBefore } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'vaccination' | 'health_reminder' | 'lost_pet' | 'general' | 'pet_invite';
  dueDate: Date;
  petName?: string;
  isOverdue: boolean;
  priority: 'high' | 'medium' | 'low';
  read?: boolean;
}

export const NotificationsDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [invitesCount, setInvitesCount] = useState(0);
  const [invitesNotified, setInvitesNotified] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  // Fetch pending invites count to drive badge and toast
  const fetchInvitesCount = async () => {
    if (!user?.email) { setInvitesCount(0); return; }
    const { count } = await supabase
      .from('pet_invites')
      .select('id', { count: 'exact', head: true })
      .eq('email', user.email.toLowerCase())
      .eq('status', 'pending');
    const c = count || 0;
    setInvitesCount(c);
    if (c > 0 && !invitesNotified) {
      toast.info('You have a pending pet invite');
      setInvitesNotified(true);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitesCount();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const today = new Date();
      const allNotifications: Notification[] = [];
      
      // 1. Fetch upcoming vaccinations
      const { data: vaccinations } = await supabase
        .from('vaccinations')
        .select(`
          id,
          vaccine_name,
          next_due_date,
          pets!inner(name, user_id)
        `)
        .eq('pets.user_id', user?.id)
        .not('next_due_date', 'is', null)
        .order('next_due_date', { ascending: true })
        .limit(10);

      (vaccinations || []).forEach((vaccination: any) => {
        const dueDate = new Date(vaccination.next_due_date);
        const daysUntil = differenceInDays(dueDate, today);
        const isOverdue = isBefore(dueDate, today);
        
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (isOverdue || daysUntil <= 7) priority = 'high';
        else if (daysUntil <= 30) priority = 'medium';

        allNotifications.push({
          id: `vac-${vaccination.id}`,
          title: `${vaccination.vaccine_name} Due`,
          message: isOverdue 
            ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'}`
            : daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
          type: 'vaccination',
          dueDate,
          petName: vaccination.pets.name,
          isOverdue,
          priority
        });
      });

      // 2. Fetch health reminders
      const { data: reminders } = await supabase
        .from('health_reminders')
        .select(`
          id,
          title,
          reminder_date,
          reminder_type,
          completed,
          pets!inner(name, user_id)
        `)
        .eq('pets.user_id', user?.id)
        .eq('completed', false)
        .order('reminder_date', { ascending: true })
        .limit(10);

      (reminders || []).forEach((reminder: any) => {
        const dueDate = new Date(reminder.reminder_date);
        const daysUntil = differenceInDays(dueDate, today);
        const isOverdue = isBefore(dueDate, today);
        
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (isOverdue || daysUntil <= 3) priority = 'high';
        else if (daysUntil <= 14) priority = 'medium';

        allNotifications.push({
          id: `rem-${reminder.id}`,
          title: reminder.title,
          message: isOverdue 
            ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'}`
            : daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
          type: 'health_reminder',
          dueDate,
          petName: reminder.pets.name,
          isOverdue,
          priority
        });
      });

      // 3. Fetch lost pets
      const { data: lostPets } = await supabase
        .from('pets')
        .select('id, name, updated_at')
        .eq('user_id', user?.id)
        .eq('is_lost', true);

      (lostPets || []).forEach((pet: any) => {
        allNotifications.push({
          id: `lost-${pet.id}`,
          title: `${pet.name} is Marked as Lost`,
          message: 'Tap to view recovery options',
          type: 'lost_pet',
          dueDate: new Date(pet.updated_at),
          petName: pet.name,
          isOverdue: true,
          priority: 'high'
        });
      });

      // 4. Fetch general notifications
      const { data: generalNotifs } = await supabase
        .from('notifications')
        .select('id, title, message, type, read, created_at')
        .eq('user_id', user?.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      (generalNotifs || []).forEach((notif: any) => {
        allNotifications.push({
          id: `gen-${notif.id}`,
          title: notif.title,
          message: notif.message,
          type: 'general',
          dueDate: new Date(notif.created_at),
          isOverdue: false,
          priority: notif.type === 'error' ? 'high' : 'medium',
          read: notif.read
        });
      });

      // 5. Fetch pending pet invites
      const { data: invites } = await supabase
        .from('pet_invites')
        .select(`
          id,
          role,
          status,
          created_at,
          pets!inner(name)
        `)
        .eq('email', user?.email.toLowerCase())
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      (invites || []).forEach((invite: any) => {
        allNotifications.push({
          id: `inv-${invite.id}`,
          title: 'Pet Invitation',
          message: `You've been invited as ${invite.role} for ${invite.pets.name}`,
          type: 'pet_invite',
          dueDate: new Date(invite.created_at),
          petName: invite.pets.name,
          isOverdue: false,
          priority: 'medium'
        });
      });

      // Sort by priority and date
      allNotifications.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.dueDate.getTime() - b.dueDate.getTime();
      });

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string, isOverdue: boolean) => {
    if (type === 'lost_pet') return AlertCircle;
    if (type === 'pet_invite') return UserPlus;
    if (type === 'health_reminder') return Heart;
    if (type === 'vaccination') return Syringe;
    if (isOverdue) return AlertTriangle;
    return Calendar;
  };
  
  const getNotificationColor = (type: string, isOverdue: boolean) => {
    if (type === 'lost_pet') return 'text-destructive';
    if (isOverdue) return 'text-destructive';
    return 'text-primary';
  };

  const urgentCount = notifications.filter(n => n.isOverdue || n.priority === 'high').length;
  const badgeCount = invitesCount > 0 ? invitesCount : urgentCount;

  const handleNotificationClick = () => {
    setIsOpen(false);
    navigate('/dashboard');
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 block" />
          {badgeCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-red-600 text-white border-2 border-background">
              {badgeCount > 9 ? '9+' : badgeCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {urgentCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {urgentCount} urgent
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem className="flex flex-col items-center py-6 text-center">
            <CheckCircle className="w-8 h-8 text-success mb-2" />
            <span className="font-medium">All caught up!</span>
            <span className="text-sm text-muted-foreground">No urgent notifications</span>
          </DropdownMenuItem>
        ) : (
          <>
            {notifications.slice(0, 5).map((notification) => {
              const Icon = getNotificationIcon(notification.type, notification.isOverdue);
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                  onClick={handleNotificationClick}
                >
                  <div className={`p-2 rounded-full ${notification.type === 'lost_pet' || notification.isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <Icon className={`w-4 h-4 ${getNotificationColor(notification.type, notification.isOverdue)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {notification.petName ? `${notification.petName} - ` : ''}{notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(notification.dueDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
            
            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-center text-sm text-primary cursor-pointer"
                  onClick={handleNotificationClick}
                >
                  View all {notifications.length} notifications
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};