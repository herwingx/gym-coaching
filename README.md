
# GymCoach

Plataforma premium de coaching fitness para gimnasios y entrenadores personales. Experiencia mobile-first, gamificada y sin backend propio, usando Next.js y Supabase.

## Stack

- **Next.js 16** (App Router, Server Components)
- **React 19** + **TypeScript**
- **Supabase** (Auth, PostgreSQL, Storage, RLS)
- **shadcn/ui** + **Tailwind CSS v4**

## Estructura del Proyecto

- `app/`: rutas y pantallas (admin, client, auth, onboarding, receptionist)
- `app/actions/`: server actions para lógica de negocio
- `components/`: UI reutilizable y componentes de dominio
- `lib/`: acceso a datos, lógica de negocio y utilidades
- `docs/`: documentación funcional, técnica y roadmap

## Características Clave

- Onboarding guiado para admin y clientes
- Sistema de invitaciones y aprobación manual
- Builder visual de rutinas y asignación inteligente
- Tracking automático de progresión y PRs
- Gamificación: XP, niveles, logros, rachas
- Dashboard inteligente para coach y clientes
- Seguridad avanzada: RLS, control de acceso, suspensión automática
- PWA: instalación en móvil/desktop, offline support

## Desarrollo Local

```bash
pnpm install
cp .env.example .env.local
# Completa las variables de entorno: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_SETUP_CODE, etc.
pnpm dev
```

## Despliegue

1. Configura tu proyecto en Supabase y Vercel (o similar)
2. Añade las variables de entorno necesarias
3. Despliega con Vercel o tu plataforma preferida
4. Accede a `/auth/admin-setup` para crear el primer admin

## Documentación

- Documentación completa y premium en [`docs/`](docs/README.md)
- Arquitectura técnica en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Guía de rutinas en [`docs/ROUTINES.md`](docs/ROUTINES.md)
- Progresión y gamificación en [`docs/PROGRESSION.md`](docs/PROGRESSION.md)

---

¿Dudas? Consulta la documentación interna o contacta a soporte.
