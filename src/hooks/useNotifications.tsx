import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  getUnreadCount,
  type Notification,
} from "@/services/notifications";

const TOAST_LABELS: Record<string, string> = {
  appointment_created: "📅",
  appointment_confirmed: "✅",
  appointment_cancelled: "❌",
  appointment_reminder: "⏰",
  new_message: "💬",
  payment_received: "💳",
  mood_update: "💚",
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    load();
    const unsubscribe = subscribeToNotifications(user.id, (n) => {
      setNotifications((prev) => [n, ...prev]);
      const emoji = TOAST_LABELS[n.type] ?? "🔔";
      toast.info(`${emoji} ${n.title}`, { duration: 4000 });
    });
    return unsubscribe;
  }, [user, load]);

  const markRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  return {
    notifications,
    unreadCount: getUnreadCount(notifications),
    isLoading,
    markRead,
    markAllRead,
  };
}
