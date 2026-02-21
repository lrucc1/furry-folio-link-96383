import React, { useState, useEffect, useCallback } from 'react';
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
    navigate('/ios-home');
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