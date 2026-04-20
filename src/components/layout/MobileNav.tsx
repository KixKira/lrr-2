import { Home, Calendar, Users, ShoppingBag, User, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Users, label: "Sobre Mí", path: "/professionals" },
    { icon: ShoppingBag, label: "Tienda", path: "/shop" },
    { icon: Calendar, label: "Citas", path: "/appointments" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass rounded-t-3xl border-t border-border/30 bg-background/80 backdrop-blur-lg pb-safe-area">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 px-3 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute inset-0 bg-calm/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-5 w-5 transition-colors duration-200 ${
                    isActive ? "text-calm" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-calm" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {user ? (
            <Link
              to="/dashboard"
              className="relative flex flex-col items-center gap-1 px-3 py-2"
            >
              {location.pathname === "/dashboard" && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute inset-0 bg-calm/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <User
                className={`relative z-10 h-5 w-5 ${
                  location.pathname === "/dashboard"
                    ? "text-calm"
                    : "text-muted-foreground"
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-semibold ${
                  location.pathname === "/dashboard"
                    ? "text-calm"
                    : "text-muted-foreground"
                }`}
              >
                Perfil
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="relative flex flex-col items-center gap-1 px-3 py-2"
            >
              <LogIn className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground">
                Entrar
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
