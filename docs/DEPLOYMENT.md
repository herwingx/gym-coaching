# GymCoach - Guia de Despliegue a Produccion

## Requisitos previos

- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) (recomendado) u otro hosting

## 1. Configurar Supabase

1. Crea un proyecto en Supabase
2. Ejecuta los scripts SQL en orden (ver `scripts/README.md`):
   - 001_create_schema.sql
   - 002_rls_policies.sql
   - 003_triggers.sql
   - 004_gamification_schema.sql
   - 005_progress_photos_storage.sql
   - 006_messages_avatars.sql
   - 007_exercises_seed.sql
   - 008_gym_settings_admin.sql

3. Configura Authentication en Supabase:
   - Habilita Email/Password
   - Ajusta las URLs de redireccion si es necesario

## 2. Variables de Entorno

Configura estas variables en tu plataforma de despliegue:

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJhbG...` |
| `ADMIN_SETUP_CODE` | Codigo para crear el primer admin | `TuCodigoSeguro123` |
| `RESEND_API_KEY` | API key de Resend para correos transaccionales | `re_xxx` |
| `EMAIL_FROM` | Remitente de los correos | `GymCoach <noreply@tudominio.com>` |
| `NEXT_PUBLIC_APP_URL` | URL base de la app (enlaces en correos) | `https://tu-app.vercel.app` |

**Importante:** `ADMIN_SETUP_CODE` debe ser un codigo unico y secreto. No uses valores por defecto en produccion.

**Correos:** Con Resend configurado, al crear un asesorado se envia automaticamente el codigo de invitacion por correo. Sin Resend, el codigo solo se muestra en pantalla. Obtén tu API key en [resend.com](https://resend.com) y verifica tu dominio.

## 3. Primer Admin

1. Despliega la aplicacion
2. Visita `/auth/admin-setup`
3. Ingresa el codigo configurado en `ADMIN_SETUP_CODE`
4. Completa el formulario (nombre del gym, tu nombre, email, contrasena)
5. Completa el onboarding en `/admin/onboarding`
6. La pagina de admin-setup quedara bloqueada una vez creado el primer admin

## 4. Desplegar en Vercel

```bash
# Conectar repo
vercel link

# Configurar variables de entorno
vercel env add ADMIN_SETUP_CODE
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
vercel env add NEXT_PUBLIC_APP_URL

# Deploy
vercel --prod
```

## 5. Checklist post-despliegue

- [ ] Verificar que el primer admin se puede crear
- [ ] Completar onboarding del admin
- [ ] Probar login de admin
- [ ] Crear un cliente de prueba
- [ ] Verificar que las rutinas funcionan
- [ ] Probar el chat/mensajeria
- [ ] Revisar que las imagenes (avatars, fotos de progreso) se suben correctamente
