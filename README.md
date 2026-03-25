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
pnpm install
cp .env.example .env.local
# Completa Supabase, service role y (si aplica) ADMIN_SETUP_CODE — ver .env.example
pnpm dev
```

En Supabase, ejecuta los SQL en el orden de `scripts/README.md` (proyecto nuevo). En **Auth → URL Configuration** añade `http://localhost:3000/auth/callback` en Redirect URLs.

Comprobar que todo compila y pasa tests antes de desplegar:

```bash
pnpm verify
```

Solo producción local estática:

```bash
pnpm build
pnpm start
```

Variables en `.env.local`: copia desde `.env.example`. Mínimo para arrancar: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Para crear el primer admin: `ADMIN_SETUP_CODE` (y opcionalmente Resend / `NEXT_PUBLIC_APP_URL`).
