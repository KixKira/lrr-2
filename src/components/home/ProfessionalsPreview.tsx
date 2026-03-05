import { motion } from "framer-motion";
import { Star, ArrowRight, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export const ProfessionalsPreview = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tu <span className="text-gradient">Profesional</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Psicóloga certificada lista para acompañarte
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-elevated overflow-hidden max-w-2xl mx-auto group"
        >
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop&crop=face"
              alt="María José Marquina"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <div className="flex items-center gap-1.5 bg-calm/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                <Video className="h-3 w-3" />
                Online
              </div>
              <div className="flex items-center gap-1.5 bg-lavender/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                <MapPin className="h-3 w-3" />
                Presencial
              </div>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-sage/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
              Disponible
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  María José Marquina
                </h3>
                <p className="text-muted-foreground">Psicología Clínica</p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-coral text-coral" />
                <span className="font-medium">4.9</span>
                <span className="text-muted-foreground">(124)</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Especialista en ansiedad, depresión y bienestar emocional con
              enfoque cognitivo-conductual.
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {["Ansiedad", "Depresión", "Estrés", "Autoestima"].map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <span className="text-2xl font-bold text-foreground">$30</span>
                <span className="text-sm text-muted-foreground">/sesión</span>
              </div>
              <Button variant="calm" asChild>
                <Link to="/appointments">
                  Agendar Cita
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
