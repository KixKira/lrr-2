import { motion } from "framer-motion";
import { Star, ArrowRight, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import professionalImg from "@/assets/images/maria-jose-marquina-psicologa-clinica.webp";

export const ProfessionalsPreview = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Conoce más <span className="text-gradient">sobre mí</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-elevated overflow-hidden max-w-5xl mx-auto group flex flex-col md:flex-row"
        >
          {/* Lado Izquierdo: Imagen */}
          <div className="relative w-full md:w-2/5 lg:w-1/3">
            <img
              src={professionalImg}
              alt="María José Marquina"
              loading="lazy"
              decoding="async"
              className="w-full h-72 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 bg-calm/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium w-fit">
                <Video className="h-3 w-3" />
                Online
              </div>
              <div className="flex items-center gap-1.5 bg-lavender/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium w-fit">
                <MapPin className="h-3 w-3" />
                Presencial
              </div>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-sage/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
              Disponible
            </div>
          </div>

          {/* Lado Derecho: Contenido */}
          <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    María José Marquina
                  </h3>
                  <p className="text-calm font-medium">Psicología Clínica</p>
                </div>
                <div className="flex items-center gap-1 text-sm bg-muted/50 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-coral text-coral" />
                  <span className="font-bold">4.9</span>
                  <span className="text-muted-foreground">(124)</span>
                </div>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Mi nombre es <b>María José Marquina</b>, soy psicóloga mención
                  clínica <b>(FPV 13.249)</b>. Desde hace 8 años acompaño a
                  otras personas en la búsqueda del bienestar tanto de manera
                  individual como grupal, incluyendo organizaciones,
                  adolescentes y adultos.
                </p>
                <p>
                  Mi enfoque es humanista, sin embargo, integro diversas
                  estrategias y métodos según el caso, siempre acompañando desde
                  la ética y profesionalismo.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 my-6">
                {[
                  "Ansiedad",
                  "Depresión",
                  "Estrés",
                  "Autoestima",
                  "Humanista",
                ].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-normal px-3 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
              <div>
                <span className="text-3xl font-bold text-foreground">$30</span>
                <span className="text-sm text-muted-foreground ml-1">
                  /sesión
                </span>
              </div>
              <Button
                variant="calm"
                size="lg"
                asChild
                className="rounded-full shadow-lg hover:shadow-calm/20 transition-all"
              >
                <Link to="/appointments">
                  Agendar Cita
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
