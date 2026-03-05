import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Calendar,
  Heart,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const PatientProfile = () => {
  const { user, profile, isLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateProfile({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      bio: formData.bio,
    });

    toast.success("Perfil actualizado correctamente");
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calm"></div>
      </div>
    );
  }

  // Mock stats for UI
  const stats = {
    totalAppointments: 8,
    upcomingAppointments: 2,
    memberSince: "Enero 2024",
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Back button */}
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al dashboard
            </Link>
          </Button>

          {/* Profile Header */}
          <div className="card-elevated p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-calm-light flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-calm" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-calm text-primary-foreground flex items-center justify-center shadow-lg hover:bg-calm/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : "Tu Perfil"}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-calm-light flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-5 w-5 text-calm" />
                </div>
                <p className="text-xl font-bold">{stats.totalAppointments}</p>
                <p className="text-xs text-muted-foreground">Citas totales</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-lavender-light flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-5 w-5 text-lavender" />
                </div>
                <p className="text-xl font-bold">
                  {stats.upcomingAppointments}
                </p>
                <p className="text-xs text-muted-foreground">Próximas citas</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-5 w-5 text-coral" />
                </div>
                <p className="text-xl font-bold">{stats.memberSince}</p>
                <p className="text-xs text-muted-foreground">Miembro desde</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-6">Información Personal</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder="Tu nombre"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Tu apellido"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="pl-10 h-12 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Sobre mí</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Cuéntanos un poco sobre ti..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                variant="calm"
                size="lg"
                className="w-full"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
      <MobileNav />
    </div>
  );
};

export default PatientProfile;
