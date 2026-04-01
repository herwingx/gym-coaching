# GymCoach - Guía de Despliegue a Producción

## Requisitos previos

- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) u otro hosting compatible con Next.js
- Cuenta en [Cloudflare R2](https://cloudflare.com) para imágenes de ejercicios
- Node.js 18+ / `npx tsx` para el script de migración de ejercicios

---

## 1. Configurar Supabase

### A. Crear el Proyecto
1. Crea un nuevo proyecto en Supabase.
2. Ve a **Storage** y crea dos buckets:
   - `progress-photos` → **Privado**
   - `avatars` → **Público**

### B. Ejecutar el Schema
1. Abre `supabase/supabase_schema_dump.sql`.
2. Copia todo el contenido y ejecútalo en el **SQL Editor** de Supabase.
   - Esto crea toda la estructura (tablas, funciones, triggers, RLS). Los datos de ejercicios se cargan en el paso siguiente.

### C. Cargar los 1,324 Ejercicios (bilingües EN/ES)

Agrega estas 2 líneas al final de tu `.env`:
```env
TARGET_SUPABASE_URL=https://<nuevo_proyecto>.supabase.co
TARGET_SERVICE_ROLE_KEY=<service_role_key_nuevo>
```

Luego ejecuta:
```bash
npx tsx scripts/migrate-exercises.ts
```

El script lee tu `.env` automáticamente (origen = `NEXT_PUBLIC_SUPABASE_URL`, destino = `TARGET_*`).

> Ver `docs/DATABASE_GUIDE.md` para instrucciones detalladas.

### D. Configurar Authentication
1. Ve a **Auth → URL Configuration**.
2. Configura la **Site URL** con tu dominio de producción.
3. Agrega las **Redirect URLs** necesarias.

---

## 2. Variables de Entorno

Configura estas variables en tu plataforma de despliegue:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) | `eyJhbG...` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | URL pública de Cloudflare R2 | `https://pub-xxx.r2.dev` |
| `ADMIN_SETUP_CODE` | Código para crear el primer admin | `TuCodigoSeguro123` |
| `RESEND_API_KEY` | API key de Resend para correos | `re_xxx` |
| `EMAIL_FROM` | Remitente de correos | `GymCoach <noreply@tudominio.com>` |
| `NEXT_PUBLIC_APP_URL` | URL base de la app | `https://tu-app.vercel.app` |
| `VAPID_PUBLIC_KEY` | Clave pública VAPID para Web Push | `BDxx...` |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID para Web Push | `xxx...` |

**Importante:** `ADMIN_SETUP_CODE` y `SUPABASE_SERVICE_ROLE_KEY` deben ser secretos. Nunca los expongas en el frontend.

---

## 3. Primer Admin

1. Despliega la aplicación.
2. Visita `/auth/admin-setup`.
3. Ingresa el código configurado en `ADMIN_SETUP_CODE`.
4. Completa el formulario (nombre del gym, tu nombre, email, contraseña).
5. Completa el onboarding en `/admin/onboarding`.
6. La página de admin-setup quedará bloqueada una vez creado el primer admin.

---

## 4. Desplegar en Vercel

```bash
# Conectar repo
vercel link

# Configurar variables de entorno (una por una o en el dashboard de Vercel)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_R2_PUBLIC_URL
vercel env add ADMIN_SETUP_CODE
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
vercel env add NEXT_PUBLIC_APP_URL

# Deploy
vercel --prod
```

---

## 5. Checklist post-despliegue

- [ ] Schema SQL ejecutado correctamente en Supabase (solo estructura)
- [ ] Script `migrate-exercises.ts` ejecutado (1,324 ejercicios EN+ES cargados)
- [ ] Buckets `avatars` y `progress-photos` creados en Storage
- [ ] Variables de entorno configuradas en el hosting
- [ ] Primer admin creado en `/auth/admin-setup`
- [ ] Onboarding del admin completado (nombre del gym, timezone, etc.)
- [ ] Crear un cliente de prueba y verificar el flujo de invitación
- [ ] Verificar que el catálogo de ejercicios se muestra en español
- [ ] Probar subida de foto de perfil y foto de progreso
- [ ] Verificar correos de invitación con Resend
