import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  DollarSign,
  ShoppingBag,
  Search,
  Edit,
  Trash2,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const mockPatients = [
  {
    id: "2",
    user_id: "2",
    email: "paciente@lrr.com",
    first_name: "Juan",
    last_name: "Pérez",
    phone: "+1234567892",
    avatar_url: null,
    roles: ["patient"],
  },
  {
    id: "3",
    user_id: "3",
    email: "laura@email.com",
    first_name: "Laura",
    last_name: "Martínez",
    phone: "+1234567893",
    avatar_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    roles: ["patient"],
  },
  {
    id: "4",
    user_id: "4",
    email: "carlos@email.com",
    first_name: "Carlos",
    last_name: "Rodríguez",
    phone: "+1234567894",
    avatar_url: null,
    roles: ["patient"],
  },
];

const mockStats = {
  totalPatients: 24,
  totalAppointments: 458,
  totalRevenue: 15750.0,
};

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "patients" | "appointments" | "payments" | "products"
  >("patients");
  const [patients, setPatients] = useState(mockPatients);
  const [stats] = useState(mockStats);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
      toast.error("Acceso denegado. Solo administradores.");
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleDeletePatient = (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este paciente?")) return;
    setPatients((prev) => prev.filter((u) => u.user_id !== userId));
    toast.success("Paciente eliminado");
  };

  const filteredPatients = patients.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calm"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Pacientes",
      value: stats.totalPatients,
      icon: Users,
      color: "calm",
    },
    {
      label: "Citas",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "lavender",
    },
    {
      label: "Ingresos",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "coral",
    },
  ];

  const tabs = [
    { id: "patients", label: "Pacientes", icon: Users },
    { id: "appointments", label: "Citas", icon: Calendar },
    { id: "payments", label: "Pagos", icon: DollarSign },
    { id: "products", label: "Productos", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen pb-8">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-coral-light flex items-center justify-center">
                <Shield className="h-6 w-6 text-coral" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-muted-foreground">Gestiona tu consulta</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
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

          {activeTab === "patients" && (
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pacientes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-calm-light flex items-center justify-center">
                        {patient.avatar_url ? (
                          <img
                            src={patient.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-calm font-medium">
                            {patient.first_name?.[0] ||
                              patient.email[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {patient.first_name && patient.last_name
                            ? `${patient.first_name} ${patient.last_name}`
                            : patient.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="bg-calm-light text-calm"
                      >
                        Paciente
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeletePatient(patient.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredPatients.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No se encontraron pacientes
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="card-elevated p-6">
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gestión de citas próximamente</p>
                <p className="text-sm">Verás todas las citas aquí</p>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="card-elevated p-6">
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gestión de pagos próximamente</p>
                <p className="text-sm">
                  Verás todos los pagos y transacciones aquí
                </p>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="card-elevated p-6">
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gestión de productos próximamente</p>
                <p className="text-sm">Podrás gestionar la tienda aquí</p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
