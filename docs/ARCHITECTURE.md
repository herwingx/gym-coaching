# Arquitectura de GymCoach

## Stack Tecnologico

```
+--------------------------------------------------+
|                    FRONTEND                       |
|  Next.js 16 + React 19 + TypeScript              |
|  Tailwind CSS v4 + shadcn/ui                     |
|  Framer Motion + Recharts                        |
+--------------------------------------------------+
                        |
                        | Server Components
                        | Server Actions
                        |
+--------------------------------------------------+
|                   MIDDLEWARE                      |
|  middleware.ts (auth + role check)               |
|  RLS Policies (row-level security)               |
+--------------------------------------------------+
                        |
                        | Supabase Client
                        |
+--------------------------------------------------+
|                    BACKEND                        |
|  Supabase PostgreSQL                             |
|  Supabase Auth                                   |
|  Supabase Storage (fotos)                        |
+--------------------------------------------------+
```

---

## Estructura de Carpetas

```
gymcoach/
├── app/
│   ├── (auth)/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── sign-up/
│   │   │   └── admin-setup/
│   │   ├── onboarding/
│   │   └── suspended/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   │   ├── [clientId]/
│   │   │   └── pending/
│   │   ├── routines/
│   │   │   ├── new/
│   │   │   └── [routineId]/
│   │   ├── exercises/
│   │   ├── payments/
│   │   ├── invitations/
│   │   ├── users/
│   │   └── settings/
│   │
│   ├── client/
│   │   ├── dashboard/
│   │   ├── routines/
│   │   ├── workout/
│   │   │   └── start/
│   │   ├── progress/
│   │   ├── measurements/
│   │   ├── photos/
│   │   ├── calendar/
│   │   └── profile/
│   │
│   ├── messages/
│   │
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── workout.ts
│   │   ├── routine-assignment.ts
│   │   ├── invitations.ts
│   │   └── onboarding.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── admin/              # Admin-specific components
│   ├── client/             # Client-specific components
│   ├── charts/             # Chart components
│   └── shared/             # Shared components
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── auth-utils.ts
│   ├── gamification.ts
│   ├── progression.ts
│   ├── routines.ts
│   └── types.ts
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-pwa.ts
│
├── docs/                   # Documentacion
│
├── scripts/                # SQL migrations
│
└── public/
    ├── manifest.json
    ├── sw.js
    └── icons/
```

---

## Modelos de Datos

### Diagrama ER Simplificado

```
+-------------+       +-------------+       +-------------+
|   profiles  |       |   clients   |       |  routines   |
+-------------+       +-------------+       +-------------+
| id (PK)     |       | id (PK)     |       | id (PK)     |
| role        |<----->| user_id     |       | name        |
| full_name   |       | full_name   |       | description |
| xp_points   |       | status      |       | weeks       |
| level       |       | admin_appro |       | days_per_wk |
| streak_days |       | membership  |       | created_by  |
+-------------+       +-------------+       +-------------+
      |                     |                     |
      |                     |                     |
      v                     v                     v
+-------------+       +-------------+       +-------------+
| exercise_   |       | client_     |       | routine_    |
|    logs     |       |  routines   |       |    days     |
+-------------+       +-------------+       +-------------+
| id (PK)     |       | id (PK)     |       | id (PK)     |
| user_id     |       | client_id   |       | routine_id  |
| exercise_id |       | routine_id  |       | day_number  |
| weight      |       | current_wk  |       | name        |
| reps        |       | current_day |       | is_rest_day |
| rpe         |       | is_active   |       +-------------+
| is_pr       |       +-------------+              |
+-------------+              |                     |
      |                      |                     v
      v                      v              +-------------+
+-------------+       +-------------+       | routine_    |
| personal_   |       | routine_wk_ |       |  exercises  |
|  records    |       |  progress   |       +-------------+
+-------------+       +-------------+       | id (PK)     |
| id (PK)     |       | id (PK)     |       | day_id      |
| user_id     |       | client_rt_id|       | exercise_id |
| exercise_id |       | week_number |       | sets        |
| max_weight  |       | day_number  |       | reps        |
| max_reps    |       | completed_at|       | rest_secs   |
+-------------+       +-------------+       +-------------+
```

### Tablas Principales

