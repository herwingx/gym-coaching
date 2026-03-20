# Guia de Configuracion del Administrador - GymCoach

## Flujo Completo del Sistema

### 1. TU (El Coach/Admin) - Primera Configuracion

1. Ve a `/auth/admin-setup`
2. Ingresa la clave secreta: `GYMCOACH2024` (puedes cambiarla despues)
3. Ingresa tu email y contrasena
4. Se creara tu cuenta con rol `admin`

**IMPORTANTE:** Esta pagina solo funciona UNA VEZ. Despues de crear el admin, se bloquea automaticamente.

### 2. Tus Clientes - Registro con Invitacion

Los clientes NO pueden registrarse libremente. El flujo es:

1. Tu vas a `/admin/invitations`
2. Generas un codigo de invitacion (ej: `ABC12345`)
3. Le envias el codigo a tu cliente por WhatsApp/Email
4. El cliente va a `/auth/sign-up` e ingresa el codigo
5. Solo entonces puede crear su cuenta

### 3. Control de Acceso

Desde `/admin/users` puedes:

- **Ver todos tus clientes** registrados
- **Activar/Suspender** cuentas
- **Controlar suscripciones** (si no pagan, los suspendes)

Los usuarios suspendidos veran una pantalla de "Cuenta Suspendida" y no podran acceder a ningun contenido.

---

## Cambiar la Clave Secreta del Admin

Para mayor seguridad, configura una variable de entorno:

```
NEXT_PUBLIC_ADMIN_SECRET=TU_CLAVE_SECRETA_AQUI
```

En Vercel:
1. Ve a Settings > Environment Variables
2. Agrega `NEXT_PUBLIC_ADMIN_SECRET` con tu clave personalizada

---

## Rutas Importantes

| Ruta | Descripcion |
|------|-------------|
| `/auth/admin-setup` | Configuracion inicial del admin (solo funciona 1 vez) |
| `/auth/login` | Login para todos los usuarios |
| `/auth/sign-up` | Registro de clientes (requiere codigo de invitacion) |
| `/admin/dashboard` | Panel de admin |
| `/admin/invitations` | Generar codigos de invitacion |
| `/admin/users` | Gestionar usuarios y suscripciones |
| `/client/dashboard` | Dashboard del cliente |
| `/suspended` | Pagina que ven los usuarios suspendidos |

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| `admin` | Todo el panel de admin + gestion de usuarios |
| `client` | Solo su dashboard personal y entrenamientos |
| `receptionist` | Panel de recepcion (gestion basica) |

---

## Flujo de Suscripcion

1. **active** - Usuario con acceso completo
2. **trial** - Periodo de prueba
3. **expired** - Suscripcion vencida (aun puede ver pero con limitaciones)
4. **suspended** - Sin acceso (redirige a /suspended)

---

## Proximos Pasos

1. Ve a `/auth/admin-setup` y crea tu cuenta de admin
2. Inicia sesion en `/auth/login`
3. Ve a `/admin/invitations` y genera tu primer codigo
4. Comparte el codigo con un cliente para probar el flujo
