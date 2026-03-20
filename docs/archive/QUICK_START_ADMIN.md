# Guía Rápida para el Coach (Admin)

## Paso 1: Crear tu cuenta de Admin (Una sola vez)

1. Abre: `https://tu-app.com/auth/admin-setup`
2. Ingresa la clave secreta: `GYMCOACH2024`
3. Tu email y contraseña
4. Click "Crear Cuenta Admin"
5. ✅ Ya eres admin!

---

## Paso 2: Generar Código de Invitación para tu Cliente

1. Abre tu dashboard: `/admin/dashboard`
2. Click en "Invitaciones" en el menú lateral
3. Click "Crear Nuevo Código"
4. (Opcional) Ingresa el email del cliente
5. (Opcional) Cambia duración (default: 30 días)
6. Click "Crear Código"
7. Copy el código (ej: `ABCD1234`)
8. Comparte con el cliente vía WhatsApp/Email

---

## Paso 3: Cliente se Registra

El cliente:
1. Abre: `/auth/sign-up`
2. Ingresa el código que le diste
3. Click "Validar Código"
4. Completa email y contraseña
5. Click "Crear Cuenta"
6. ⏳ Espera aprobación tuya

---

## Paso 4: Aprobar Cliente (Dentro de la App)

1. Abre: `/admin/clients/pending`
2. Ves el cliente nuevo
3. Click "Aprobar"
4. ✅ Cliente ya puede acceder!

---

## Paso 5: Registrar Pago

1. Abre: `/admin/payments/new`
2. Selecciona el cliente
3. Ingresa:
   - Monto
   - Plan (Básico, Pro, Elite, etc)
   - Fecha de inicio
4. Click "Guardar Pago"
5. ✅ Cliente tiene acceso por 30 días

---

## Paso 6: Si Cliente No Paga

1. Abre: `/admin/clients`
2. Busca al cliente
3. Click en su nombre
4. Cambiar status a "suspended"
5. ✅ Cliente no puede crear workouts

---

## Resumen de URLs del Admin

| Página | URL | Qué Hacer |
|--------|-----|-----------|
| Dashboard | `/admin/dashboard` | Ver resumen |
| Clientes | `/admin/clients` | Ver todos los clientes |
| Clientes Pendientes | `/admin/clients/pending` | Aprobar nuevos |
| Invitaciones | `/admin/invitations` | Generar códigos |
| Pagos | `/admin/payments` | Registrar pagos |
| Nueva Rutina | `/admin/routines/new` | Crear rutinas |
| Builder de Rutina | `/admin/routines/builder` | Editor visual |

---

## Recordar

- 🔑 Solo tú eres admin (no hay otro)
- 📋 Genera un código por cliente
- ✅ Aprueba dentro de la app
- 💳 Registra cada pago
- 🚫 Si no pagan, suspende el acceso

---

**Pregunta:** ¿Qué pasa si olvido una contraseña?
**Respuesta:** Click en "¿Olvidaste tu contraseña?" en login

**Pregunta:** ¿Puedo tener otro admin?
**Respuesta:** No, solo uno por gym

**Pregunta:** ¿El cliente ve que está pendiente?
**Respuesta:** No, la app le dice que espere aprobación

