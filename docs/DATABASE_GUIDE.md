# Guía de Base de Datos (Supabase)

Este documento es la referencia principal para configurar, resetear o migrar la base de datos de GymCoach. Ya no se utilizan archivos de migración individuales; toda la estructura está consolidada en un único archivo SQL.

## 1. Archivo Maestro de Esquema

El archivo `supabase/supabase_schema_dump.sql` contiene la definición completa de:
- **Extensiones**: `pg_stat_statements`, `uuid-ossp`, `supabase_vault`, `pgcrypto`, `pg_graphql`.
- **Esquema Público**: Todas las tablas, columnas, tipos (incluyendo arrays y JSONB), llaves primarias y foráneas.
- **Lógica de Servidor**: Funciones, procedimientos y triggers para gamificación (XP, niveles, rachas), sincronización de avatares y gestión de invitaciones.
- **Seguridad (RLS)**: Políticas completas para asegurar que coaches y clientes solo vean sus propios datos.
- **Storage**: Políticas de acceso para los buckets de fotos de progreso y avatares.
- **Catálogo de Ejercicios**: 1,324 ejercicios con esquema **bilingüe** (inglés + español):
  - Columnas `_es`: `name_es`, `equipment_es`, `body_parts_es`, `target_muscles_es`, `secondary_muscles_es`, `instructions_es`
  - La app usa lógica **"español primero, inglés como fallback"** en toda la UI.

---

## 2. Configuración Inicial o Reseteo (Entorno de Producción)

### A. Preparar el Proyecto en Supabase
1. Crea un nuevo proyecto en Supabase (o usa uno existente).
2. Ve a **Storage** y crea los siguientes buckets:
   - `progress-photos` (Bucket Privado).
   - `avatars` (Bucket Público).

### B. Ejecutar el Esquema (solo estructura, sin datos)
1. Copia el contenido de `supabase/supabase_schema_dump.sql`.
2. Ve al **SQL Editor** en el panel de Supabase.
3. Pega el contenido y ejecútalo. Esto crea toda la estructura: tablas, funciones, triggers, políticas RLS y Storage.

> **Nota:** El dump ya NO contiene INSERT de ejercicios. Los datos se cargan en el paso siguiente.

### C. Cargar los 1,324 Ejercicios (bilingües EN/ES)

Todos los datos de ejercicios (inglés + español) se cargan con un solo comando.

**1. Agrega estas 2 líneas al final de tu `.env`:**
```env
TARGET_SUPABASE_URL=https://<nuevo_proyecto>.supabase.co
TARGET_SERVICE_ROLE_KEY=<service_role_key_del_nuevo_proyecto>
```

**2. Ejecuta:**
```bash
npx tsx scripts/migrate-exercises.ts
```

El script lee automáticamente tu `.env` actual como origen y usa las variables `TARGET_*` como destino.

- Descarga los 1,324 ejercicios completos del proyecto origen (inglés + español).
- Hace **UPSERT** en el destino (seguro: no duplica si el id ya existe, solo actualiza).
- Guarda un backup JSON local en `scripts/exercises-full-backup.json`.

> **¿Dónde obtengo el `TARGET_SERVICE_ROLE_KEY`?**
> En el panel de Supabase del proyecto nuevo: **Settings → API → service_role (secret)**.
> ⚠️ Nunca expongas esta clave en el frontend. Borra las líneas `TARGET_*` del `.env` después de migrar.

---

## 3. Migrar SOLO los Ejercicios (sin resetear todo)

Si ya tienes el proyecto configurado y solo necesitas cargar o actualizar las traducciones `_es`:

1. Asegúrate de tener `TARGET_SUPABASE_URL` y `TARGET_SERVICE_ROLE_KEY` en tu `.env`
2. Ejecuta: `npx tsx scripts/migrate-exercises.ts`

El UPSERT actualiza los registros existentes sin borrar datos de otras tablas.

---

## 4. Configuración de Entorno (Variables y CORS)

### A. Variables de Entorno (.env)
Actualiza las siguientes variables en tu plataforma de despliegue (ej. Cloudflare Pages o Vercel):
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-key
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxx.r2.dev
ADMIN_SETUP_CODE=tu-codigo-secreto
RESEND_API_KEY=re_xxx
EMAIL_FROM=GymCoach <noreply@tudominio.com>
```

### B. Configuración de Auth en Supabase
1. Ve a **Auth → URL Configuration**.
2. Configura la **Site URL** y las **Redirect URLs** con tu dominio de producción para que los correos de invitación y recuperación funcionen.

### C. Configuración de CORS en Supabase
1. Ve a **Settings → API**.
2. En **Allowed Origins**, agrega tu dominio (ej. `https://tu-dominio.com`).

---

## 5. Integración con Cloudflare R2

Para que las imágenes de los ejercicios y fotos de progreso funcionen correctamente:
1. Ve a **R2 → tu bucket → CORS Rules**.
2. Agrega la siguiente regla:
```json
[
  {
    "AllowedOrigins": ["https://tu-dominio.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"]
  }
]
```

---

## 6. Scripts Disponibles

| Script | Propósito |
|---|---|
| `supabase/supabase_schema_dump.sql` | Crea toda la estructura de la DB (sin datos) |
| `scripts/migrate-exercises.ts` | Carga los 1,324 ejercicios (EN+ES) desde un proyecto Supabase a otro |

---

## 7. Verificación Final
1. Usa el código definido en `ADMIN_SETUP_CODE` para crear el primer administrador en `/auth/admin-setup`.
2. Crea un código de invitación desde el panel de admin y prueba el registro de un cliente.
3. Sube una foto de perfil y una de progreso para validar las políticas de Storage.
4. Verifica en el **Catálogo de Ejercicios** que los nombres apparezcan en español.
