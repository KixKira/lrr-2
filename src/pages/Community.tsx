import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Heart, MessageCircle, Share2, Users, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const groups = [
  { id: 1, name: "Manejo de Ansiedad", members: 234, color: "calm" },
  { id: 2, name: "Autoestima", members: 189, color: "lavender" },
  { id: 3, name: "Mindfulness Diario", members: 156, color: "sage" },
  { id: 4, name: "Apoyo Emocional", members: 312, color: "coral" },
];

const posts = [
  {
    id: 1,
    author: {
      name: "Ana María",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      initials: "AM",
    },
    content: "Hoy logré hacer mi primera sesión de meditación de 10 minutos. Pequeños pasos, grandes victorias. 🧘‍♀️✨",
    group: "Mindfulness Diario",
    likes: 24,
    comments: 8,
    time: "Hace 2 horas",
    liked: false,
  },
  {
    id: 2,
    author: {
      name: "Carlos R.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      initials: "CR",
    },
    content: "¿Alguien tiene consejos para manejar la ansiedad social en reuniones de trabajo? Me cuesta mucho hablar frente a grupos.",
    group: "Manejo de Ansiedad",
    likes: 15,
    comments: 12,
    time: "Hace 4 horas",
    liked: true,
  },
  {
    id: 3,
    author: {
      name: "Laura G.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      initials: "LG",
    },
    content: "Compartir mi progreso: Después de 3 meses de terapia, finalmente puedo identificar mis patrones negativos antes de que me afecten. El trabajo vale la pena. 💪",
    group: "Autoestima",
    likes: 45,
    comments: 15,
    time: "Hace 6 horas",
    liked: false,
  },
  {
    id: 4,
    author: {
      name: "Miguel A.",
      avatar: null,
      initials: "MA",
    },
    content: "Gracias a este grupo por el apoyo. Leer sus historias me recuerda que no estoy solo en esto. 🙏",
    group: "Apoyo Emocional",
    likes: 67,
    comments: 23,
    time: "Ayer",
    liked: true,
  },
];

const Community = () => {
  const [likedPosts, setLikedPosts] = useState<number[]>(
    posts.filter((p) => p.liked).map((p) => p.id)
  );

  const toggleLike = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Comunidad</h1>
              <p className="text-muted-foreground">
                Conecta, comparte y crece junto a otros
              </p>
            </div>
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar en la comunidad..."
              className="pl-12 h-12 rounded-xl"
            />
          </div>

          {/* Groups */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Grupos de Apoyo</h2>
              <Button variant="ghost" size="sm">Ver todos</Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {groups.map((group) => (
                <button
                  key={group.id}
                  className={`flex-shrink-0 card-elevated p-4 hover:shadow-lg transition-all min-w-[160px]`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${group.color}-light flex items-center justify-center mb-3`}>
                    <Users className={`h-5 w-5 text-${group.color}`} />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{group.name}</h3>
                  <p className="text-xs text-muted-foreground">{group.members} miembros</p>
                </button>
              ))}
            </div>
          </div>

          {/* Trending topics */}
          <div className="card-elevated p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-coral" />
              <span className="text-sm font-medium">Temas del momento</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">#autocuidado</Badge>
              <Badge variant="secondary">#meditación</Badge>
              <Badge variant="secondary">#gratitud</Badge>
              <Badge variant="secondary">#pequeñasVictorias</Badge>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                    <AvatarFallback className="bg-calm-light text-calm text-sm font-medium">
                      {post.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{post.author.name}</span>
                      <Badge variant="secondary" className="text-xs">{post.group}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                  </div>
                </div>

                <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

                <div className="flex items-center gap-6 pt-3 border-t border-border">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      likedPosts.includes(post.id)
                        ? "text-coral"
                        : "text-muted-foreground hover:text-coral"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        likedPosts.includes(post.id) ? "fill-coral" : ""
                      }`}
                    />
                    <span>{post.likes + (likedPosts.includes(post.id) && !post.liked ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-calm transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-lavender transition-colors ml-auto">
                    <Share2 className="h-5 w-5" />
                  </button>
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

export default Community;
