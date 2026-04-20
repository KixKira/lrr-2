import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  FileText,
  TrendingUp,
  Download,
  Settings,
  LogOut,
  Heart,
  Brain,
  Sun,
  X,
  RefreshCw,
  Upload,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getAppointments, updateAppointment } from "@/services/api";
import { createMoodEntry, getMyMoodEntries, MoodEntry } from "@/services/mood";
import {
  Material,
  Patient,
  getAllMaterials,
  getMyAssignedMaterials,
  getMyPatients,
  uploadMaterial,
  deleteMaterial,
  assignMaterialToPatient,
  getMaterialPatientIds,
  downloadMaterialFile,
} from "@/services/materials";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  professional: {
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  };
  scheduled_at: string;
  appointment_type: "online" | "in_person";
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

const moodEmojis = ["😢", "😕", "😐", "🙂", "😊"];

const Dashboard = () => {
  const { user, profile, signOut, isAdmin, isProfessional, isPatient } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [dashStats, setDashStats] = useState({ sessions: 0, progress: 0, streak: 0, sessionsThisWeek: 0 });

  // Materials state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignedMaterials, setAssignedMaterials] = useState<Material[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Assign state
  const [assigningMaterialId, setAssigningMaterialId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedPatientIds, setAssignedPatientIds] = useState<string[]>([]);

  // Load real appointments from API
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getAppointments("patient");
        if (data.appointments) {
          // Filter upcoming appointments (not cancelled and future date)
          const upcoming = data.appointments
            .filter((apt: Appointment) => {
              const aptDate = new Date(apt.scheduled_at);
              const now = new Date();
              return apt.status !== "cancelled" && aptDate >= now;
            })
            .sort((a: Appointment, b: Appointment) =>
              new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
            )
            .slice(0, 2); // Only show next 2
          setAppointments(upcoming);
        }
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // Load mood entries
  useEffect(() => {
    const loadMoodEntries = async () => {
      try {
        const entries = await getMyMoodEntries();
        setMoodEntries(entries);
        const today = new Date().toDateString();
        const todayEntry = entries.find(
          (entry) => new Date(entry.created_at).toDateString() === today
        );
        if (todayEntry) {
          setSelectedMood(todayEntry.mood_score - 1);
        }
      } catch (error) {
        console.error("Error loading mood entries:", error);
      }
    };

    loadMoodEntries();
  }, []);

  // Fetch appointment stats (sessions count + attendance progress + this week)
  useEffect(() => {
    if (!user) return;
    const fetchAppointmentStats = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("status, scheduled_at")
        .eq("patient_id", user.id);

      const all = data ?? [];
      const sessions = all.filter((a) => a.status !== "cancelled").length;
      const completed = all.filter((a) => a.status === "completed").length;
      const resolved = all.filter(
        (a) => a.status === "completed" || a.status === "cancelled"
      ).length;
      const progress = resolved > 0 ? Math.round((completed / resolved) * 100) : 0;

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const sessionsThisWeek = all.filter((a) => {
        const d = new Date(a.scheduled_at);
        return a.status !== "cancelled" && d >= startOfWeek && d < endOfWeek;
      }).length;

      setDashStats((prev) => ({ ...prev, sessions, progress, sessionsThisWeek }));
    };
    fetchAppointmentStats();
  }, [user]);

  // Calculate streak from mood entries
  useEffect(() => {
    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    let running = true;
    while (running) {
      const ts = checkDate.getTime();
      const hasEntry = moodEntries.some((e) => {
        const d = new Date(e.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === ts;
      });
      if (hasEntry) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        running = false;
      }
    }
    setDashStats((prev) => ({ ...prev, streak }));
  }, [moodEntries]);

  // Load materials based on role
  useEffect(() => {
    if (!user) return;
    const loadMaterials = async () => {
      setIsLoadingMaterials(true);
      try {
        if (isProfessional || isAdmin) {
          const [mats, pats] = await Promise.all([getAllMaterials(), getMyPatients()]);
          setMaterials(mats);
          setPatients(pats);
        } else if (isPatient) {
          const mats = await getMyAssignedMaterials();
          setAssignedMaterials(mats);
        }
      } catch (err) {
        console.error("Error cargando materiales:", err);
      } finally {
        setIsLoadingMaterials(false);
      }
    };
    loadMaterials();
  }, [user, isProfessional, isAdmin, isPatient]);

  // Handle mood selection
  const handleMoodSelect = async (index: number) => {
    if (isSavingMood) return;

    setIsSavingMood(true);
    setSelectedMood(index);

    try {
      const newEntry = await createMoodEntry({
        mood_score: index + 1,
        mood_emoji: moodEmojis[index],
      });

      setMoodEntries((prev) => [newEntry, ...prev]);
      toast.success("Estado de ánimo registrado. Tu profesional será notificado.");
    } catch (error: any) {
      console.error("Error saving mood:", error);
      toast.error(error.message || "Error al registrar estado de ánimo");
      // Reset selection if failed
      const today = new Date().toDateString();
      const todayEntry = moodEntries.find(
        (entry) => new Date(entry.created_at).toDateString() === today
      );
      setSelectedMood(todayEntry ? todayEntry.mood_score - 1 : null);
    } finally {
      setIsSavingMood(false);
    }
  };

  // Format appointment date
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Mañana";
    } else {
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle cancel appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    setIsCancelling(appointmentId);
    try {
      await updateAppointment({
        appointmentId,
        status: "cancelled",
      });
      toast.success("Cita cancelada correctamente");
      // Remove from list
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
    } catch (error) {
      toast.error("Error al cancelar la cita");
      console.error(error);
    } finally {
      setIsCancelling(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      toast.error("Indica un título y selecciona un archivo");
      return;
    }
    setIsUploading(true);
    try {
      const material = await uploadMaterial(uploadFile, uploadTitle.trim(), uploadDescription.trim() || undefined);
      setMaterials((prev) => [material, ...prev]);
      setShowUploadForm(false);
      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
      toast.success("Material subido correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al subir el material");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (material: Material) => {
    try {
      await deleteMaterial(material);
      setMaterials((prev) => prev.filter((m) => m.id !== material.id));
      toast.success("Material eliminado");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el material");
    }
  };

  const handleOpenAssign = async (materialId: string) => {
    if (assigningMaterialId === materialId) {
      setAssigningMaterialId(null);
      return;
    }
    setAssigningMaterialId(materialId);
    setSelectedPatientId("");
    try {
      const ids = await getMaterialPatientIds(materialId);
      setAssignedPatientIds(ids);
    } catch {
      setAssignedPatientIds([]);
    }
  };

  const handleAssignMaterial = async (materialId: string) => {
    if (!selectedPatientId) return;
    setIsAssigning(true);
    try {
      await assignMaterialToPatient(materialId, selectedPatientId);
      setAssignedPatientIds((prev) => [...new Set([...prev, selectedPatientId])]);
      setSelectedPatientId("");
      toast.success("Material asignado al paciente");
    } catch (err: any) {
      toast.error(err.message || "Error al asignar el material");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDownload = async (material: Material) => {
    try {
      await downloadMaterialFile(material.file_url, material.file_name);
    } catch {
      toast.error("Error al descargar el archivo");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const firstName = profile?.first_name || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Hola, <span className="text-gradient">{firstName}</span> 👋
            </h1>
            <p className="text-muted-foreground">
              {isProfessional || isAdmin ? "Bienvenido a tu panel" : "¿Cómo te sientes hoy?"}
            </p>
          </div>

          {/* Quick mood check — only for patients */}
          {!isProfessional && !isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-elevated p-5 mb-6"
            >
              <h3 className="font-semibold mb-2">Registra tu estado de ánimo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedMood !== null
                  ? "Gracias por registrar tu estado de ánimo hoy"
                  : "¿Cómo te sientes hoy? Tu profesional será notificado."}
              </p>
              <div className="flex justify-between">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={emoji}
                    onClick={() => handleMoodSelect(index)}
                    disabled={isSavingMood}
                    className={`w-12 h-12 text-2xl rounded-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedMood === index
                        ? "bg-sage-light ring-2 ring-sage scale-110"
                        : "bg-muted"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {isSavingMood && (
                <div className="flex justify-center mt-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-calm"></div>
                </div>
              )}
            </motion.div>
          )}

          {/* Stats cards */}
          <div className={`grid ${isProfessional || isAdmin ? "grid-cols-2" : "grid-cols-3"} gap-3 mb-6`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card-elevated p-4 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-calm-light flex items-center justify-center mx-auto mb-2">
                <Heart className="h-5 w-5 text-calm" />
              </div>
              <p className="text-2xl font-bold">{dashStats.sessions}</p>
              <p className="text-xs text-muted-foreground">Sesiones</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated p-4 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-lavender-light flex items-center justify-center mx-auto mb-2">
                <Brain className="h-5 w-5 text-lavender" />
              </div>
              <p className="text-2xl font-bold">{dashStats.progress}%</p>
              <p className="text-xs text-muted-foreground">Progreso</p>
            </motion.div>

            {!isProfessional && !isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="card-elevated p-4 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center mx-auto mb-2">
                  <Sun className="h-5 w-5 text-coral" />
                </div>
                <p className="text-2xl font-bold">{dashStats.streak}</p>
                <p className="text-xs text-muted-foreground">Días racha</p>
              </motion.div>
            )}
          </div>

          {/* Upcoming appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Próximas Citas</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/appointments">Ver todas</Link>
              </Button>
            </div>

            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm"></div>
              </div>
            )}
            {!isLoading && appointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>No tienes citas próximas</p>
                {!isProfessional && !isAdmin && (
                  <Button variant="hero" className="mt-4" asChild>
                    <Link to="/appointments">Agendar mi primera cita</Link>
                  </Button>
                )}
              </div>
            )}
            {!isLoading && appointments.length > 0 && (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-calm-light flex items-center justify-center overflow-hidden">
                      {appointment.professional?.profiles?.avatar_url ? (
                        <img
                          src={appointment.professional.profiles.avatar_url}
                          alt={`${appointment.professional.profiles.first_name} ${appointment.professional.profiles.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-calm">
                          {appointment.professional?.profiles?.first_name?.[0] || "P"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {appointment.professional?.profiles?.first_name}{" "}
                        {appointment.professional?.profiles?.last_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatAppointmentDate(appointment.scheduled_at)}
                        <Clock className="h-3 w-3 ml-1" />
                        {formatTime(appointment.scheduled_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {appointment.appointment_type === "online" && (
                        <span className="flex items-center gap-1 text-xs text-calm bg-calm-light px-2 py-1 rounded-full">
                          <Video className="h-3 w-3" />
                          Online
                        </span>
                      )}
                      {appointment.status === "pending" && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          Pendiente
                        </span>
                      )}
                      {appointment.status === "confirmed" && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          Confirmada
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Cancel button for first appointment */}
                {appointments[0] && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 text-destructive hover:text-destructive"
                        disabled={isCancelling === appointments[0].id}
                      >
                        {isCancelling === appointments[0].id ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Cancelar próxima cita
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar cita?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. La cita será cancelada y
                          el profesional será notificado.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, mantener cita</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancelAppointment(appointments[0].id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Sí, cancelar cita
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}

            {!isProfessional && !isAdmin && (
              <Button variant="hero" className="w-full mt-4" asChild>
                <Link to="/appointments">Agendar Nueva Cita</Link>
              </Button>
            )}
          </motion.div>

          {/* Weekly mood chart — only for patients */}
          {!isProfessional && !isAdmin && <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card-elevated p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Tu semana</h3>
              <TrendingUp className="h-5 w-5 text-sage" />
            </div>

            {/* Real weekly stats */}
            {(() => {
              const startOfWeek = new Date();
              startOfWeek.setDate(startOfWeek.getDate() - 6);
              startOfWeek.setHours(0, 0, 0, 0);

              const weekEntries = moodEntries.filter((e) => {
                return new Date(e.created_at) >= startOfWeek;
              });

              const avgMood =
                weekEntries.length > 0
                  ? weekEntries.reduce((s, e) => s + e.mood_score, 0) / weekEntries.length
                  : null;

              const daysTracked = new Set(
                weekEntries.map((e) => {
                  const d = new Date(e.created_at);
                  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                })
              ).size;

              const moodEmoji = avgMood !== null
                ? ["😢", "😕", "😐", "🙂", "😊"][Math.round(avgMood) - 1]
                : null;

              return (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold">{dashStats.sessionsThisWeek}</p>
                    <p className="text-xs text-muted-foreground">Citas</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold">
                      {avgMood !== null ? (
                        <span title={avgMood.toFixed(1)}>{moodEmoji}</span>
                      ) : (
                        "—"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Ánimo prom.</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold">{daysTracked}/7</p>
                    <p className="text-xs text-muted-foreground">Días registrados</p>
                  </div>
                </div>
              );
            })()}

            {/* Mood bar chart */}
            <div className="flex items-end justify-between h-28 gap-2">
              {(() => {
                const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                return Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  d.setHours(0, 0, 0, 0);
                  const label = i === 6 ? "Hoy" : DAY_NAMES[d.getDay()];
                  const ts = d.getTime();
                  const dayEntries = moodEntries.filter((e) => {
                    const ed = new Date(e.created_at);
                    ed.setHours(0, 0, 0, 0);
                    return ed.getTime() === ts;
                  });
                  const value =
                    dayEntries.length > 0
                      ? Math.round(
                          (dayEntries.reduce((s, e) => s + e.mood_score, 0) /
                            dayEntries.length) *
                            20
                        )
                      : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`w-full rounded-lg transition-all ${value > 0 ? "bg-calm/80 hover:bg-calm" : "bg-muted"}`}
                        style={{ height: value > 0 ? `${value}%` : "4px" }}
                      />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </motion.div>}

          {/* Downloadable resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated p-5 mb-6"
          >
            {/* ── Vista Profesional / Admin ─────────────────────────────── */}
            {(isProfessional || isAdmin) && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Material Descargable</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowUploadForm((v) => !v); }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Subir material
                  </Button>
                </div>

                {/* Formulario de carga */}
                {showUploadForm && (
                  <div className="mb-4 p-4 rounded-xl bg-muted/50 space-y-3">
                    <p className="text-sm font-medium">Nuevo material</p>
                    <input
                      type="text"
                      placeholder="Título *"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-calm"
                    />
                    <input
                      type="text"
                      placeholder="Descripción (opcional)"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-calm"
                    />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                      className="w-full text-sm text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-calm-light file:text-calm cursor-pointer"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUploadForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={handleUpload}
                        disabled={isUploading}
                      >
                        {isUploading && <RefreshCw className="h-4 w-4 animate-spin mr-1" />}
                        Subir
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de materiales */}
                {isLoadingMaterials ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-calm" />
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay material subido aún</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id}>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-coral-light flex items-center justify-center">
                              <FileText className="h-5 w-5 text-coral" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{material.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {material.file_type}
                                {material.file_size ? ` • ${material.file_size}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenAssign(material.id)}
                              className="text-xs"
                            >
                              Asignar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar material?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Se eliminará "{material.title}" y todas sus asignaciones. Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteMaterial(material)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        {/* Panel de asignación */}
                        {assigningMaterialId === material.id && (
                          <div className="mt-2 p-3 rounded-xl bg-calm-light/30 space-y-2 border border-calm/20">
                            <p className="text-sm font-medium">Asignar a paciente:</p>
                            {patients.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                No tienes pacientes con citas registradas
                              </p>
                            ) : (
                              <>
                                <select
                                  value={selectedPatientId}
                                  onChange={(e) => setSelectedPatientId(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-calm"
                                >
                                  <option value="">Seleccionar paciente…</option>
                                  {patients.map((p) => (
                                    <option key={p.user_id} value={p.user_id}>
                                      {p.first_name} {p.last_name}
                                      {assignedPatientIds.includes(p.user_id) ? " ✓" : ""}
                                      {p.email ? ` (${p.email})` : ""}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAssigningMaterialId(null)}
                                  >
                                    Cerrar
                                  </Button>
                                  <Button
                                    variant="hero"
                                    size="sm"
                                    onClick={() => handleAssignMaterial(material.id)}
                                    disabled={!selectedPatientId || isAssigning}
                                  >
                                    {isAssigning && (
                                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                                    )}
                                    Asignar
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Vista Paciente ────────────────────────────────────────── */}
            {isPatient && !isProfessional && !isAdmin && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Material Descargable</h3>
                </div>

                {isLoadingMaterials ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-calm" />
                  </div>
                ) : assignedMaterials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tu profesional aún no ha asignado material</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-coral-light flex items-center justify-center">
                            <FileText className="h-5 w-5 text-coral" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{material.title}</p>
                            {material.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {material.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {material.file_type}
                              {material.file_size ? ` • ${material.file_size}` : ""}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(material)}
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Fallback si el usuario no tiene roles cargados aún */}
            {!isProfessional && !isAdmin && !isPatient && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Material Descargable</h3>
              </div>
            )}
          </motion.div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/profile">
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </motion.div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Dashboard;
