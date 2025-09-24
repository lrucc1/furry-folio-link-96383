import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'vaccination' | 'checkup' | 'reminder';
  dueDate: Date;
  petName: string;
  isOverdue: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const NotificationsDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming vaccinations as notifications
      const { data: vaccinations, error } = await supabase
        .from('vaccinations')
        .select(`
          id,
          name,
          due_date,
          pets!inner(name, user_id)
        `)
        .eq('pets.user_id', user?.id)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const today = new Date();
      const notificationList: Notification[] = (vaccinations || []).map((vaccination: any) => {
        const dueDate = new Date(vaccination.due_date);
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
          title: `${vaccination.name} Due`,
          message: isOverdue 
            ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'}`
            : daysUntil === 0 
              ? 'Due today'
              : `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
          type: 'vaccination' as const,
          dueDate,
          petName: vaccination.pets.name,
          isOverdue,
          priority
        };
      });

      setNotifications(notificationList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string, isOverdue: boolean) => {
    if (isOverdue) return AlertTriangle;
    return Calendar;
  };

  const urgentCount = notifications.filter(n => n.isOverdue || n.priority === 'high').length;

  const handleNotificationClick = () => {
    setIsOpen(false);
    navigate('/dashboard');
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {urgentCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-destructive text-destructive-foreground">
              {urgentCount > 9 ? '9+' : urgentCount}
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
                  <div className={`p-2 rounded-full ${notification.isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <Icon className={`w-4 h-4 ${notification.isOverdue ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {notification.petName} - {notification.title}
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