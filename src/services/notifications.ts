import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: {
    patientId?: string;
    patientName?: string;
    moodScore?: number;
    moodEmoji?: string;
    entryId?: string;
    createdAt?: string;
    appointmentId?: string;
    [key: string]: unknown;
  } | null;
  is_read: boolean;
  email_sent: boolean;
  created_at: string;
}

export async function getMyNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching notifications:", error);
    throw new Error(error.message);
  }

  return (data as Notification[]) || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw new Error(error.message);
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error(error.message);
  }
}

export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.is_read).length;
}
