import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data for testing
const mockAppointments = [
  {
    id: "1",
    patient_name: "Juan Pérez",
    patient_email: "juan@email.com",
    patient_avatar: null,
    date: "2026-02-07",
    time: "10:00",
    type: "online",
    status: "pending",
    notes: "Primera consulta",
  },
  {
    id: "2",
    patient_name: "Laura Martínez",
    patient_email: "laura@email.com",
    patient_avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    date: "2026-02-07",
    time: "11:00",
    type: "presencial",
    status: "confirmed",
    notes: "Seguimiento mensual",
  },
  {
    id: "3",
    patient_name: "Carlos Rodríguez",
    patient_email: "carlos@email.com",
    patient_avatar: null,
    date: "2026-02-08",
    time: "09:00",
    type: "online",
    status: "pending",
    notes: "",
  },
];

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

const mockStats = {
  totalPatients: 24,
  appointmentsThisWeek: 12,
  pendingAppointments: 3,
  monthlyEarnings: 2450.0,
};

const ProfessionalDashboard = () => {
  const { user, isProfessional, isAdmin, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "appointments" | "clinical" | "schedule" | "payments"
  >("appointments");
  const [appointments, setAppointments] = useState(mockAppointments);
  const [clinicalNotes, setClinicalNotes] = useState(mockClinicalNotes);
  const [stats] = useState(mockStats);
  const [newNote, setNewNote] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || (!isProfessional && !isAdmin))) {
      navigate("/auth");
      toast.error("Acceso denegado. Solo profesionales.");
    }
  }, [user, isProfessional, isAdmin, isLoading, navigate]);

  const handleAppointmentAction = (
    appointmentId: string,
    action: "confirm" | "cancel",
  ) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, status: action === "confirm" ? "confirmed" : "cancelled" }
          : apt,
      ),
    );
    toast.success(action === "confirm" ? "Cita confirmada" : "Cita cancelada");
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calm"></div>
      </div>
    );
  }

  const pendingAppointments = appointments.filter(
    (a) => a.status === "pending",
  );
  const confirmedAppointments = appointments.filter(
    (a) => a.status === "confirmed",
  );

  const statCards = [
    {
      label: "Pacientes",
      value: stats.totalPatients,
      icon: Users,
      color: "calm",
    },
    {
      label: "Citas esta semana",
      value: stats.appointmentsThisWeek,
      icon: Calendar,
      color: "lavender",
    },
    {
      label: "Pendientes",
      value: stats.pendingAppointments,
      icon: Clock,
      color: "coral",
    },
    {
      label: "Ingresos del mes",
      value: `$${stats.monthlyEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "sage",
    },
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
              {/* Pending Appointments */}
              {pendingAppointments.length > 0 && (
                <div className="card-elevated p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-coral" />
                    Citas Pendientes de Confirmación
                  </h3>
                  <div className="space-y-3">
                    {pendingAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-coral-light/30 border border-coral/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-calm-light flex items-center justify-center">
                            {apt.patient_avatar ? (
                              <img
                                src={apt.patient_avatar}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-calm font-medium">
                                {apt.patient_name[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{apt.patient_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.date} a las {apt.time} •{" "}
                              {apt.type === "online" ? "Online" : "Presencial"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              handleAppointmentAction(apt.id, "cancel")
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="calm"
                            size="sm"
                            onClick={() =>
                              handleAppointmentAction(apt.id, "confirm")
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
                  {confirmedAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-calm-light flex items-center justify-center">
                          {apt.patient_avatar ? (
                            <img
                              src={apt.patient_avatar}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-calm font-medium">
                              {apt.patient_name[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{apt.patient_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.date} a las {apt.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-sage-light text-sage"
                        >
                          {apt.type === "online" ? "Online" : "Presencial"}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {confirmedAppointments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay citas confirmadas
                    </div>
                  )}
                </div>
              </div>
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
                          {appointments.map((apt) => (
                            <option key={apt.id} value={apt.patient_name}>
                              {apt.patient_name}
                            </option>
                          ))}
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
            <div className="card-elevated p-6">
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gestión de horarios próximamente</p>
                <p className="text-sm">
                  Podrás configurar tu disponibilidad aquí
                </p>
              </div>
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
