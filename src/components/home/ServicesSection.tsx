import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  MessageCircle,
  ShoppingBag,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Video,
    title: "Terapia Online",
    description: "Sesiones de videollamada desde la comodidad de tu hogar",
    color: "calm",
    bgColor: "bg-calm-light",
    link: "/appointments",
  },
  {
    icon: Calendar,
    title: "Citas Presenciales",
    description: "Reserva tu espacio en nuestro consultorio",
    color: "lavender",
    bgColor: "bg-lavender-light",
    link: "/appointments",
  },
  {
    icon: Users,
    title: "Talleres Grupales",
    description: "Aprende técnicas de bienestar en grupo",
    color: "sage",
    bgColor: "bg-sage-light",
    link: "/workshops",
  },
  {
    icon: BookOpen,
    title: "Recursos Educativos",
    description: "Artículos, videos y guías para tu crecimiento",
    color: "sky",
    bgColor: "bg-sky-light",
    link: "/blog",
  },
  {
    icon: MessageCircle,
    title: "Comunidad",
    description: "Conecta con personas que comparten tu camino",
    color: "coral",
    bgColor: "bg-coral-light",
    link: "/community",
  },
  {
    icon: ShoppingBag,
    title: "Tienda",
    description: "Productos y materiales para tu bienestar",
    color: "lavender",
    bgColor: "bg-lavender-light",
    link: "/shop",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const ServicesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 md:text-4xl">
            Nuestros <span className="text-gradient">Servicios</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Todo lo que necesitas para tu bienestar mental en un solo lugar
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.title} variants={itemVariants}>
                <Link
                  to={service.link}
                  className="card-elevated block p-6 h-full hover:shadow-lg transition-all duration-300 group"
                >
                  <div
                    className={`${service.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-6 w-6 text-${service.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-calm transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
