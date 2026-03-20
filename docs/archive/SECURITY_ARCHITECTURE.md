# Arquitectura de Seguridad - GymCoach

## Capas de Seguridad

```
┌─────────────────────────────────────────────────┐
│ 1. NIVEL APLICACIÓN (Client-side)              │
│    - Validación de código de invitación        │
│    - Redirección basada en rol                 │
│    - UI escondida si sin permisos              │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 2. NIVEL MIDDLEWARE (Next.js)                  │
│    - Validación de sesión                      │
│    - Redirección de rutas protegidas           │
│    - Verificación de roles básica              │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 3. NIVEL API (Server Actions)                  │
│    - Verificación de permisos del servidor     │
│    - Validación de datos                       │
│    - Llamadas a funciones Supabase SECURITY... │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 4. NIVEL BASE DE DATOS (RLS)                   │
│    - Row Level Security en Postgres            │
│    - Políticas de acceso por rol y estado      │
│    - Funciones SECURITY DEFINER                │
└─────────────────────────────────────────────────┘
```

---

## 1. Autenticación

### Admin Setup (Primera vez)

```typescript
// app/auth/admin-setup/page.tsx
if (secretKey !== ADMIN_SECRET) {
  throw new Error('Invalid secret')
}

// Verificar que no hay otro admin
const adminCount = await supabase
  .from('profiles')
  .select('*', { count: 'exact' })
  .eq('role', 'admin')

if (adminCount > 0) {
  throw new Error('Admin already exists')
}

// Crear usuario y asignar rol
const { data: user } = await supabase.auth.signUp({...})
await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', user.id)
```

### Client Signup con Código de Invitación

```typescript
// app/auth/sign-up/page.tsx
const { valid, invitation } = await validateInvitationCode(code)

if (!valid) {
  throw new Error('Invalid or expired code')
}

// Si el código tiene email específico
if (invitation.email && invitation.email !== inputEmail) {
  throw new Error('Email does not match code')
}

// Crear usuario
const { data: user } = await supabase.auth.signUp({
  email: inputEmail,
  password: password,
  options: {
    data: { role: 'client' }
  }
})

// Marcar código como usado
await useInvitationCode(code, user.id)
```

---

## 2. Autorización

### Middleware de Rutas

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rutas públicas
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Rutas protegidas
  if (pathname.startsWith('/admin')) {
    // Verificar sesión
    const session = getSession()
    if (!session) {
      return NextResponse.redirect('/auth/login')
    }

    // Verificar rol
    const profile = await getProfile(session.user.id)
    if (profile.role !== 'admin') {
      return NextResponse.redirect('/client/dashboard')
    }
  }

  if (pathname.startsWith('/client')) {
    const session = getSession()
    if (!session) {
      return NextResponse.redirect('/auth/login')
    }

    // Verificar que cliente está aprobado y activo
    const client = await getClientRecord(session.user.id)
    if (!client.admin_approved || client.status !== 'active') {
      return NextResponse.redirect('/auth/login')
    }
  }
}
```

### Server Actions

```typescript
// app/actions/payments.ts
export async function createPayment(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verificar usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // 2. Verificar que es admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can create payments')
  }

  // 3. Crear pago (RLS lo protege también)
  const { error } = await supabase
    .from('payments')
    .insert({
      client_id: formData.get('client_id'),
      amount: parseFloat(formData.get('amount')),
      // ...
    })

  if (error) {
    throw new Error(error.message)
  }

  // 4. Revalidate cache
  revalidatePath('/admin/payments')
}
```

---

## 3. Row Level Security (RLS) en Postgres

### Tabla: profiles

```sql
-- Solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins pueden ver todos
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Solo pueden actualizar el suyo
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Tabla: exercise_logs

```sql
-- Cliente debe estar aprobado Y activo para crear logs
CREATE POLICY "Clients can insert exercise logs"
  ON public.exercise_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_active_subscription(auth.uid())
  );

-- Cliente solo ve sus propios logs
CREATE POLICY "Clients can view own exercise logs"
  ON public.exercise_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admin ve todos
CREATE POLICY "Admins can view all exercise logs"
  ON public.exercise_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );
```

