# GymCoach - Documentacion Completa

## Indice de Documentos

---

## Guias de Inicio Rapido

| Documento | Descripcion | Para |
|-----------|-------------|------|
| [README.md](./README.md) | Guia general completa | Todos |
| [ADMIN_FIRST_LOGIN.md](./ADMIN_FIRST_LOGIN.md) | Flujo profesional de setup inicial | Coach |

---

## Funcionalidades Core

| Documento | Descripcion | Para |
|-----------|-------------|------|
| [ROUTINES.md](./ROUTINES.md) | Sistema de rutinas y asignacion | Coach |
| [PROGRESSION.md](./PROGRESSION.md) | Sistema de progresion de carga | Coach/Cliente |

---

## Arquitectura y Tecnico

| Documento | Descripcion | Para |
|-----------|-------------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura tecnica completa | Desarrolladores |

---

## Planes y Roadmap

| Documento | Descripcion | Para |
|-----------|-------------|------|
| [PLAN_MEJORAS_PREMIUM.md](./PLAN_MEJORAS_PREMIUM.md) | Plan de mejoras Fase 2 Premium | Desarrolladores |

---

## Estado del Proyecto

### Fase 1: Core (COMPLETADA)

| Feature | Status |
|---------|--------|
| Autenticacion con roles | Completado |
| Sistema de invitaciones | Completado |
| CRUD de rutinas | Completado |
| Asignacion de rutinas | Completado |
| Tracking de ejercicios | Completado |
| Sistema de XP/Nivel | Completado |
| Achievements | Completado |
| PRs automaticos | Completado |
| Dark/Light mode | Completado |
| PWA | Completado |

### Fase 2: Premium (PENDIENTE)

| Feature | Prioridad | Esfuerzo | Status |
|---------|-----------|----------|--------|
| Dashboard Coach mejorado | 1 | Medio | Pendiente |
| Perfil detallado cliente | 2 | Alto | Pendiente |
| Graficas de progreso | 3 | Medio | Pendiente |
| Medidas corporales | 4 | Bajo | Pendiente |
| Comparador de fotos | 5 | Medio | Pendiente |
| Calendario | 6 | Medio | Pendiente |
| Notas del coach | 7 | Bajo | Pendiente |
| Mensajeria | 8 | Alto | Pendiente |

Ver detalles completos en [PLAN_MEJORAS_PREMIUM.md](./PLAN_MEJORAS_PREMIUM.md)

---

## Flujos Principales

### Flujo del Admin/Coach

```
1. Setup Inicial
   /auth/admin-setup -> Crear cuenta con codigo
   
2. Onboarding (propuesto)
   /admin/onboarding -> Configurar gym, planes, primera rutina
   
3. Operacion Diaria
   /admin/dashboard -> Ver estado de asesorados
   /admin/invitations -> Generar codigos
   /admin/clients/pending -> Aprobar nuevos
   /admin/routines -> Crear/editar rutinas
   /admin/clients/[id]/assign-routine -> Asignar rutina
   /admin/payments -> Registrar pagos
```

### Flujo del Cliente/Asesorado

```
1. Registro
   /auth/sign-up -> Con codigo de invitacion
   
2. Onboarding
   /onboarding -> 4 pasos de configuracion
   
3. Operacion Diaria
   /client/dashboard -> Ver stats y proxima sesion
   /client/routines -> Ver rutina asignada
   /client/workout/start -> Iniciar entrenamiento
   /client/progress -> Ver graficas
   /client/profile -> Editar perfil
```

---

## Base de Datos - Tablas Clave

| Tabla | Proposito |
|-------|-----------|
| `profiles` | Usuarios, roles, gamificacion |
| `clients` | Clientes con status y membresia |
| `routines` | Plantillas de rutinas |
| `routine_days` | Dias de cada rutina |
| `routine_exercises` | Ejercicios por dia |
| `exercises` | Biblioteca de ejercicios |
| `client_routines` | Asignacion rutina-cliente |
| `exercise_logs` | Registro de sets ejecutados |
| `personal_records` | PRs por ejercicio |
| `workout_sessions` | Sesiones completadas |
| `achievements` | Logros disponibles |
| `user_achievements` | Logros desbloqueados |
| `invitation_codes` | Codigos de invitacion |
| `body_measurements` | Medidas corporales |
| `payments` | Pagos registrados |

---

## Variables de Entorno

```env
# Supabase (automatico)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin Setup
ADMIN_SETUP_CODE=GYMCOACH2024
```

---

## Rutas Principales

### Admin
```
/admin/dashboard         Panel principal
/admin/clients           Lista de clientes
/admin/clients/[id]      Detalle de cliente
/admin/clients/pending   Aprobar nuevos
/admin/routines          Lista de rutinas
/admin/routines/new      Crear rutina
/admin/routines/[id]     Editar rutina
/admin/payments          Historial de pagos
/admin/invitations       Codigos de invitacion
/admin/users             Gestionar usuarios
/admin/settings          Configuracion
```

### Client
```
/client/dashboard        Panel principal
/client/routines         Mi rutina asignada
/client/workout/start    Iniciar entrenamiento
/client/progress         Mi progreso
/client/profile          Mi perfil
```

### Auth
```
/auth/login              Iniciar sesion
/auth/sign-up            Registrarse (con codigo)
/auth/admin-setup        Setup inicial admin
/onboarding              Onboarding cliente
/suspended               Cuenta suspendida
```

---

## Quick Reference

### Codigos Importantes
- **Admin Setup Code:** `GYMCOACH2024`
- **Roles:** `admin`, `client`, `receptionist`
- **Status Cliente:** `active`, `suspended`, `expired`

### Gamificacion
- **XP por workout:** 50
- **XP por PR:** 100
- **XP por nivel:** 100
- **Streak bonus:** 7 dias = 200 XP

---

## Contacto

Para soporte o preguntas, revisar la documentacion completa en `/docs/`.

---

**Version:** 1.0
**Ultima actualizacion:** Marzo 2026
