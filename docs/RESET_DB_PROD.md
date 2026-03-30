# Resetear Supabase para Producción y Configuración de CORS

## 1. Resetear la base de datos de Supabase para usar como producción

**¡Advertencia!** Esto eliminará todos los datos y dejará la base limpia, solo con la estructura y seeds iniciales.

### Pasos sugeridos:

1. **Haz backup** si tienes datos importantes.
2. Entra a la consola de Supabase > SQL Editor.
3. Ejecuta manualmente los scripts de la carpeta `scripts/` en orden:
   - 001_create_schema.sql
   - 002_rls_policies.sql
   - 003_triggers.sql
   - 004_gamification_schema.sql
   - 005_progress_photos_storage.sql
   - 006_messages_avatars.sql
   - 007_exercises_seed.sql
   - 008_gym_settings_admin.sql
4. Elimina manualmente los datos de tablas si es necesario (`TRUNCATE` o `DELETE FROM ...`).
5. Verifica que la estructura y seeds estén correctos.

## 2. Estrategia para actualizar `NEXT_PUBLIC_APP_URL` y CORS

### a) Variable de entorno
- Cambia `NEXT_PUBLIC_APP_URL` en `.env` y en la plataforma de despliegue (Vercel, etc) al dominio real de producción, por ejemplo:
  ```env
  NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
  ```
- Esto asegura que los enlaces en correos y callbacks apunten al dominio correcto.

### b) Configuración de CORS en Supabase
1. Ve a Supabase > Settings > API > "Allowed Headers" y "All/owed Origins".
2. Agrega el dominio de producción (ejemplo: `https://tu-app.vercel.app`).
3. Si usas varios entornos, puedes separar por comas.
4. Guarda los cambios.

### c) Redirecciones de Auth
- En Supabase > Auth > URL de redirección, agrega el dominio de producción para login, signup y recovery.

## 3. Configuración de Cloudflare R2 para CORS

### a) CORS en R2
- Ve a Cloudflare Dashboard > R2 > tu bucket > CORS Rules.
- Agrega una regla como:
  ```json
  [
    {
      "AllowedOrigins": ["https://tu-app.vercel.app"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"]
    }
  ]
  ```
- Si necesitas acceso público a imágenes, puedes dejar `AllowedOrigins` como `*` solo para `GET`.

### b) Enlaces públicos
- La variable `NEXT_PUBLIC_R2_PUBLIC_URL` debe apuntar al endpoint público del bucket.
- Ejemplo:
  ```env
  NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev
  ```

---

## Resumen
- Cambia todas las URLs y variables a producción.
- Configura CORS en Supabase y R2 para el dominio real.
- Verifica que los enlaces en correos y callbacks funcionen correctamente.
- Haz pruebas de extremo a extremo tras el cambio.
