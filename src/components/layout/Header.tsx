import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="glass rounded-b-2xl md:rounded-none">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-calm to-lavender">
              <span className="text-lg font-bold text-primary-foreground">
                R
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">
              La Ruta <span className="text-calm">Resiliente</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-calm transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/professionals"
              className="text-sm font-medium text-muted-foreground hover:text-calm transition-colors"
            >
              Profesionales
            </Link>
            <Link
              to="/shop"
              className="text-sm font-medium text-muted-foreground hover:text-calm transition-colors"
            >
              Tienda
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-calm transition-colors"
            >
              Recursos
            </Link>
            <Link
              to="/community"
              className="text-sm font-medium text-muted-foreground hover:text-calm transition-colors"
            >
              Comunidad
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-coral" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="hidden md:flex"
              asChild
            >
              <Link to="/appointments">Agendar Cita</Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
