import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const AboutSection = () => {
  const { user, isAdmin, isProfessional } = useAuth();

  let ctaDestination = "/auth";
  if (user) {
    if (isAdmin) ctaDestination = "/admin";
    else if (isProfessional) ctaDestination = "/professional-dashboard";
    else ctaDestination = "/dashboard";
  }

  const ctaLabel = user ? "Ir al dashboard" : "Regístrate";

  return (
    <section id="que-es" className="scroll-mt-16 py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Columna de texto — order-2 en mobile para que la imagen aparezca primero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-calm-light px-4 py-2 text-sm font-medium text-calm mb-6">
              <Sparkles className="h-4 w-4" />
              Nacida en 2018
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Qué es{" "}
              <span className="text-gradient">La Ruta Resiliente</span>?
            </h2>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              La Ruta Resiliente es un proyecto nacido en el 2018 que hoy se
              hace realidad, su finalidad es brindarte herramientas y enseñarte
              estrategias para que puedas fortalecerte ante la adversidad
              cuidando siempre de tu salud mental.
            </p>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              Aquí podrás encontrar una comunidad que se acompaña y que crece
              junta a través de talleres, encuentros educativos presenciales y
              recursos educativos amigables pensados para ti.
            </p>

            <Button variant="hero" size="xl" className="group" asChild>
              <Link to={ctaDestination}>
                {ctaLabel}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {/* Columna de imagen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center order-1 md:order-2"
          >
            {/* Reemplazar este div con <img src="..." alt="..." className="w-full max-w-sm rounded-2xl object-cover" /> cuando tengas la imagen */}
            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl bg-gradient-to-br from-calm/30 via-lavender/20 to-calm-light flex flex-col items-center justify-center gap-3 border-2 border-dashed border-calm/30">
              <div className="w-16 h-16 rounded-full bg-calm/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-calm/60" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Tu imagen aquí</p>
              <p className="text-xs text-muted-foreground/60 text-center px-6">
                Reemplaza este bloque con un &lt;img&gt; cuando tengas la foto
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
