import { motion } from "framer-motion";
import { Star, ArrowRight, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const professionals = [
  {
    id: 1,
    name: "Dra. María García",
    specialty: "Psicología Clínica",
    rating: 4.9,
    reviews: 124,
    price: 50,
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    tags: ["Ansiedad", "Depresión"],
    available: true,
    online: true,
  },
  {
    id: 2,
    name: "Dr. Carlos Mendoza",
    specialty: "Terapia Cognitiva",
    rating: 4.8,
    reviews: 89,
    price: 45,
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    tags: ["Estrés", "Autoestima"],
    available: true,
    online: true,
  },
  {
    id: 3,
    name: "Dra. Ana López",
    specialty: "Psicología Infantil",
    rating: 5.0,
    reviews: 67,
    price: 55,
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    tags: ["Niños", "Familia"],
    available: false,
    online: true,
  },
];

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
              Nuestros <span className="text-gradient">Profesionales</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Psicólogos certificados listos para acompañarte
            </p>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0 group" asChild>
            <Link to="/professionals">
              Ver todos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {professionals.map((professional, index) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-elevated overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {professional.online && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-calm/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                    <Video className="h-3 w-3" />
                    Online
                  </div>
                )}
                {professional.available ? (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-sage/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
                    Disponible
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-muted/90 backdrop-blur-sm text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                    Ocupado
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {professional.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {professional.specialty}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-coral text-coral" />
                    <span className="font-medium">{professional.rating}</span>
                    <span className="text-muted-foreground">
                      ({professional.reviews})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {professional.tags.map((tag) => (
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
                    <span className="text-2xl font-bold text-foreground">
                      ${professional.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /sesión
                    </span>
                  </div>
                  <Button variant="calm" size="sm" asChild>
                    <Link to={`/appointments?professional=${professional.id}`}>
                      Agendar
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
