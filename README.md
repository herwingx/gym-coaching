
# RU Coach - Rodrigo Urbina Premium Coaching

Plataforma de élite para el seguimiento de entrenamiento personal, diseñada y dirigida por Rodrigo Urbina. Una experiencia mobile-first, gamificada y de alto rendimiento.

## Stack Tecnológico

- **Next.js 16** (Edge Runtime, App Router)
- **React 19** + **TypeScript**
- **Supabase** (Auth, PostgreSQL, Real-time RLS)
- **Tailwind CSS v4** + **shadcn/ui**
- **Serwist** (PWA Moderno & Offline Support)

## Estructura

- `app/`: Ecosistema de rutas (admin, client, auth, onboarding, receptionist)
- `app/actions/`: Lógica de servidor (Server Actions) optimizada para Edge
- `components/`: UI Premium y componentes de dominio
- `lib/`: Núcleo de datos, utilidades y lógica de negocio
- `docs/`: Guías maestras de migración y configuración

## Características Premium

- **Coaching de Élite**: Sistema diseñado para la metodología de Rodrigo Urbina.
- **Gamificación Avanzada**: Progresión por XP, niveles dinámicos y logros de fuerza.
- **PWA de Alto Impacto**: Instalable, ultra-rápida y con soporte offline total.
- **Builder Científico**: Creación de rutinas basadas en progresión de carga.
- **Seguridad de Grado Bancario**: Políticas RLS granulares en Supabase.

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Despliegue

Optimizado para **Vercel** de forma nativa. Solo conecta el repositorio y Vercel detectará automáticamente la configuración de Next.js.

---
© 2026 RU Coach | Rodrigo Urbina. Todos los derechos reservados.
