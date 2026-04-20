import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  FileText,
  Check,
  X,
  MessageCircle,
  ChevronRight,
  Stethoscope,
  ArrowLeft,
  Bell,
  Heart,
  CheckCheck,
  Plus,
  Trash2,
  Save,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getMyNotifications,
  markNotificationAsRead,
  Notification,
  subscribeToNotifications,
} from "@/services/notifications";
import { getAvailability, saveAvailability, deleteAvailabilitySlot, updateAppointment } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";

interface ProfessionalAppointment {
  id: string;
  patient_id: string;
  scheduled_at: string;
  appointment_type: "online" | "in_person";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  price: number | null;
  patient?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string;
  };
}

const mockClinicalNotes = [
  {
    id: "1",
    patient_name: "Juan Pérez",
    date: "2026-02-01",
    summary:
      "Paciente presenta mejoras significativas en manejo de ansiedad...",
  },
  {
    id: "2",
    patient_name: "Laura Martínez",
    date: "2026-01-28",
    summary: "Continuamos trabajando en técnicas de mindfulness...",
  },
];

// Días de la semana
const DAYS_OF_WEEK = [
  { id: 0, name: "Domingo", short: "Dom" },
  { id: 1, name: "Lunes", short: "Lun" },
  { id: 2, name: "Martes", short: "Mar" },
  { id: 3, name: "Miércoles", short: "Mié" },
  { id: 4, name: "Jueves", short: "Jue" },
  { id: 5, name: "Viernes", short: "Vie" },
  { id: 6, name: "Sábado", short: "Sáb" },
];

// Horarios predefinidos
const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00",
];

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1 h 30 min" },
  { value: 120, label: "2 horas" },
];

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  slotDuration: number;
}

