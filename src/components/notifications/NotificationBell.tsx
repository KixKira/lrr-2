import {
  Bell,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  CreditCard,
  Heart,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/services/notifications";

const TYPE_ICON: Record<string, React.ElementType> = {
  appointment_created: Calendar,
  appointment_confirmed: CheckCircle,
  appointment_cancelled: XCircle,
  appointment_reminder: Clock,
  new_message: MessageCircle,
  payment_received: CreditCard,
  mood_update: Heart,
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `Hace ${d}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const Icon = TYPE_ICON[notification.type] ?? Bell;
  const unread = !notification.is_read;

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors",
        unread ? "bg-calm/10" : "hover:bg-muted/40"
      )}
    >
      <div
        className={cn(
          "mt-0.5 rounded-full p-1.5 shrink-0",
          unread ? "bg-calm/20 text-calm" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-snug",
            unread ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {relativeTime(notification.created_at)}
        </p>
      </div>
      {unread && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="text-muted-foreground hover:text-calm shrink-0 mt-1 transition-colors"
          title="Marcar como leída"
        >
          <CheckCheck className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:bg-calm/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral border-2 border-background text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notificaciones</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-calm hover:underline transition-colors"
            >
              Marcar todas leídas
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Bell className="h-8 w-8 opacity-25" />
              <p className="text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 px-1">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
