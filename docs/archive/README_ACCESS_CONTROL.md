# 🏋️ GymCoach Premium - Sistema de Acceso Completo

## Documentación Disponible

Tenemos 4 documentos principales que explican todo:

### 1. **QUICK_START_ADMIN.md** - Para el Coach
   - Cómo registrarse como admin
   - Generar códigos de invitación
   - Aprobar clientes
   - Registrar pagos
   - URLs útiles

### 2. **QUICK_START_CLIENT.md** - Para el Cliente/Asesorado
   - Cómo registrarse con código
   - Completar onboarding
   - Usar la app
   - Preguntas frecuentes

### 3. **ACCESS_CONTROL_GUIDE.md** - Sistema Completo
   - Flujo detallado de 6 pasos
   - Estados del cliente
   - Tabla de matriz de acceso
   - Cambios de estado por pago

### 4. **SECURITY_ARCHITECTURE.md** - Seguridad Técnica
   - 4 capas de seguridad
   - RLS en Postgres
   - Cómo se protege contra ataques
   - Arquitectura de validación

---

## Resumen Rápido: El Flujo

```
┌────────────────────────────────────────────────────────────┐
│ ADMIN SETUP (/auth/admin-setup)                            │
│ Coach ingresa código secreto → Se convierte en admin       │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ GENERAR CÓDIGO (/admin/invitations)                        │
│ Admin crea código único (ej: ABCD1234)                     │
│ Lo comparte vía WhatsApp/Email                             │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ CLIENTE SIGNUP (/auth/sign-up)                             │
│ Cliente ingresa código → Crea email/contraseña             │
│ Status: admin_approved = false (BLOQUEADO)                 │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ ADMIN APRUEBA (/admin/clients/pending)                     │
│ Admin ve solicitud y hace click "Aprobar"                  │
│ Status: admin_approved = true (ACCESO PERMITIDO)           │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ CLIENTE ENTRENA (/client/dashboard)                        │
│ Cliente completa onboarding → Comienza a entrenar          │
│ Sistema tracking de progresión de carga                    │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ ADMIN REGISTRA PAGO (/admin/payments/new)                  │
│ Admin marca: cliente pagó $999 por 30 días                 │
│ Status: membership_end = hoy + 30 días                     │
└────────────────────────────────────────────────────────────┘
```

---

## Tabla de Acceso por Estado

| Estado | Aprobado | Activo | Pago OK | Puede Entrenar |
|--------|----------|--------|---------|---|
| **Nuevo** | ❌ | ❌ | ❌ | ❌ Bloqueado |
| **Aprobado** | ✅ | ✅ | - | ✅ Sí |
| **Aprobado + Pagado** | ✅ | ✅ | ✅ | ✅ Acceso completo |
| **Aprobado + Sin Pagar** | ✅ | ⚠️ Suspended | ❌ | ⚠️ Solo lectura |
| **Rechazado** | ❌ | ❌ | ❌ | ❌ Eliminado |

---

## Seguridad: 4 Capas

```
┌─────────────────────────────────┐
│ CAPA 1: APLICACIÓN (React)      │
│ - Validar códigos               │
│ - Esconder UI sin permiso       │
└─────────────────────────────────┘
         ↓ Enviamos datos
┌─────────────────────────────────┐
│ CAPA 2: MIDDLEWARE (Next.js)    │
│ - Validar sesión               │
│ - Redirigir por rol            │
└─────────────────────────────────┘
         ↓ Si todo OK
┌─────────────────────────────────┐
│ CAPA 3: SERVER (Node.js)        │
│ - Verificar permisos           │
│ - Validar datos                │
└─────────────────────────────────┘
         ↓ Si todo OK
┌─────────────────────────────────┐
│ CAPA 4: BASE DE DATOS (Postgres)│
│ - RLS bloquea acceso           │
│ - Última defensa               │
└─────────────────────────────────┘
```

---

## Preguntas Frecuentes

**P: ¿Qué pasa si alguien intenta registrarse sin código?**
R: No puede, el sistema lo bloquea en `/auth/sign-up`

**P: ¿Qué pasa si intento usar un código expirado?**
R: Error "Código expirado", no puedo registrarme

**P: ¿Qué pasa si copio la DB y intento ver datos de otro cliente?**
R: RLS bloquea la query, Postgres rechaza

**P: ¿Puedo tener 2 admins?**
R: No, solo uno por gym (verificado en DB)

**P: ¿Qué pasa si el cliente cambia su propio status a "active"?**
R: RLS bloquea UPDATE sin ser admin

**P: ¿El cliente ve que está pendiente?**
R: No, la app le dice "Esperando aprobación"

---

## URLs Clave

### Admin
- Setup: `/auth/admin-setup`
- Dashboard: `/admin/dashboard`
- Clientes: `/admin/clients`
- Clientes Pendientes: `/admin/clients/pending`
- Invitaciones: `/admin/invitations`
- Pagos: `/admin/payments`

### Cliente
- Login: `/auth/login`
- Signup: `/auth/sign-up` (con código)
- Dashboard: `/client/dashboard`
- Progreso: `/client/progress`
- Perfil: `/client/profile`

---

## Próximas Funcionalidades (Roadmap)

- [ ] Notificaciones por email cuando se registren clientes
- [ ] Dashboard de analytics para admin
- [ ] Descuentos por múltiples meses
- [ ] Acceso para receptionist
- [ ] Exportar datos de clientes
- [ ] Integración con Stripe para pagos automáticos
- [ ] App móvil nativa

---

## Soporte

Para más detalles:
1. Lee **ACCESS_CONTROL_GUIDE.md** - Explicación detallada
2. Lee **SECURITY_ARCHITECTURE.md** - Cómo funciona la seguridad
3. Lee **QUICK_START_ADMIN.md** - Pasos para el coach
4. Lee **QUICK_START_CLIENT.md** - Pasos para el cliente

---

**Créditos:** Sistema diseñado para ser seguro, escalable y fácil de usar. 🚀

¡Bienvenido a GymCoach Premium!
