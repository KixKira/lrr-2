import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Download, Star, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    id: 1,
    name: "Agenda de Bienestar 2024",
    description: "Planifica tu año con ejercicios de mindfulness",
    price: 25,
    originalPrice: 35,
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop",
    category: "físico",
    rating: 4.8,
    reviews: 45,
    bestseller: true,
  },
  {
    id: 2,
    name: "E-book: Gestiona tu Ansiedad",
    description: "Guía práctica con técnicas comprobadas",
    price: 12,
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop",
    category: "digital",
    rating: 4.9,
    reviews: 128,
    bestseller: true,
  },
  {
    id: 3,
    name: "Taza Mindful Mornings",
    description: "Cerámica artesanal con mensaje inspirador",
    price: 18,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    category: "físico",
    rating: 4.7,
    reviews: 34,
  },
  {
    id: 4,
    name: "Pack PDF: Meditaciones Guiadas",
    description: "10 meditaciones para diferentes momentos",
    price: 8,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    category: "digital",
    rating: 5.0,
    reviews: 67,
  },
  {
    id: 5,
    name: "Diario de Gratitud",
    description: "365 días de reflexión positiva",
    price: 20,
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop",
    category: "físico",
    rating: 4.6,
    reviews: 52,
  },
  {
    id: 6,
    name: "Curso: Autoestima Sólida",
    description: "Programa completo de 4 semanas",
    price: 45,
    originalPrice: 65,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop",
    category: "digital",
    rating: 4.9,
    reviews: 89,
    bestseller: true,
  },
];

const categories = ["Todos", "Digital", "Físico"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [cart, setCart] = useState<number[]>([]);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "Todos") return true;
    return product.category === selectedCategory.toLowerCase();
  });

  const addToCart = (productId: number) => {
    setCart([...cart, productId]);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tienda</h1>
              <p className="text-muted-foreground">
                Productos y recursos para tu bienestar
              </p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0 relative">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrito
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-coral text-primary-foreground text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "calm" : "soft"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "Digital" && (
                  <Download className="h-4 w-4 mr-1" />
                )}
                {category}
              </Button>
            ))}
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-elevated overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.bestseller && (
                    <Badge className="absolute top-3 left-3 bg-coral text-primary-foreground">
                      Más vendido
                    </Badge>
                  )}
                  {product.category === "digital" && (
                    <Badge className="absolute top-3 right-3 bg-calm text-primary-foreground">
                      <Download className="h-3 w-3 mr-1" />
                      Digital
                    </Badge>
                  )}
                  <button className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3 w-3 fill-coral text-coral" />
                    <span className="text-xs font-medium">
                      {product.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="calm"
                      size="sm"
                      onClick={() => addToCart(product.id)}
                      disabled={cart.includes(product.id)}
                    >
                      {cart.includes(product.id) ? "✓" : "+"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Shop;
