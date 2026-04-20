# MindCare - La Ruta Resiliente

Plataforma de telemedicina para conectar pacientes con profesionales de la salud mental.

## Stack Tecnológico

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Estado**: TanStack Query + React Hook Form
- **Animaciones**: Framer Motion

## Configuración del Entorno

1. Copia el archivo de variables de entorno:
```bash
cp .env.example .env
```

2. Actualiza las variables en `.env` con tus credenciales de Supabase.

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm run test
```

## Despliegue de Edge Functions

Para desplegar las Edge Functions de Supabase:

```bash
# Login en Supabase CLI
npx supabase login

# Vincular proyecto
npx supabase link --project-ref wbvfnkvcwsojfatbcjng

# Desplegar todas las funciones
npx supabase functions deploy

# O desplegar funciones individuales
npx supabase functions deploy check-user
npx supabase functions deploy availability
npx supabase functions deploy appointments
npx supabase functions deploy clinical-notes
npx supabase functions deploy messages
npx supabase functions deploy payments
npx supabase functions deploy notifications
```

## Variables de Entorno para Edge Functions

Configura estas variables en el dashboard de Supabase (Project Settings > Edge Functions):

- `SUPABASE_SERVICE_ROLE_KEY`: Service role key para acceso a la base de datos
- `RESEND_API_KEY`: API key para envío de emails (opcional, modo mock disponible)
- `FROM_EMAIL`: Email remitente para notificaciones

## Estructura del Backend

### Edge Functions

| Función | Descripción |
|---------|-------------|
| `check-user` | Verifica si un email existe en la base de datos |
| `availability` | Consulta disponibilidad de horarios |
| `appointments` | CRUD de citas médicas |
| `clinical-notes` | Gestión de notas clínicas (solo profesionales) |
| `messages` | Sistema de mensajería entre usuarios |
| `payments` | Registro y gestión de pagos |
| `notifications` | Envío de notificaciones por email |

### Triggers y Webhooks

- **Appointment Notifications**: Envía emails cuando se crean/actualizan citas
- **Message Notifications**: Notifica nuevos mensajes
- **Payment Notifications**: Confirma recepción de pagos

## Esquema de Base de Datos

### Tablas Principales

- `profiles`: Perfiles de usuarios
- `user_roles`: Roles de usuario (admin/professional/patient)
- `professionals`: Información extendida de profesionales
- `appointments`: Citas médicas
- `professional_availability`: Horarios disponibles
- `clinical_notes`: Notas clínicas privadas
- `messages`: Mensajes entre usuarios
- `payments`: Registro de pagos
- `notifications`: Notificaciones y alertas

## Autenticación

El sistema utiliza Supabase Auth con:
- Email/Password
- Sesiones persistentes
- Row Level Security (RLS) en todas las tablas

## Seguridad

- Todas las tablas tienen RLS habilitado
- Las funciones Edge Functions verifican autenticación
- Las notas clínicas solo son accesibles por el profesional que las creó
- Los mensajes solo son visibles para remitente y destinatario

## Licencia

[MIT](LICENSE)
