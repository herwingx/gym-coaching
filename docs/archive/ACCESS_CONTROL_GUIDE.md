# Sistema de Control de Acceso - GymCoach Premium

## Resumen Ejecutivo

GymCoach tiene un sistema de 3 niveles de acceso:
1. **ADMIN (Coach)** - Control total, único por gym
2. **CLIENTE (Asesorado)** - Acceso limitado, requiere aprobación y pago
3. **RECEPTIONIST** - Gestión básica de clientes

---

## Flujo 1: Configuración Inicial del Admin (Coach)

### Cómo se registra el ADMIN:

1. **Primera vez que alguien accede a la app:**
   - Van a `/auth/admin-setup`
   - Ven una página que verifica si ya existe admin
   - Si no existe: pueden crear uno

2. **Para crear admin necesitan:**
   - **Clave Secreta** (default: `GYMCOACH2024`)
   - Email y contraseña

3. **Qué pasa después:**
   - El usuario se convierte automáticamente en `role = 'admin'`
   - Ya no puede crearse otro admin (solo uno por gym)
   - Accede a `/admin/dashboard`

### Variables de Entorno para Admin Setup:
```env
NEXT_PUBLIC_ADMIN_SECRET=GYMCOACH2024  # Cambia esto en producción
```

---

## Flujo 2: Generación de Códigos de Invitación

### El Admin crea códigos para sus clientes:

1. **Va a:** `/admin/invitations`

2. **Puede:**
   - Generar códigos únicos (8 caracteres)
   - Especificar email (opcional)
   - Establecer duración (default: 30 días)
   - Ver todos los códigos generados
   - Ver cuáles fueron usados
   - Eliminar códigos no usados

3. **Tabla de Invitaciones:**
```sql
invitation_codes:
- id (uuid)
- code (text, UNIQUE) - "ABCD1234"
- created_by (uuid) - ID del admin que lo creó
- email (text, optional) - Si está limitado a un email
- expires_at (timestamp) - Cuándo expira
- max_uses (integer) - 1 por defecto
- times_used (integer) - Veces usadas
- is_active (boolean) - Puede desactivarse
- used_by_user_id (uuid) - ID del usuario que lo usó
- created_at (timestamp)
```

---

## Flujo 3: Registro de Cliente (Asesorado)

### El cliente se registra con código de invitación:

1. **Va a:** `/auth/sign-up`

2. **Pasos:**
   - Ingresa el código de invitación (ej: `ABCD1234`)
   - Sistema valida:
     - ✓ Código existe
     - ✓ Código no está expirado
     - ✓ Código no fue usado
     - ✓ Si el código tiene email asociado, verifica que coincida
   - Ingresa email y contraseña
   - Se crea su cuenta

3. **Estado después del registro:**
   - `profiles.role = 'client'`
   - `clients.admin_approved = false` ← **PENDIENTE APROBACIÓN**
   - `clients.status = 'pending'`
   - **NO PUEDE ACCEDER A LA APP** (bloqueado por RLS)

4. **En BD se crea:**
```sql
profiles:
- id: user_id
- role: 'client'
- email: su_email@ejemplo.com
- onboarding_completed: false

clients:
- user_id: su_id
- full_name: "Juan"
- email: su_email@ejemplo.com
- status: 'pending'
- admin_approved: false ← CLAVE
- membership_end: null
- current_plan_id: null
```

---

## Flujo 4: Aprobación de Clientes

### El Admin aprueba o rechaza solicitantes:

1. **Va a:** `/admin/clients/pending`

2. **Ve:**
   - Todos los clientes con `admin_approved = false`
   - Información: nombre, email, fecha solicitud, objetivo

3. **Puede:**
   - **Aprobar:** Cambia `admin_approved = true` y `status = 'active'`
   - **Rechazar:** Elimina el cliente completamente

4. **Después de aprobar:**
   - El cliente YA PUEDE iniciar sesión
   - Ve el onboarding de 4 pasos
   - Accede a `/client/dashboard`

---

## Flujo 5: Control de Acceso por Pago

### Si el cliente PAGA:

1. **Admin hace pago en:** `/admin/payments/new`

2. **Se registra:**
   - `payments.client_id = cliente_id`
   - `payments.amount = 999`
   - `payments.paid_at = now()`
   - `clients.membership_start = hoy`
   - `clients.membership_end = hoy + 30 días`

3. **Cliente obtiene:**
   - `clients.status = 'active'`
   - Acceso completo a todos los features

### Si el cliente NO PAGA:

1. **Admin puede:**
   - Cambiar `clients.status = 'suspended'`
   - `clients.suspension_reason = "Falta de pago"`

2. **Cliente:**
   - ✓ Aún puede ver el dashboard
   - ✗ NO puede crear workouts
   - ✗ NO puede loguear sets
   - ✗ NO puede marcar ejercicios

---

## Políticas RLS (Row Level Security)

