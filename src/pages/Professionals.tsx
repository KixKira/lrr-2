import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, Video, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MobileNav } from "@/components/layout/MobileNav";

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
    tags: ["Ansiedad", "Depresión", "Estrés"],
    experience: "12 años",
    nextAvailable: "Hoy 15:00",
    online: true,
    presencial: true,
    bio: "Especialista en trastornos de ansiedad y depresión con enfoque cognitivo-conductual.",
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
    tags: ["Estrés", "Autoestima", "Relaciones"],
    experience: "8 años",
    nextAvailable: "Mañana 10:00",
    online: true,
    presencial: false,
    bio: "Terapeuta especializado en autoestima y relaciones interpersonales.",
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
    tags: ["Niños", "Familia", "TDAH"],
    experience: "15 años",
    nextAvailable: "Jueves 09:00",
    online: true,
    presencial: true,
    bio: "Experta en desarrollo infantil y terapia familiar sistémica.",
  },
  {
    id: 4,
    name: "Dr. Roberto Jiménez",
    specialty: "Terapia de Pareja",
    rating: 4.7,
    reviews: 56,
    price: 60,
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
    tags: ["Pareja", "Comunicación", "Conflictos"],
    experience: "10 años",
    nextAvailable: "Hoy 18:00",
    online: true,
    presencial: true,
    bio: "Especialista en terapia de pareja y comunicación asertiva.",
  },
];

const specialties = [
  "Todas",
  "Ansiedad",
  "Depresión",
  "Estrés",
  "Niños",
  "Pareja",
  "Autoestima",
];

const Professionals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");

  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch =
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "Todas" ||
      prof.tags.some(
        (tag) => tag.toLowerCase() === selectedSpecialty.toLowerCase(),
      );
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Nuestros Profesionales</h1>
            <p className="text-muted-foreground">
              Encuentra el psicólogo ideal para ti
            </p>
          </div>

          {/* Search and filters */}
          <div className="space-y-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o especialidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {specialties.map((specialty) => (
                <Button
                  key={specialty}
                  variant={selectedSpecialty === specialty ? "calm" : "soft"}
                  size="sm"
                  onClick={() => setSelectedSpecialty(specialty)}
                  className="flex-shrink-0"
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {filteredProfessionals.map((professional, index) => (
              <motion.div
                key={professional.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative md:w-48 h-48 md:h-auto">
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
                  <div className="flex-1 p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {professional.name}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          {professional.specialty}
                        </p>

                        <div className="flex items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-coral text-coral" />
                            <span className="font-medium">
                              {professional.rating}
                            </span>
                            <span className="text-muted-foreground">
                              ({professional.reviews} reseñas)
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {professional.experience} exp.
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {professional.bio}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {professional.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${professional.price}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            /sesión
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-sage" />
                          <span>Próx: {professional.nextAvailable}</span>
                        </div>

                        <Button variant="hero" asChild>
                          <Link
                            to={`/appointments?professional=${professional.id}`}
                          >
                            Agendar Cita
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProfessionals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron profesionales con esos criterios.
              </p>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Professionals;
