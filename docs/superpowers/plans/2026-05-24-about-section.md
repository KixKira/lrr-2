# AboutSection + Hero Button Change — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cambiar el botón del Hero a "Descubre cómo iniciar" y agregar una nueva sección `AboutSection` que explique qué es La Ruta Resiliente, con layout de dos columnas (texto + placeholder de imagen) y botón de registro.

**Architecture:** Se crea un nuevo componente `AboutSection` en `src/components/home/`, siguiendo el mismo patrón de los componentes existentes (framer-motion con `whileInView`, colores del sistema de diseño del proyecto). El Hero recibe un cambio mínimo: texto del botón y destino del enlace. `Index.tsx` inserta `AboutSection` entre `HeroSection` y `ServicesSection`.

**Tech Stack:** React, TypeScript, Tailwind CSS, framer-motion, lucide-react, react-router-dom

---

## File Map

| Acción  | Archivo                                    | Cambio                                             |
|---------|--------------------------------------------|----------------------------------------------------|
| Modify  | `src/components/home/HeroSection.tsx`      | Botón: texto + anchor scroll en lugar de Link      |
| Create  | `src/components/home/AboutSection.tsx`     | Nuevo componente con texto, placeholder e imagen   |
| Modify  | `src/pages/Index.tsx`                      | Importar e insertar `<AboutSection />`             |

---

## Task 1: Modificar el botón del Hero

**Files:**
- Modify: `src/components/home/HeroSection.tsx:60-65`

- [ ] **Step 1: Cambiar el botón**

En `src/components/home/HeroSection.tsx`, reemplazar el bloque del botón (líneas 60-65):

```tsx
// ANTES
<Button variant="hero" size="xl" className="group" asChild>
  <Link to="/appointments">
    Agendar Cita Ahora
    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
  </Link>
</Button>

// DESPUÉS
<Button variant="hero" size="xl" className="group" asChild>
  <a href="#que-es">
    Descubre cómo iniciar
    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
  </a>
</Button>
```

También eliminar el import de `Link` de `react-router-dom` en la línea 4, ya que deja de usarse:

```tsx
// Eliminar esta línea:
import { Link } from "react-router-dom";
```

- [ ] **Step 2: Verificar que compila**

```bash
npm run build
```

Resultado esperado: sin errores de TypeScript ni de compilación.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HeroSection.tsx
git commit -m "feat: change Hero button to scroll anchor for AboutSection"
```

---

## Task 2: Crear AboutSection

**Files:**
- Create: `src/components/home/AboutSection.tsx`

- [ ] **Step 1: Crear el archivo**

Crear `src/components/home/AboutSection.tsx` con el siguiente contenido completo:

```tsx
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const AboutSection = () => {
  return (
    <section id="que-es" className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Columna de texto — order-2 en mobile para que la imagen aparezca primero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-calm-light px-4 py-2 text-sm font-medium text-calm mb-6">
              <Sparkles className="h-4 w-4" />
              Nacida en 2018
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Qué es{" "}
              <span className="text-gradient">La Ruta Resiliente</span>?
            </h2>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              La Ruta Resiliente es un proyecto nacido en el 2018 que hoy se
              hace realidad, su finalidad es brindarte herramientas y enseñarte
              estrategias para que puedas fortalecerte ante la adversidad
              cuidando siempre de tu salud mental.
            </p>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              Aquí podrás encontrar una comunidad que se acompaña y que crece
              junta a través de talleres, encuentros educativos presenciales y
              recursos educativos amigables pensados para ti.
            </p>

            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth">
                Regístrate
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {/* Columna de imagen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            {/* Reemplazar este div con <img src="..." alt="..." className="w-full max-w-sm rounded-2xl object-cover" /> cuando tengas la imagen */}
            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl bg-gradient-to-br from-calm/30 via-lavender/20 to-calm-light flex flex-col items-center justify-center gap-3 border-2 border-dashed border-calm/30">
              <div className="w-16 h-16 rounded-full bg-calm/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-calm/60" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Tu imagen aquí</p>
              <p className="text-xs text-muted-foreground/60 text-center px-6">
                Reemplaza este bloque con un &lt;img&gt; cuando tengas la foto
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Verificar que compila**

```bash
npm run build
```

Resultado esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/AboutSection.tsx
git commit -m "feat: add AboutSection component with placeholder image"
```

---

## Task 3: Agregar AboutSection a Index.tsx

**Files:**
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Importar e insertar el componente**

En `src/pages/Index.tsx`, agregar el import:

```tsx
import { AboutSection } from "@/components/home/AboutSection";
```

Y agregar `<AboutSection />` entre `<HeroSection />` y `<ServicesSection />`:

```tsx
<main>
  <HeroSection />
  <AboutSection />
  <ServicesSection />
  <ProfessionalsPreview />
  <CTASection />
</main>
```

- [ ] **Step 2: Build final**

```bash
npm run build
```

Resultado esperado: compilación exitosa sin errores ni warnings de TypeScript.

- [ ] **Step 3: Verificar visualmente**

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Abrir `http://localhost:5173` y verificar:
1. El botón del Hero dice "Descubre cómo iniciar".
2. Al hacer clic en el botón, la página hace scroll hasta la nueva sección.
3. La sección muestra el título, los dos párrafos, el placeholder de imagen y el botón "Regístrate".
4. En mobile (DevTools < 768px), la imagen aparece arriba y el texto abajo.
5. El botón "Regístrate" navega a `/auth`.

- [ ] **Step 4: Commit final**

```bash
git add src/pages/Index.tsx
git commit -m "feat: insert AboutSection into home page between Hero and Services"
```
