import { Home, Calendar, Users, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Inicio", path: "/" },
  { icon: Calendar, label: "Citas", path: "/appointments" },
  { icon: Users, label: "Profesionales", path: "/professionals" },
  { icon: ShoppingBag, label: "Tienda", path: "/shop" },
  { icon: User, label: "Perfil", path: "/dashboard" },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass rounded-t-3xl border-t border-border/30 safe-bottom">
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
                    layoutId="activeTab"
                    className="absolute inset-0 bg-calm-light rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-5 w-5 transition-colors duration-200 ${
                    isActive ? "text-calm" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-calm" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