const ProfessionalDashboard = () => {
  const { user, isProfessional, isAdmin, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "appointments" | "clinical" | "schedule" | "payments"
  >("appointments");
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [clinicalNotes, setClinicalNotes] = useState(mockClinicalNotes);
  const [newNote, setNewNote] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Estados para disponibilidad
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newSlotStart, setNewSlotStart] = useState("09:00");
  const [newSlotEnd, setNewSlotEnd] = useState("17:00");
  const [newSlotDuration, setNewSlotDuration] = useState(60);
  const [slotToDelete, setSlotToDelete] = useState<AvailabilitySlot | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || (!isProfessional && !isAdmin))) {
      navigate("/auth");
      toast.error("Acceso denegado. Solo profesionales.");
    }
  }, [user, isProfessional, isAdmin, isLoading, navigate]);

  // Cargar citas reales del profesional
  useEffect(() => {
    if (!user || isLoading) return;

    const loadAppointments = async () => {
      setIsLoadingAppointments(true);
      try {
        const { data: prof } = await supabase
          .from("professionals")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!prof) {
          setIsLoadingAppointments(false);
          return;
        }

        const { data: apts, error } = await supabase
          .from("appointments")
          .select("id, patient_id, scheduled_at, appointment_type, status, notes, price")
          .eq("professional_id", prof.id)
          .order("scheduled_at", { ascending: true });

        if (error) throw error;

        const patientIds = [...new Set((apts || []).map((a) => a.patient_id))];
        let profilesMap: Record<string, ProfessionalAppointment["patient"]> = {};

        if (patientIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, avatar_url, email")
            .in("user_id", patientIds);

          if (profiles) {
            profilesMap = profiles.reduce(
              (acc, p) => ({ ...acc, [p.user_id]: p }),
              {}
            );
          }
        }

        setAppointments(
          (apts || []).map((apt) => ({
            ...apt,
            appointment_type: apt.appointment_type as ProfessionalAppointment["appointment_type"],
            status: apt.status as ProfessionalAppointment["status"],
            patient: profilesMap[apt.patient_id],
          }))
        );
      } catch (error) {
        console.error("Error loading appointments:", error);
        toast.error("Error al cargar las citas");
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [user, isLoading]);

  // Cargar disponibilidad del profesional
  useEffect(() => {
    if (!user || activeTab !== "schedule") return;

    const loadAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        // Obtener el professional_id del usuario actual
        const { data: professional } = await supabase
          .from("professionals")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (professional) {
          const data = await getAvailability(professional.id);
          const dayMap: Record<string, number> = {
            Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
            Thursday: 4, Friday: 5, Saturday: 6,
          };
          const transformedSlots: AvailabilitySlot[] = (data.availability || []).map(
            (slot: { id: string; dayOfWeek: string; startTime: string; endTime: string; slotDuration: number }) => ({
              id: slot.id,
              dayOfWeek: dayMap[slot.dayOfWeek] ?? 0,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: true,
              slotDuration: slot.slotDuration ?? 60,
            })
          );
          setAvailability(transformedSlots);
        }
      } catch (error) {
        console.error("Error loading availability:", error);
        toast.error("Error al cargar la disponibilidad");
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    loadAvailability();
  }, [user, activeTab]);

  // Load notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const data = await getMyNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();

    // Subscribe to realtime notifications
    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      if (newNotification.type === "mood_update") {
        toast.info(
          `${newNotification.content?.patientName || "Un paciente"} registró un nuevo estado de ánimo ${newNotification.content?.moodEmoji || ""}`,
          {
            duration: 5000,
          }
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const moodNotifications = notifications.filter((n) => n.type === "mood_update");

  const handleAppointmentAction = async (
    appointmentId: string,
    action: "confirm" | "cancel",
  ) => {
    const newStatus = action === "confirm" ? "confirmed" : "cancelled";
    try {
      await updateAppointment({ appointmentId, status: newStatus });
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
      toast.success(action === "confirm" ? "Cita confirmada" : "Cita cancelada");
    } catch {
      toast.error("Error al actualizar la cita");
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedPatient) return;

    const note = {
      id: Date.now().toString(),
      patient_name: selectedPatient,
      date: new Date().toISOString().split("T")[0],
      summary: newNote,
    };

    setClinicalNotes((prev) => [note, ...prev]);
    setNewNote("");
    setSelectedPatient(null);
    toast.success("Nota clínica guardada");
  };

  // Convierte "HH:MM" a minutos totales para comparaciones
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Funciones para disponibilidad
  const handleAddSlot = () => {
    if (selectedDay === null) {
      toast.error("Selecciona un día de la semana");
      return;
    }

    const newStartMin = toMinutes(newSlotStart);
    const newEndMin = toMinutes(newSlotEnd);

    if (newEndMin <= newStartMin) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }

    if (newEndMin - newStartMin < newSlotDuration) {
      toast.error(`El rango debe ser de al menos ${newSlotDuration} minutos para la duración seleccionada`);
      return;
    }

    const existingSlotsForDay = availability.filter(s => s.dayOfWeek === selectedDay);
    const hasOverlap = existingSlotsForDay.some(slot => {
      const existingStart = toMinutes(slot.startTime);
      const existingEnd = toMinutes(slot.endTime);
      return newStartMin < existingEnd && newEndMin > existingStart;
    });

    if (hasOverlap) {
      toast.error("Este rango se solapa con un horario existente");
      return;
    }

    const newSlot: AvailabilitySlot = {
      dayOfWeek: selectedDay,
      startTime: newSlotStart,
      endTime: newSlotEnd,
      isAvailable: true,
      slotDuration: newSlotDuration,
    };

    setAvailability((prev) => [...prev, newSlot]);
    toast.success("Horario agregado");
  };

  const handleRemoveSlot = (slot: AvailabilitySlot) => {
    if (slot.id) {
      // Slot existente en la base de datos
      setSlotToDelete(slot);
    } else {
      // Slot nuevo aún no guardado
      setAvailability((prev) =>
        prev.filter(
          (s) =>
            !(s.dayOfWeek === slot.dayOfWeek &&
              s.startTime === slot.startTime &&
              s.endTime === slot.endTime)
        )
      );
    }
  };

  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;

    try {
      if (slotToDelete.id) {
        await deleteAvailabilitySlot(slotToDelete.id);
      }

      setAvailability((prev) => prev.filter((s) => s.id !== slotToDelete.id));
      toast.success("Horario eliminado");
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Error al eliminar el horario");
    } finally {
      setSlotToDelete(null);
    }
  };

  const handleSaveAvailability = async () => {
    setIsSavingAvailability(true);
    try {
      // Filtrar solo slots sin ID (nuevos)
      const newSlots = availability.filter(s => !s.id);

      if (newSlots.length > 0) {
        await saveAvailability(
          newSlots.map((s) => ({ ...s, slotDurationMinutes: s.slotDuration }))
        );
        toast.success("Disponibilidad guardada exitosamente");

        // Recargar para obtener los IDs asignados por la BD
        const { data: professional } = await supabase
          .from("professionals")
          .select("id")
          .eq("user_id", user?.id || "")
          .maybeSingle();

        if (professional) {
          const data = await getAvailability(professional.id);
          const dayMap: Record<string, number> = {
            Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
            Thursday: 4, Friday: 5, Saturday: 6,
          };
          const transformedSlots: AvailabilitySlot[] = (data.availability || []).map(
            (slot: { id: string; dayOfWeek: string; startTime: string; endTime: string; slotDuration: number }) => ({
              id: slot.id,
              dayOfWeek: dayMap[slot.dayOfWeek] ?? 0,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: true,
              slotDuration: slot.slotDuration ?? 60,
            })
          );
          setAvailability(transformedSlots);
        }
      } else {
        toast.info("No hay cambios nuevos para guardar");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Error al guardar la disponibilidad");
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const getSlotsForDay = (dayId: number) => {
    return availability
      .filter((s) => s.dayOfWeek === dayId)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calm"></div>
      </div>
    );
  }

  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed");

  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const nonCancelled = appointments.filter((a) => a.status !== "cancelled");
    const totalPatients = new Set(nonCancelled.map((a) => a.patient_id)).size;
    const appointmentsThisWeek = appointments.filter((a) => {
      const d = new Date(a.scheduled_at);
      return d >= startOfWeek && d < endOfWeek && a.status !== "cancelled";
    }).length;
    const pendingCount = appointments.filter((a) => a.status === "pending").length;
    const monthlyEarnings = appointments
      .filter((a) => {
        const d = new Date(a.scheduled_at);
        return a.status === "completed" && d >= startOfMonth && d < endOfMonth;
      })
      .reduce((sum, a) => sum + (a.price || 0), 0);

    return { totalPatients, appointmentsThisWeek, pendingAppointments: pendingCount, monthlyEarnings };
  }, [appointments]);

  const statCards = [
    { label: "Pacientes", value: stats.totalPatients, icon: Users, color: "calm" },
    { label: "Citas esta semana", value: stats.appointmentsThisWeek, icon: Calendar, color: "lavender" },
    { label: "Pendientes", value: stats.pendingAppointments, icon: Clock, color: "coral" },
    { label: "Ingresos del mes", value: `$${stats.monthlyEarnings.toFixed(2)}`, icon: DollarSign, color: "sage" },
  ];

  const tabs = [
    { id: "appointments", label: "Citas", icon: Calendar },
    { id: "clinical", label: "Historias Clínicas", icon: FileText },
    { id: "schedule", label: "Horarios", icon: Clock },
    { id: "payments", label: "Mis Pagos", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen pb-8">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back button */}
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-lavender-light flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-lavender" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Hola, {profile?.first_name || "Profesional"}
                </h1>
                <p className="text-muted-foreground">Panel Profesional</p>
              </div>
            </div>

            {/* Notifications */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notificaciones</h4>
                    {moodNotifications.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {moodNotifications.length} estado(s) de ánimo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {moodNotifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay notificaciones</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {moodNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`p-3 border-b border-border last:border-0 ${
                            !notification.is_read ? "bg-calm-light/30" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-lavender-light flex items-center justify-center flex-shrink-0">
                              <Heart className="h-4 w-4 text-lavender" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                {notification.content?.patientName || "Un paciente"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                registró un estado de ánimo{" "}
                                {notification.content?.moodEmoji}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.created_at).toLocaleDateString(
                                  "es-ES",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckCheck className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-elevated p-5"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-${stat.color}-light flex items-center justify-center mb-3`}
                  >
                    <Icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "calm" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="flex-shrink-0"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Content */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              {isLoadingAppointments ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-calm" />
                </div>
              ) : (
                <>
                  {/* Pending Appointments */}
                  {pendingAppointments.length > 0 && (
                    <div className="card-elevated p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-coral" />
                        Citas Pendientes de Confirmación
                      </h3>
                      <div className="space-y-3">
                        {pendingAppointments.map((apt) => {
                          const patientName = apt.patient
                            ? `${apt.patient.first_name ?? ""} ${apt.patient.last_name ?? ""}`.trim() || apt.patient.email
                            : "Paciente";
                          const patientInitial = patientName[0]?.toUpperCase() ?? "P";
                          const aptDate = new Date(apt.scheduled_at);
                          return (
                            <div
                              key={apt.id}
                              className="flex items-center justify-between p-4 rounded-xl bg-coral-light/30 border border-coral/20"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-calm-light flex items-center justify-center overflow-hidden">
                                  {apt.patient?.avatar_url ? (
                                    <img src={apt.patient.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                  ) : (
                                    <span className="text-calm font-medium">{patientInitial}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{patientName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {aptDate.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                                    {" a las "}
                                    {aptDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                    {" • "}
                                    {apt.appointment_type === "online" ? "Online" : "Presencial"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleAppointmentAction(apt.id, "cancel")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="calm"
                                  size="sm"
                                  onClick={() => handleAppointmentAction(apt.id, "confirm")}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Confirmed Appointments */}
                  <div className="card-elevated p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-sage" />
                      Citas Confirmadas
                    </h3>
                    <div className="space-y-3">
                      {confirmedAppointments.map((apt) => {
                        const patientName = apt.patient
                          ? `${apt.patient.first_name ?? ""} ${apt.patient.last_name ?? ""}`.trim() || apt.patient.email
                          : "Paciente";
                        const patientInitial = patientName[0]?.toUpperCase() ?? "P";
                        const aptDate = new Date(apt.scheduled_at);
                        return (
                          <div
                            key={apt.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-calm-light flex items-center justify-center overflow-hidden">
                                {apt.patient?.avatar_url ? (
                                  <img src={apt.patient.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <span className="text-calm font-medium">{patientInitial}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{patientName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {aptDate.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                                  {" a las "}
                                  {aptDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-sage-light text-sage">
                                {apt.appointment_type === "online" ? "Online" : "Presencial"}
                              </Badge>
                              <Button variant="ghost" size="icon">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {confirmedAppointments.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay citas confirmadas
                        </div>
                      )}
                    </div>
                  </div>

                  {pendingAppointments.length === 0 && confirmedAppointments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p>No hay citas registradas aún</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "clinical" && (
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-lavender" />
                  Historias Clínicas
                </h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="calm" size="sm">
                      Nueva Nota
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Nota Clínica</DialogTitle>
                      <DialogDescription>
                        Registra observaciones sobre la sesión con el paciente
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Paciente</label>
                        <select
                          className="w-full p-2 rounded-lg border border-border bg-background"
                          value={selectedPatient || ""}
                          onChange={(e) => setSelectedPatient(e.target.value)}
                        >
                          <option value="">Seleccionar paciente</option>
                          {appointments.map((apt) => {
                            const name = apt.patient
                              ? `${apt.patient.first_name ?? ""} ${apt.patient.last_name ?? ""}`.trim() || apt.patient.email
                              : apt.patient_id;
                            return (
                              <option key={apt.id} value={name}>{name}</option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Notas de la sesión
                        </label>
                        <Textarea
                          placeholder="Escribe tus observaciones..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={5}
                        />
                      </div>
                      <Button className="w-full" onClick={handleAddNote}>
                        Guardar Nota
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {clinicalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{note.patient_name}</p>
                      <span className="text-xs text-muted-foreground">
                        {note.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.summary}
                    </p>
                  </div>
                ))}

                {clinicalNotes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay notas clínicas registradas
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6">
              {/* Header con instrucciones */}
              <div className="card-elevated p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-calm-light flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-calm" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Configura tu disponibilidad</h3>
                    <p className="text-muted-foreground text-sm">
                      Define los días y horarios en los que puedes atender pacientes.
                      Los pacientes solo podrán agendar citas en estos horarios.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Panel izquierdo: Selector de día */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="card-elevated p-4">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Selecciona un día
                    </h4>
                    <div className="space-y-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const slotsCount = getSlotsForDay(day.id).length;
                        return (
                          <button
                            key={day.id}
                            onClick={() => setSelectedDay(day.id)}
                            className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${
                              selectedDay === day.id
                                ? "bg-calm text-white"
                                : "bg-muted/50 hover:bg-muted"
                            }`}
                          >
                            <span className="font-medium">{day.name}</span>
                            <div className="flex items-center gap-2">
                              {slotsCount > 0 && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  selectedDay === day.id
                                    ? "bg-white/20"
                                    : "bg-calm/10 text-calm"
                                }`}>
                                  {slotsCount} horario{slotsCount !== 1 ? "s" : ""}
                                </span>
                              )}
                              <ChevronRight className={`h-4 w-4 ${
                                selectedDay === day.id ? "opacity-100" : "opacity-50"
                              }`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumen de disponibilidad */}
                  <div className="card-elevated p-4">
                    <h4 className="font-medium mb-3">Resumen</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Días configurados</span>
                        <span className="font-medium">
                          {new Set(availability.map(s => s.dayOfWeek)).size} / 7
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total horarios</span>
                        <span className="font-medium">{availability.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel derecho: Configuración de horarios */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedDay !== null ? (
                    <>
                      <div className="card-elevated p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Configura los horarios de atención para este día
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Sun className="h-5 w-5 text-amber-500" />
                          </div>
                        </div>

                        {/* Formulario para agregar horario */}
                        <div className="bg-muted/30 p-4 rounded-xl mb-6">
                          <h4 className="font-medium mb-4 text-sm">Agregar rango de atención</h4>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Hora inicio</Label>
                              <select
                                value={newSlotStart}
                                onChange={(e) => setNewSlotStart(e.target.value)}
                                className="w-full p-2 rounded-lg border border-border bg-background text-sm"
                              >
                                {TIME_SLOTS.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Hora fin</Label>
                              <select
                                value={newSlotEnd}
                                onChange={(e) => setNewSlotEnd(e.target.value)}
                                className="w-full p-2 rounded-lg border border-border bg-background text-sm"
                              >
                                {TIME_SLOTS.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Duración sesión</Label>
                              <select
                                value={newSlotDuration}
                                onChange={(e) => setNewSlotDuration(Number(e.target.value))}
                                className="w-full p-2 rounded-lg border border-border bg-background text-sm"
                              >
                                {DURATION_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {/* Preview de cuántas citas caben */}
                          {(() => {
                            const startMin = toMinutes(newSlotStart);
                            const endMin = toMinutes(newSlotEnd);
                            const rangeMin = endMin - startMin;
                            if (rangeMin <= 0 || rangeMin < newSlotDuration) return null;
                            const count = Math.floor(rangeMin / newSlotDuration);
                            return (
                              <p className="text-xs text-calm mt-3">
                                → Genera <strong>{count}</strong> cita{count !== 1 ? "s" : ""} de {DURATION_OPTIONS.find(o => o.value === newSlotDuration)?.label} ({newSlotStart} – {newSlotEnd})
                              </p>
                            );
                          })()}
                          <Button
                            variant="calm"
                            size="sm"
                            onClick={handleAddSlot}
                            className="mt-4"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar rango
                          </Button>
                        </div>

                        {/* Lista de horarios configurados */}
                        <div>
                          <h4 className="font-medium mb-4 text-sm">Horarios configurados</h4>
                          <div className="space-y-2">
                            {getSlotsForDay(selectedDay).length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl">
                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No hay horarios configurados</p>
                                <p className="text-xs">Agrega tu primer horario arriba</p>
                              </div>
                            ) : (
                              getSlotsForDay(selectedDay).map((slot, index) => (
                                <motion.div
                                  key={slot.id || `${slot.dayOfWeek}-${slot.startTime}`}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center justify-between p-3 bg-calm-light/20 rounded-lg border border-calm/10"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-calm/10 flex items-center justify-center">
                                      <Clock className="h-5 w-5 text-calm" />
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {slot.startTime} – {slot.endTime}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {DURATION_OPTIONS.find(o => o.value === slot.slotDuration)?.label ?? `${slot.slotDuration} min`} por sesión
                                        {" · "}
                                        {Math.floor((toMinutes(slot.endTime) - toMinutes(slot.startTime)) / slot.slotDuration)} cita{Math.floor((toMinutes(slot.endTime) - toMinutes(slot.startTime)) / slot.slotDuration) !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveSlot(slot)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="card-elevated p-12 text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium mb-2">Selecciona un día</p>
                      <p className="text-sm">
                        Haz clic en un día de la semana para configurar sus horarios
                      </p>
                    </div>
                  )}

                  {/* Botón guardar */}
                  {availability.length > 0 && (
                    <div className="flex justify-end">
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleSaveAvailability}
                        disabled={isSavingAvailability}
                      >
                        {isSavingAvailability ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Guardar disponibilidad
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Diálogo de confirmación para eliminar */}
              <AlertDialog
                open={!!slotToDelete}
                onOpenChange={() => setSlotToDelete(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar horario</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que deseas eliminar este horario?
                      {slotToDelete && (
                        <span className="block mt-2 font-medium">
                          {DAYS_OF_WEEK.find(d => d.id === slotToDelete.dayOfWeek)?.name}: {" "}
                          {slotToDelete.startTime} - {slotToDelete.endTime}
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDeleteSlot}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="card-elevated p-6">
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Historial de pagos próximamente</p>
                <p className="text-sm">Verás únicamente tus pagos recibidos</p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
