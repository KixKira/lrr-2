import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight, Play, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";

const articles = [
  {
    id: 1,
    title: "5 técnicas de respiración para calmar la ansiedad",
    excerpt:
      "Aprende ejercicios simples que puedes hacer en cualquier momento.",
    category: "Ansiedad",
    type: "artículo",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    readTime: "5 min",
    date: "Hace 2 días",
    featured: true,
  },
  {
    id: 2,
    title: "Cómo establecer límites saludables",
    excerpt: "Guía práctica para mejorar tus relaciones personales.",
    category: "Relaciones",
    type: "video",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
    readTime: "12 min",
    date: "Hace 3 días",
  },
  {
    id: 3,
    title: "Infografía: El ciclo del estrés",
    excerpt: "Entiende cómo funciona el estrés en tu cuerpo.",
    category: "Estrés",
    type: "infografía",
    image:
      "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=600&fit=crop",
    readTime: "3 min",
    date: "Hace 1 semana",
  },
  {
    id: 4,
    title: "Meditación para principiantes",
    excerpt: "Tu guía completa para empezar a meditar.",
    category: "Mindfulness",
    type: "artículo",
    image:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&h=600&fit=crop",
    readTime: "8 min",
    date: "Hace 1 semana",
  },
  {
    id: 5,
    title: "Entendiendo la depresión",
    excerpt: "Señales, causas y cuándo buscar ayuda profesional.",
    category: "Depresión",
    type: "video",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=600&fit=crop",
    readTime: "15 min",
    date: "Hace 2 semanas",
  },
];

const categories = [
  "Todos",
  "Ansiedad",
  "Depresión",
  "Estrés",
  "Mindfulness",
  "Relaciones",
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Play className="h-3 w-3" />;
    case "infografía":
      return <Image className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
};

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = filteredArticles.find((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Recursos Educativos</h1>
            <p className="text-muted-foreground">
              Artículos, videos e infografías para tu bienestar
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar recursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "calm" : "soft"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured article */}
          {featuredArticle && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated overflow-hidden mb-8"
            >
              <div className="md:flex">
                <div className="md:w-1/2 aspect-video md:aspect-auto relative">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-coral text-primary-foreground">
                    Destacado
                  </Badge>
                </div>
                <div className="p-6 md:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">
                      {getTypeIcon(featuredArticle.type)}
                      <span className="ml-1 capitalize">
                        {featuredArticle.type}
                      </span>
                    </Badge>
                    <Badge variant="outline">{featuredArticle.category}</Badge>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredArticle.readTime}
                    </span>
                    <span>{featuredArticle.date}</span>
                  </div>
                  <Button variant="calm" className="w-fit group">
                    Leer más
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </motion.article>
          )}

          {/* Regular articles grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {regularArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {article.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                      <div className="w-14 h-14 rounded-full bg-card/90 flex items-center justify-center">
                        <Play className="h-6 w-6 text-foreground ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {getTypeIcon(article.type)}
                      <span className="ml-1 capitalize">{article.type}</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-calm transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron recursos con esos criterios.
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

export default Blog;
