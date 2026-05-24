# Spec: Sección "¿Qué es La Ruta Resiliente?" + cambio de botón Hero

**Fecha:** 2026-05-24

---

## Objetivo

Reemplazar el botón "Agendar Cita Ahora" del Hero por "Descubre cómo iniciar" que desplace al usuario hacia una nueva sección explicativa sobre el proyecto, ubicada justo después del Hero en la página de inicio.

---

## Cambios en HeroSection

**Archivo:** `src/components/home/HeroSection.tsx`

- Cambiar el texto del botón de `"Agendar Cita Ahora"` a `"Descubre cómo iniciar"`.
- Cambiar el componente de `<Link to="/appointments">` a `<a href="#que-es">` para scroll en página.
- Mantener el mismo `variant="hero"` y el ícono `ArrowRight`.

---

## Nuevo componente: AboutSection

**Archivo:** `src/components/home/AboutSection.tsx`

### Layout

- **Desktop:** dos columnas (texto izquierda, imagen derecha).
- **Mobile:** columna única, imagen arriba, texto abajo.
- La sección lleva `id="que-es"` para que el anchor del Hero funcione.

### Contenido de texto

**Etiqueta pequeña (badge):** `"Nacida en 2018"`

**Título:** `"¿Qué es La Ruta Resiliente?"`

**Párrafo 1:**
> La Ruta Resiliente es un proyecto nacido en el 2018 que hoy se hace realidad, su finalidad es brindarte herramientas y enseñarte estrategias para que puedas fortalecerte ante la adversidad cuidando siempre de tu salud mental.

**Párrafo 2:**
> Aquí podrás encontrar una comunidad que se acompaña y que crece junta a través de talleres, encuentros educativos presenciales y recursos educativos amigables pensados para ti.

**CTA:** Botón `"Regístrate"` con `variant="hero"` y `ArrowRight`, enlaza a `/auth`.

### Placeholder de imagen

- `div` con fondo degradado usando colores `calm` y `lavender` del proyecto.
- Proporción aproximada 3:4 (vertical).
- Bordes redondeados (`rounded-2xl`).
- Texto interno `"Tu imagen aquí"` visible para guiar la carga posterior.

### Animaciones

- Usar `motion` de framer-motion con `whileInView` y `viewport={{ once: true }}`, igual que `ServicesSection` y `CTASection`.
- Texto y imagen con entrada `opacity: 0 → 1` + `y: 20 → 0`, con pequeño delay entre columnas.

---

## Cambios en Index.tsx

**Archivo:** `src/pages/Index.tsx`

- Importar `AboutSection`.
- Insertar `<AboutSection />` entre `<HeroSection />` y `<ServicesSection />`.

---

## Fuera de alcance

- No se crea una página nueva `/sobre-nosotros`.
- No se modifica la página `/auth`.
- No se cambian otras secciones del home.