### Para Clientes:
```sql
-- Solo pueden acceder si están aprobados y activos
CREATE POLICY "Clients can view own data"
  ON exercise_logs
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND user_id IN (
      SELECT id FROM profiles 
      WHERE admin_approved = true 
      AND status = 'active'
    )
  );

-- Solo pueden CREAR workouts si están activos
CREATE POLICY "Clients can create workout sessions"
  ON workout_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id::text FROM clients 
      WHERE admin_approved = true 
      AND status = 'active'
    )
  );
```

### Para Admin:
```sql
-- Pueden ver todo lo de sus clientes
CREATE POLICY "Admins can view all data"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );
```

---

## Flujo Completo Resumido

```
┌─────────────────────────────────────────────────────────┐
│ 1. ADMIN SETUP                                          │
│    Coach va a /auth/admin-setup                         │
│    Ingresa código secreto (GYMCOACH2024)                │
│    ↓ role = 'admin'                                    │
│    ↓ Acceso: /admin/dashboard                           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. GENERATE INVITATION CODE                             │
│    Admin va a /admin/invitations                        │
│    Genera código: "ABCD1234"                            │
│    Lo comparte con el cliente vía WhatsApp/Email        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. CLIENT SIGNUP                                        │
│    Cliente va a /auth/sign-up                           │
│    Ingresa código: "ABCD1234"                           │
│    Crea email y contraseña                              │
│    ↓ admin_approved = false                             │
│    ↓ status = 'pending'                                │
│    ✗ NO PUEDE ACCEDER                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. ADMIN APPROVES CLIENT                                │
│    Admin va a /admin/clients/pending                    │
│    Ve solicitud del cliente                             │
│    Click "Aprobar"                                      │
│    ↓ admin_approved = true                              │
│    ↓ status = 'active'                                 │
│    ✓ CLIENTE PUEDE ACCEDER                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. CLIENT STARTS TRAINING                               │
│    Cliente inicia sesión en /auth/login                 │
│    Completa onboarding (4 pasos)                        │
│    ↓ Acceso: /client/dashboard                          │
│    ↓ Puede usar la app completamente                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 6. PAYMENT & SUBSCRIPTION                               │
│    Admin registra pago en /admin/payments               │
│    ↓ membership_start = hoy                             │
│    ↓ membership_end = hoy + 30 días                     │
│    ↓ status = 'active'                                 │
│    ✓ ACCESO COMPLETO                                    │
│                                                         │
│    Si no paga:                                          │
│    ↓ status = 'suspended'                              │
│    ✗ NO PUEDE CREAR WORKOUTS                           │
└─────────────────────────────────────────────────────────┘
```

---

## Cambios de Estado del Cliente

| Estado | admin_approved | status | Acceso |
|--------|---|---|---|
| **Nuevo** | false | pending | ✗ Bloqueado |
| **Aprobado** | true | active | ✓ Acceso completo |
| **Sin pago** | true | suspended | ⚠️ Ver solo, no entrenar |
| **Rechazado** | - | deleted | ✗ Bloqueado |

---

## Seguridad

### ¿Cómo evito que cualquiera se registre?

1. **Códigos de invitación únicos** - Cada cliente necesita un código
2. **Aprobación manual** - Admin debe aprobar cada solicitud
3. **RLS en BD** - Postgres bloquea acceso sin autorización
4. **Estado de pago** - Si no pagan, se suspenden

### ¿Qué información ve el Admin?

- Todos los clientes aprobados y no aprobados
- Historial completo de pagos
- Workouts y ejercicios de cada cliente
- Medidas corporales
- XP y achievements

### ¿Qué información ve el Cliente?

- Solo sus datos
- Sus workouts
- Sus medidas
- Su leaderboard (comparado con otros clientes del mismo gym)

---

## Cómo administrar acceso sin pago

### 1. Registrar pago en la app:
```
/admin/payments/new
→ Selecciona cliente
→ Ingresa monto
→ Elige plan
→ Guarda
```

### 2. Si cliente no paga:
```
/admin/clients
→ Busca cliente
→ Click en su nombre
→ Cambiar status a "suspended"
→ Guarda
```

### 3. Si vuelve a pagar:
```
/admin/payments/new
→ Registra nuevo pago
→ Cliente vuelve a tener acceso
```

---

## Preguntas Frecuentes

**¿Puedo tener múltiples admins?**
No, solo un admin por gym. Si necesitas receptionist que maneje clientes, existe el rol `receptionist`.

**¿Qué pasa si un cliente intenta registrarse sin código?**
No puede, la página de signup bloquea sin código válido.

**¿Qué pasa si código expira?**
No se puede usar. Admin puede generar uno nuevo.

**¿El cliente puede cambiar su propio status?**
No, RLS lo bloquea. Solo el admin puede.

**¿Qué pasa si el admin se equivoca y aprueba a alguien?**
Puede ir a /admin/clients y cambiar el status manualmente.

**¿Puedo ver la actividad del cliente en tiempo real?**
Sí, en `/admin/clients` ves última sesión de cada uno.

---

## Próximos Pasos (Opcionales)

- [ ] Dashboard de analytics para el admin
- [ ] Notificaciones cuando se registre nuevo cliente
- [ ] Sistema de descuentos/planes personalizados
- [ ] Exportar datos de clientes
- [ ] Acceso para receptionist
