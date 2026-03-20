# Gym Coaching

Aplicacion de coaching fitness con arquitectura `frontend + Supabase` (sin backend propio).

## Stack

- `Next.js` (App Router)
- `React`
- `Supabase` (Auth, Postgres, Storage, RLS)
- `shadcn/ui` + Tailwind

## Estructura recomendada

- `app/`: rutas y pantallas (admin, client, auth, receptionist)
- `app/actions/`: server actions que orquestan operaciones con Supabase
- `components/`: UI reutilizable y componentes de dominio
- `lib/`: acceso a datos y utilidades de dominio
- `scripts/`: migraciones SQL versionadas (fuente de verdad)
- `docs/`: plan de producto y documentacion funcional

## Base de datos

La app depende de Supabase con RLS activo. El orden de scripts para entornos nuevos esta documentado en `scripts/README.md`.

## Desarrollo

```bash
pnpm dev
pnpm build
```

Variables requeridas en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
