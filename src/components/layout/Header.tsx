import {
  LogIn,
  LogOut,
  User,
  Shield,
  Stethoscope,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";

/**
 * Header Titan - Versión Orientada a Conversión
 * - Mobile: Prioriza "Agendar Cita" como CTA principal.
 * - Desktop: Mantiene navegación completa y gestión de cuenta.
 */
export const Header = () => {
  const { user, profile, isAdmin, isProfessional, signOut, isLoading } =
    useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate("/");
    }
  };

  // Rutas centrales para navegación Desktop
  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/professionals", label: "Sobre Mí" },
    // { to: "/shop", label: "Tienda" },
    // { to: "/blog", label: "Recursos" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="glass border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* IDENTIDAD: Logo minimalista */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-calm to-lavender shadow-sm">
              <span className="text-lg font-bold text-primary-foreground">
                R
              </span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight hidden xs:block">
              La Ruta <span className="text-calm">Resiliente</span>
            </span>
          </Link>

          {/* NAVEGACIÓN DESKTOP: Solo visible en pantallas grandes */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-md",
                    isActive
                      ? "text-calm"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-calm rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ÁREA DE ACCIÓN DERECHA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* NOTIFICACIONES: Solo si hay usuario, visible en todas las versiones */}
            {user && <NotificationBell />}

            {/* CTA PRINCIPAL: "Agendar Cita"
                - En Mobile: Ahora es visible (sin 'hidden md:flex')
                - En Mobile: Usamos un tamaño 'sm' o icono si es muy pequeño.
            */}
            {!isProfessional && !isAdmin && (
              <Button
                variant="calm"
                size="sm"
                className="rounded-full shadow-sm hover:shadow-calm/20 transition-all px-4"
                asChild
              >
                <Link to="/appointments">
                  <Calendar className="h-4 w-4 mr-2 md:hidden lg:block" />
                  <span>
                    Agendar<span className="hidden sm:inline"> Cita</span>
                  </span>
                </Link>
              </Button>
            )}

            {/* SECCIÓN DE CUENTA (SOLO DESKTOP): 
                En Mobile esto se omite porque ya está en el MobileNav (Bottom Bar).
            */}
            <div className="hidden md:flex items-center pl-2 border-l border-border/50">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full border border-calm/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-calm-light flex items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-calm text-xs font-bold uppercase">
                            {profile?.first_name?.[0] || user.email?.[0]}
                          </span>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <div className="px-2 py-2 text-sm font-semibold truncate">
                      {profile?.first_name
                        ? `${profile.first_name} ${profile.last_name || ""}`
                        : user.email}
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Shield className="h-4 w-4 mr-2" /> Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {(isProfessional || isAdmin) && (
                      <DropdownMenuItem asChild>
                        <Link to="/professional-dashboard">
                          <Stethoscope className="h-4 w-4 mr-2" /> Panel Profesional
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="h-4 w-4 mr-2" /> Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-calm"
                  asChild
                >
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 mr-2" /> Entrar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
