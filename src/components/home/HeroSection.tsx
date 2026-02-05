import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="absolute top-20 left-10 w-32 h-32 bg-calm/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-lavender/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-40 right-20 w-24 h-24 bg-coral/10 rounded-full blur-2xl animate-float"
        style={{ animationDelay: "4s" }}
      />
      <div className="container relative">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-calm-light px-4 py-2 text-sm font-medium text-calm">
              <Sparkles className="h-4 w-4" />
              Tu bienestar es nuestra prioridad
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            Cuida tu <span className="text-gradient">salud mental</span>
            <br />
            desde cualquier lugar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 max-w-xl"
          >
            Conecta con psicólogos certificados, accede a recursos exclusivos y
            únete a una comunidad que te apoya en cada paso de tu camino.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/appointments">
                Agendar Cita Ahora
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/professionals">Ver Profesionales</Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 mt-12 pt-12 border-t border-border/50"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light">
                <Shield className="h-4 w-4 text-sage" />
              </div>
              <span>100% Confidencial</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-light">
                <Heart className="h-4 w-4 text-lavender" />
              </div>
              <span>+500 Pacientes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-calm-light">
                <Sparkles className="h-4 w-4 text-calm" />
              </div>
              <span>Psicólogos Certificados</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
