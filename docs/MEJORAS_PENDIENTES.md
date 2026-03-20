# GymCoach – Mejoras pendientes (enfoque coach/asesorados)

## Resumen ejecutivo

La app está orientada a **coaches independientes** que gestionan **asesorados**, cobran por **asesorías** y hacen seguimiento de progreso. Los asesorados pueden entrenar en cualquier gym; la membresía del gym es aparte.

---

## DEBE MEJORARSE (crítico)

### 1. ~~Sincronizar rutina asignada~~ ✅ RESUELTO

**Solución implementada:** Workout y dashboard ahora obtienen la rutina desde `client_routines` (activa) cuando `assigned_routine_id` no existe. La fuente de verdad es `client_routines`.

### 2. ~~Dashboard del coach: vista `clients_summary`~~ ✅ RESUELTO

**Solución implementada:** `coach-overview` carga asesorados desde `clients` directamente, con `plan_name` y `assigned_routine_id` resueltos desde tablas relacionadas.

### 3. ~~Recuperación de contraseña~~ ✅ RESUELTO

**Implementado:** `/auth/forgot-password`, `/auth/callback`, `/auth/reset-password`, enlace en login. Configurar Redirect URLs en Supabase Dashboard (Auth > URL Configuration).


---

## PUEDE MEJORARSE (importante)

### 4. ~~Formulario para registrar medidas~~ ✅ RESUELTO

**Implementado:** Formulario en `/client/measurements` con diálogo para registrar peso, grasa, cintura, cadera, pecho, brazo, muslo.

### 5. ~~Ruta `/client/achievements` inexistente~~ ✅ RESUELTO

**Implementado:** Página `/client/achievements` con grid de logros (desbloqueados y bloqueados).

### 6. ~~Persistir preferencia de notificaciones en onboarding~~ ✅ RESUELTO

**Implementado:** `notificationsEnabled` se envía a `completeOnboarding` y se guarda en `profiles.notifications_enabled`. Migración 011 añade la columna.

### 7. ~~Botón "Contactar a mi Coach" en `/suspended`~~ ✅ RESUELTO

**Implementado:** El botón navega a `/messages`.

---

## CONSISTENCIA Y COPY

### 8. ~~Terminología: cliente vs asesorado~~ ✅ RESUELTO

Actualizado en users, invitations, payments, coach-overview.

### 9. ~~Ortografía~~ ✅ RESUELTO

Corregido: Contraseña, Código, Configuración, Regístrate, Iniciar sesión, etc.

---

## PLACEHOLDER / INCOMPLETO

### 10. ~~Configuración del coach (`/admin/settings`)~~ ✅ RESUELTO

**Implementado:** Formulario para nombre/marca, teléfono, horario, moneda, zona horaria.

### 11. Moneda en pagos

**Estado:** Siempre se muestra `$`.

**Propuesta:** Usar `gym_settings.currency` para el símbolo (MXN, USD, etc.).

---

## INCONSISTENCIAS TÉCNICAS

### 12. Fuente de rutina del asesorado

| Flujo | Usa | Estado |
|-------|-----|--------|
| `/client/routines` | `client_routines` | OK |
| `/client/workout/start` | `client_routines` (fallback si no assigned_routine_id) | OK |
| `/client/dashboard` | `client_routines` (fallback si no assigned_routine_id) | OK |
| Admin: asignar rutina | Inserta en `client_routines` | OK |

---

## MEJORAS OPCIONALES

- **Realtime en mensajes:** Usar Supabase Realtime en lugar de polling.
- **Receptionist:** Si no se usa, eliminar el rol y las rutas.
- **Logros (achievements):** Página dedicada o sección en dashboard.

---

## Orden sugerido de implementación

1. ~~Fix #1~~ – ✅ Hecho (client_routines como fuente de verdad).
2. ~~Fix #2~~ – ✅ Hecho (coach-overview usa clients).
3. ~~**Fix #3**~~ – ✅ Recuperación de contraseña.
4. Fix #4 – Formulario de medidas.
5. Fix #5 – Crear `/client/achievements` o ajustar enlaces.
6. Fix #8 – Unificar terminología asesorado.
7. Fix #10 – Implementar configuración básica.
