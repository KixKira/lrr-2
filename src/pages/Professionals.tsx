import { motion } from "framer-motion";
import { Star, Video, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import professionalImg from "@/assets/images/maria-jose-marquina-psicologa-clinica.webp";

const professional = {
  name: "María José Marquina",
  specialty: "Psicología Clínica",
  rating: 4.9,
  reviews: 124,
  price: 30,
  image: professionalImg,
  tags: ["Ansiedad", "Depresión", "Estrés", "Autoestima", "Humanista"],
  experience: "8 años",
  nextAvailable: "Hoy 15:00",
  online: true,
  presencial: true,
  bio: "Mi nombre es María José Marquina, soy psicóloga mención clínica (FPV 13.249). Desde hace 8 años acompaño a otras personas en la búsqueda del bienestar tanto de manera individual como grupal, incluyendo organizaciones, adolescentes y adultos. Mi enfoque es humanista, sin embargo, integro diversas estrategias y métodos según el caso, siempre acompañando desde la ética y profesionalismo.",
  education:
    "Licenciada en Psicología – Universidad Bicentenaria de Aragua, Venezuela",
};

const Professionals = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Conoce más sobre mí</h1>
            <p className="text-muted-foreground">
              Conoce a quien te acompañará en tu proceso
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative md:w-80 h-72 md:h-auto">
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {professional.online && (
                    <Badge className="bg-calm/90 text-primary-foreground">
                      <Video className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  )}
                  {professional.presencial && (
                    <Badge className="bg-lavender/90 text-primary-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      Presencial
                    </Badge>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-1">{professional.name}</h2>
                <p className="text-muted-foreground mb-4">
                  {professional.specialty}
                </p>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-coral text-coral" />
                    <span className="font-medium">{professional.rating}</span>
                    <span className="text-muted-foreground">
                      ({professional.reviews} reseñas)
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {professional.experience} de experiencia
                  </span>
                </div>

                <p className="text-muted-foreground mb-4">{professional.bio}</p>
                <p className="text-sm text-muted-foreground mb-6">
                  {professional.education}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {professional.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-3xl font-bold">
                      ${professional.price}
                    </span>
                    <span className="text-muted-foreground">/sesión</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-sage" />
                    <span>
                      Próxima disponibilidad: {professional.nextAvailable}
                    </span>
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    asChild
                    className="sm:ml-auto"
                  >
                    <Link to="/appointments">Agendar Cita</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Professionals;