### Tabla: invitation_codes

```sql
-- Solo el admin que la creó puede verla
CREATE POLICY "Admins can view codes they created"
  ON public.invitation_codes
  FOR ALL
  USING (
    auth.uid() = created_by
    AND auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );
```

### Tabla: payments

```sql
-- Cliente solo ve sus propios pagos
CREATE POLICY "Clients can view own payments"
  ON public.payments
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Admin ve todos
CREATE POLICY "Admins can view all payments"
  ON public.payments
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Solo admin puede crear
CREATE POLICY "Only admins can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );
```

---

## 4. Función de Validación de Acceso

```sql
-- Verifica si un cliente tiene suscripción activa
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_client_status text;
  v_is_approved boolean;
  v_membership_end date;
BEGIN
  SELECT c.status, c.admin_approved, c.membership_end
  FROM public.clients c
  WHERE c.user_id = p_user_id
  INTO v_client_status, v_is_approved, v_membership_end;
  
  RETURN COALESCE(v_is_approved, false) 
    AND v_client_status = 'active'
    AND COALESCE(v_membership_end >= CURRENT_DATE, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Flujo de Seguridad Completo

### Cuando cliente intenta crear un workout:

```
┌─────────────────────────────────────────┐
│ 1. CLIENT CLICK "INICIAR ENTRENAMIENTO" │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 2. LLAMAR SERVER ACTION                 │
│    createWorkoutSession()               │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 3. SERVER VERIFICA:                     │
│    ✓ getUser() existe?                  │
│    ✓ Cliente aprobado?                  │
│    ✓ Pago válido?                       │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 4. SUPABASE VERIFICA RLS:               │
│    ✓ auth.uid() = user_id?              │
│    ✓ has_active_subscription()?         │
│    ✓ Política permite INSERT?           │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 5. Si TODAS fallan → ERROR              │
│    Si TODAS pasan → CREAR WORKOUT       │
└─────────────────────────────────────────┘
```

---

## 6. Protección Contra Ataques

### SQL Injection
- ✓ Supabase usa consultas parametrizadas
- ✓ RLS bloquea queries maliciosas
- ✓ No concatenamos strings en SQL

### Acceso no autorizado
- ✓ RLS bloquea lectura de datos ajenos
- ✓ Middleware protege rutas
- ✓ Server actions verifican permisos

### Brute force en login
- ✓ Supabase Auth tiene rate limiting
- ✓ Contraseñas hasheadas con bcrypt

### Códigos de invitación duplicados
- ✓ Código UNIQUE en BD
- ✓ Expiran automáticamente
- ✓ Validación en cliente y servidor

### Cambio de estatus sin permiso
- ✓ RLS bloquea UPDATE sin admin
- ✓ Función SECURITY DEFINER valida

---

## 7. Variables de Entorno Críticas

```env
# NUNCA cambiar estos en producción sin cuidado
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_ADMIN_SECRET=GYMCOACH2024  # CAMBIAR ESTO

# Cookies de sesión seguras
COOKIE_SECURE=true          # HTTPS only
COOKIE_SAMESITE=Strict      # CSRF protection
```

---

## 8. Checklist de Seguridad

- [ ] RLS habilitado en todas las tablas
- [ ] Códigos de invitación con expiración
- [ ] Admin setup solo una vez
- [ ] Middleware protege rutas
- [ ] Server actions verifican permisos
- [ ] No hay datos en localStorage
- [ ] HTTPS en producción
- [ ] Rate limiting en auth
- [ ] Logs de cambios administrativos
- [ ] Backups regulares

---

## Conclusión

GymCoach tiene seguridad en 4 niveles:
1. **Aplicación** - Validaciones UI
2. **Middleware** - Redirecciones
3. **API** - Verificaciones de servidor
4. **Base de datos** - RLS como última línea

Ningún cliente malicioso puede:
- Ver datos de otro cliente
- Crear workouts sin estar aprobado
- Usar códigos expirados
- Cambiar su propio estatus
- Acceder sin sesión válida

La combinación de estos 4 niveles hace que GymCoach sea muy seguro. 🔒
