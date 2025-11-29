import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Calendar, Syringe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReminderNotification {
  id: string;
  reminder_type: string;
  days_before: number;
  sent_at: string;
  status: string;
  pet_id: string;
}

export function ReminderNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("reminder_notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("sent_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return <Syringe className="h-4 w-4" />;
      case "health_reminder":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No reminder notifications sent yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
              >
                <div className="mt-0.5">{getNotificationIcon(notification.reminder_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {notification.reminder_type === "vaccination"
                        ? "Vaccination"
                        : "Health Reminder"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {notification.days_before === 1
                        ? "1 day notice"
                        : `${notification.days_before} days notice`}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sent {formatDate(notification.sent_at)}
                  </p>
                </div>
                <Badge
                  variant={notification.status === "sent" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {notification.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