| Tabla | Proposito |
|-------|-----------|
| `profiles` | Usuarios con roles y gamificacion |
| `clients` | Clientes del gym con status |
| `routines` | Rutinas creadas por admin |
| `routine_days` | Dias de cada rutina |
| `routine_exercises` | Ejercicios por dia |
| `exercises` | Biblioteca de ejercicios |
| `client_routines` | Asignacion rutina-cliente |
| `exercise_logs` | Registro de sets ejecutados |
| `personal_records` | PRs por ejercicio |
| `workout_sessions` | Sesiones de entrenamiento |
| `achievements` | Logros disponibles |
| `user_achievements` | Logros desbloqueados |
| `invitation_codes` | Codigos de invitacion |
| `body_measurements` | Medidas corporales |
| `payments` | Historial de pagos |

---

## Flujo de Autenticacion

```
                    +------------------+
                    |    Usuario       |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |  /auth/login     |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Supabase Auth    |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  Crear sesion    |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |   middleware.ts  |
                    +--------+---------+
                             |
            +----------------+----------------+
            |                |                |
        [admin]          [client]      [receptionist]
            |                |                |
            v                v                v
    +---------------+ +---------------+ +---------------+
    |/admin/dashbrd| |/client/dashbrd| |/recep/dashbrd |
    +---------------+ +---------------+ +---------------+
```

---

## Row Level Security (RLS)

### Principio
Cada tabla tiene politicas que garantizan que:
1. Los usuarios solo ven SUS propios datos
2. Los admins pueden ver datos de SUS clientes
3. Nadie puede modificar datos de otros

### Ejemplo: exercise_logs

```sql
-- Los usuarios solo ven sus propios logs
CREATE POLICY "Users can view own logs"
  ON public.exercise_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo pueden insertar si tienen suscripcion activa
CREATE POLICY "Users can insert if active"
  ON public.exercise_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND has_active_subscription(auth.uid())
  );
```

---

## Server Actions

### Patron Comun

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function myAction(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verificar autenticacion
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // 2. Verificar permisos
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    throw new Error('Not authorized')
  }
  
  // 3. Ejecutar logica
  const { data, error } = await supabase
    .from('some_table')
    .insert({ ... })
  
  if (error) throw error
  
  // 4. Revalidar cache
  revalidatePath('/admin/something')
  
  return { success: true }
}
```

---

## Sistema de Gamificacion

### XP System

```typescript
const XP_REWARDS = {
  COMPLETE_WORKOUT: 50,
  NEW_PR: 100,
  STREAK_7_DAYS: 200,
  STREAK_30_DAYS: 500,
  FIRST_WORKOUT: 100,
  ACHIEVEMENT_UNLOCKED: 50,
}

// Nivel = floor(XP / 100) + 1
// Nivel 1: 0-99 XP
// Nivel 2: 100-199 XP
// etc.
```

### Achievements

| Achievement | Requirement | XP |
|------------|-------------|-----|
| First Workout | 1 workout | 10 |
| Week Warrior | 7 workouts/week | 50 |
| Hundred Days | 100 day streak | 200 |
| 1RM Beast | New PR | 75 |
| Iron Will | 50 workouts | 150 |

---

## Performance

### Optimizaciones Implementadas

1. **Server Components**: La mayoria de paginas son RSC
2. **Streaming**: Suspense para carga progresiva
3. **Caching**: revalidatePath para invalidacion selectiva
4. **Indexes**: En columnas frecuentemente consultadas
5. **Lazy Loading**: Componentes pesados con dynamic()

### Queries Optimizadas

```sql
-- Indexes clave
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_xp ON profiles(xp_points DESC);
CREATE INDEX idx_exercise_logs_user ON exercise_logs(user_id);
CREATE INDEX idx_exercise_logs_date ON exercise_logs(performed_at DESC);
```

---

## Seguridad

### Capas de Proteccion

```
+------------------------------------------+
| Capa 1: Frontend Validation              |
| - Form validation con Zod                |
| - Sanitizacion de inputs                 |
+------------------------------------------+
                   |
+------------------------------------------+
| Capa 2: Middleware                       |
| - Verificacion de sesion                 |
| - Verificacion de rol                    |
| - Redireccion segun permisos             |
+------------------------------------------+
                   |
+------------------------------------------+
| Capa 3: Server Actions                   |
| - Verificacion de auth                   |
| - Verificacion de ownership              |
| - Parametros sanitizados                 |
+------------------------------------------+
                   |
+------------------------------------------+
| Capa 4: Database (RLS)                   |
| - Politicas por tabla                    |
| - Verificacion a nivel de fila          |
| - Ultima linea de defensa               |
+------------------------------------------+
```

---

## Proximos Pasos Tecnicos

1. **Implementar WebSockets** para mensajeria en tiempo real
2. **Agregar Push Notifications** con Web Push API
3. **Implementar caching** con Redis (Upstash)
4. **Agregar testing** con Vitest + Testing Library
5. **CI/CD** con GitHub Actions
