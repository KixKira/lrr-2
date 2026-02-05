import { Link } from "react-router-dom";
import { Heart, Instagram, Facebook, Twitter, Mail } from "lucide-react";

const footerLinks = {
  servicios: [
    { label: "Terapia Online", href: "/appointments" },
    { label: "Citas Presenciales", href: "/appointments" },
    { label: "Talleres", href: "/workshops" },
    { label: "Tienda", href: "/shop" },
  ],
  recursos: [
    { label: "Blog", href: "/blog" },
    { label: "Comunidad", href: "/community" },
    { label: "Material Descargable", href: "/resources" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacidad", href: "/privacy" },
    { label: "Términos", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pb-24 md:pb-8">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-calm to-lavender">
                <span className="text-lg font-bold text-primary-foreground">
                  R
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">
                La Ruta <span className="text-calm">Resiliente</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Tu salud mental importa. Estamos aquí para acompañarte.
            </p>
            <div className="flex gap-3">
              <Link
                to="#"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-calm-light hover:text-calm transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                to="#"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-calm-light hover:text-calm transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                to="#"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-calm-light hover:text-calm transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                to="#"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-calm-light hover:text-calm transition-colors"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Servicios</h4>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-calm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Recursos</h4>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-calm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-calm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 La Ruta Resiliente. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Hecho con <Heart className="h-4 w-4 text-coral fill-coral" /> para
            tu bienestar.{" "}
            <Link to="https://takariwa.studio" target="_blank">
              Takariwa Studio
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
