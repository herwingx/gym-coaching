# Guía de Base de Datos (Supabase)

Este documento es la referencia principal para configurar, resetear o migrar la base de datos de GymCoach. Ya no se utilizan archivos de migración individuales; toda la estructura está consolidada en un único archivo SQL.

## 1. Archivo Maestro de Esquema
El archivo `supabase/supabase_schema_dump.sql` contiene la definición completa de:
- **Extensiones**: `pg_stat_statements`, `uuid-ossp`, `supabase_vault`, `pgcrypto`, `pg_graphql`.
- **Esquema Público**: Todas las tablas, columnas, tipos (incluyendo arrays y JSONB), llaves primarias y foráneas.
- **Lógica de Servidor**: Funciones, procedimientos y triggers para gamificación (XP, niveles, rachas), sincronización de avatares y gestión de invitaciones.
- **Seguridad (RLS)**: Políticas completas para asegurar que coaches y clientes solo vean sus propios datos.
- **Storage**: Políticas de acceso para los buckets de fotos de progreso y avatares.

---

## 2. Configuración Inicial o Reseteo (Entorno de Producción)

### A. Preparar el Proyecto en Supabase
1. Crea un nuevo proyecto en Supabase (o usa uno existente).
2. Ve a **Storage** y crea los siguientes buckets:
   - `progress-photos` (Bucket Privado).
   - `avatars` (Bucket Público).

### B. Ejecutar el Esquema y Datos Maestros
1. Copia el contenido de `supabase/supabase_schema_dump.sql`.
2. Ve al **SQL Editor** en el panel de Supabase.
3. Pega el contenido y ejecútalo. Este paso creará toda la estructura, funciones, políticas y cargará automáticamente los 1324 ejercicios con sus imágenes e instrucciones.

### C. Carga de Datos Maestros y URLs de R2
1. Antes de ejecutar el script SQL, abre `supabase_schema_dump.sql` y busca la cadena `{{NEXT_PUBLIC_R2_PUBLIC_URL}}`.
2. Reemplázala globalmente por tu nueva URL pública de Cloudflare R2 (ej. `https://pub-nuevo.r2.dev`).
3. Una vez reemplazado, pega el contenido en el **SQL Editor** de Supabase y ejecútalo. Esto cargará automáticamente los 1324 ejercicios apuntando a tu nuevo bucket.

---

## 3. Configuración de Entorno (Variables y CORS)

## 3. Configuración de Entorno (Variables y CORS)

### A. Variables de Entorno (.env)
Actualiza las siguientes variables en tu plataforma de despliegue (ej. Cloudflare Pages):
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-key
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### B. Configuración de Auth en Supabase
1. Ve a **Auth > URL Configuration**.
2. Configura la **Site URL** y las **Redirect URLs** con tu dominio de producción para que los correos de invitación y recuperación funcionen.

### C. Configuración de CORS en Supabase
1. Ve a **Settings > API**.
2. En **Allowed Origins**, agrega tu dominio (ej. `https://tu-dominio.com`).

---

## 4. Integración con Cloudflare R2

Para que las imágenes de los ejercicios y fotos de progreso funcionen correctamente:
1. Ve a **R2 > tu bucket > CORS Rules**.
2. Agrega la siguiente regla (puedes usar `*` en AllowedOrigins solo si es necesario para acceso público de lectura):
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

## 5. Verificación Final
1. Usa el código definido en `ADMIN_SETUP_CODE` para crear el primer administrador en `/auth/admin-setup`.
2. Crea un código de invitación desde el panel de admin y prueba el registro de un cliente.
3. Sube una foto de perfil y una de progreso para validar las políticas de Storage.
