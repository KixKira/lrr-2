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
  ChevronRight,
  Heart,
  Brain,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const upcomingAppointments = [
  {
    id: 1,
    professional: "María José Marquina",
    date: "Hoy",
    time: "15:00",
    type: "online",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    professional: "María José Marquina",
    date: "Viernes 15",
    time: "10:00",
    type: "presencial",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  },
];

const resources = [
  {
    id: 1,
    title: "Guía de Respiración",
    type: "PDF",
    size: "2.4 MB",
  },
  {
    id: 2,
    title: "Ejercicios de Mindfulness",
    type: "PDF",
    size: "1.8 MB",
  },
  {
    id: 3,
    title: "Diario de Emociones",
    type: "PDF",
    size: "3.1 MB",
  },
];

const moodData = [
  { day: "Lun", value: 70 },
  { day: "Mar", value: 85 },
  { day: "Mié", value: 60 },
  { day: "Jue", value: 75 },
  { day: "Vie", value: 90 },
  { day: "Sáb", value: 80 },
  { day: "Hoy", value: 85 },
];

const Dashboard = () => {
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
              Hola, <span className="text-gradient">María</span> 👋
            </h1>
            <p className="text-muted-foreground">¿Cómo te sientes hoy?</p>
          </div>

          {/* Quick mood check */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-5 mb-6"
          >
            <h3 className="font-semibold mb-4">Registra tu estado de ánimo</h3>
            <div className="flex justify-between">
              {["😢", "😕", "😐", "🙂", "😊"].map((emoji, index) => (
                <button
                  key={index}
                  className={`w-12 h-12 text-2xl rounded-xl transition-all hover:scale-110 ${
                    index === 4
                      ? "bg-sage-light ring-2 ring-sage scale-110"
                      : "bg-muted"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card-elevated p-4 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-calm-light flex items-center justify-center mx-auto mb-2">
                <Heart className="h-5 w-5 text-calm" />
              </div>
              <p className="text-2xl font-bold">12</p>
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
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-muted-foreground">Progreso</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="card-elevated p-4 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center mx-auto mb-2">
                <Sun className="h-5 w-5 text-coral" />
              </div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-muted-foreground">Días racha</p>
            </motion.div>
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

            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <img
                    src={appointment.image}
                    alt={appointment.professional}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{appointment.professional}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {appointment.date}
                      <Clock className="h-3 w-3 ml-1" />
                      {appointment.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.type === "online" && (
                      <span className="flex items-center gap-1 text-xs text-calm bg-calm-light px-2 py-1 rounded-full">
                        <Video className="h-3 w-3" />
                        Online
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" className="w-full mt-4" asChild>
              <Link to="/appointments">Agendar Nueva Cita</Link>
            </Button>
          </motion.div>

          {/* Weekly mood chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card-elevated p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Tu semana</h3>
              <TrendingUp className="h-5 w-5 text-sage" />
            </div>

            <div className="flex items-end justify-between h-32 gap-2">
              {moodData.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-calm/80 rounded-lg transition-all hover:bg-calm"
                    style={{ height: `${item.value}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Downloadable resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Material Descargable</h3>
              <Button variant="ghost" size="sm">
                Ver todo
              </Button>
            </div>

            <div className="space-y-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center">
                      <FileText className="h-5 w-5 text-coral" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.type} • {resource.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Settings className="h-5 w-5" />
              <span>Configuración</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 text-destructive hover:text-destructive"
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
