# Flujo del Primer Login de Admin

## Vision General

El primer admin (coach/dueno del gym) necesita un proceso de setup especial y seguro. Este documento describe el flujo profesional completo.

---

## Flujo Actual

```
Usuario va a /auth/admin-setup
        |
        v
Ingresa codigo secreto (GYMCOACH2024)
        |
        v
Crea email y contrasena
        |
        v
Se registra con rol 'admin'
        |
        v
Redirige a /admin/dashboard
```

### Problemas del Flujo Actual
1. Codigo secreto es estatico y conocido
2. No hay verificacion de que ya exista un admin
3. No hay onboarding para el admin
4. No se configura el gym/negocio

---

## Flujo Profesional Propuesto

### Fase 1: Verificacion de Elegibilidad

```
Usuario va a /auth/admin-setup
        |
        v
Sistema verifica si ya existe un admin
        |
    [Si existe]---> Redirige a /auth/login con mensaje
        |           "Este gym ya tiene administrador"
        v
    [No existe]
        |
        v
Muestra formulario de setup
```

### Fase 2: Creacion de Cuenta Admin

```
Formulario de Setup:
+------------------------------------------+
|                                          |
|  [Logo GymCoach]                         |
|                                          |
|  Configuracion Inicial                   |
|  -----------------------------------     |
|                                          |
|  Nombre del Gym: [________________]      |
|  Tu Nombre:      [________________]      |
|  Email:          [________________]      |
|  Contrasena:     [________________]      |
|  Confirmar:      [________________]      |
|                                          |
|  Codigo de Activacion: [__________]      |
|  (Proporcionado al comprar la licencia)  |
|                                          |
|  [ Crear Mi Cuenta de Coach ]            |
|                                          |
+------------------------------------------+
```

### Fase 3: Onboarding del Coach

Despues del registro exitoso, el coach pasa por un onboarding de 4 pasos:

#### Paso 1: Configurar Perfil
```
+------------------------------------------+
|  Paso 1 de 4: Tu Perfil                  |
|  -----------------------------------     |
|                                          |
|  [Subir Foto de Perfil]                  |
|                                          |
|  Especialidad:                           |
|  [ ] Fuerza                              |
|  [ ] Hipertrofia                         |
|  [ ] Perdida de peso                     |
|  [ ] Fitness general                     |
|                                          |
|  Anos de experiencia: [___]              |
|                                          |
|  Bio corta:                              |
|  [_________________________________]     |
|                                          |
|  [ Siguiente -> ]                        |
+------------------------------------------+
```

#### Paso 2: Configurar Planes de Membresia
```
+------------------------------------------+
|  Paso 2 de 4: Tus Planes                 |
|  -----------------------------------     |
|                                          |
|  Agrega los planes que ofreces:          |
|                                          |
|  Plan 1:                                 |
|  Nombre: [Plan Basico___]                |
|  Precio: [$________] / mes               |
|  Descripcion: [__________________]       |
|                                          |
|  [+ Agregar otro plan]                   |
|                                          |
|  [ <- Atras ]  [ Siguiente -> ]          |
+------------------------------------------+
```

#### Paso 3: Crear Primera Rutina
```
+------------------------------------------+
|  Paso 3 de 4: Tu Primera Rutina          |
|  -----------------------------------     |
|                                          |
|  Crea una rutina de ejemplo:             |
|                                          |
|  Nombre: [Rutina Full Body___]           |
|  Dias por semana: [3]                    |
|  Duracion: [4] semanas                   |
|                                          |
|  (Podras editarla despues)               |
|                                          |
|  [ <- Atras ]  [ Siguiente -> ]          |
|                                          |
|  [ Saltar por ahora ]                    |
+------------------------------------------+
```

#### Paso 4: Invitar Primer Cliente
```
+------------------------------------------+
|  Paso 4 de 4: Tu Primer Cliente          |
|  -----------------------------------     |
|                                          |
|  Genera un codigo de invitacion:         |
|                                          |
|  Email del cliente (opcional):           |
|  [_______________________________]       |
|                                          |
|  [Generar Codigo]                        |
|                                          |
|  Codigo: ABC123XY                        |
|  [Copiar] [Enviar por WhatsApp]          |
|                                          |
|  [ <- Atras ]  [ Completar Setup ]       |
|                                          |
|  [ Saltar por ahora ]                    |
+------------------------------------------+
```

### Fase 4: Dashboard Listo

```
+------------------------------------------+
|  Bienvenido, Coach Juan!                 |
|  -----------------------------------     |
|                                          |
|  Tu gym esta configurado.                |
|                                          |
|  Proximos pasos:                         |
|  [x] Crear cuenta                        |
|  [x] Configurar perfil                   |
|  [ ] Crear tu primera rutina completa    |
|  [ ] Invitar a tu primer cliente         |
|                                          |
|  [Ir al Dashboard]                       |
|                                          |
+------------------------------------------+
```

---

## Seguridad del Primer Login

### Metodo 1: Codigo de Activacion (Actual)
- Codigo estatico configurable via ENV
- Simple pero menos seguro

### Metodo 2: Codigo Unico por Instalacion (Recomendado)
```sql
-- Al desplegar, se genera un codigo unico
INSERT INTO admin_setup (setup_code, is_used)
VALUES (generate_random_code(), false);

-- Solo se puede usar una vez
-- Despues de usarlo, queda marcado como usado
```

### Metodo 3: Token de Email (Mas Seguro)
1. Admin ingresa email
2. Sistema envia link de activacion
3. Click en link completa el setup

---

## Implementacion Tecnica

### Base de Datos

```sql
-- Tabla de configuracion del gym
CREATE TABLE public.gym_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  admin_id uuid REFERENCES auth.users(id),
  timezone text DEFAULT 'America/Mexico_City',
  currency text DEFAULT 'MXN',
  created_at timestamptz DEFAULT now(),
  setup_completed boolean DEFAULT false
);

-- Tabla de setup (ya existe, mejorar)
ALTER TABLE public.admin_setup
ADD COLUMN gym_name text,
ADD COLUMN admin_name text,
ADD COLUMN setup_completed_at timestamptz;
```

### Archivos Necesarios

```
app/auth/admin-setup/page.tsx (mejorar)
app/auth/admin-setup/setup-form.tsx
app/admin/onboarding/page.tsx (nuevo)
app/admin/onboarding/step-1-profile.tsx
app/admin/onboarding/step-2-plans.tsx
app/admin/onboarding/step-3-routine.tsx
app/admin/onboarding/step-4-invite.tsx
app/actions/admin-setup.ts (nuevo)
```

### Middleware

```typescript
// Verificar si el admin completo el onboarding
if (role === 'admin' && !gymSettings.setup_completed) {
  redirect('/admin/onboarding')
}
```

---

## Variables de Entorno

```env
# Codigo de activacion para primer admin
ADMIN_SETUP_CODE=GYMCOACH2024

# O usar codigo dinamico generado en DB
USE_DYNAMIC_SETUP_CODE=true
```

---

## Flujo Completo en Diagrama

```
                    +------------------+
                    | Usuario accede a |
                    | /auth/admin-setup|
                    +--------+---------+
                             |
                    +--------v---------+
                    | Ya existe admin? |
                    +--------+---------+
                             |
            +----------------+----------------+
            |                                 |
        [SI]                              [NO]
            |                                 |
    +-------v-------+               +---------v---------+
    | Redirigir a   |               | Mostrar form de   |
    | /auth/login   |               | setup con codigo  |
    +---------------+               +---------+---------+
                                              |
                                    +---------v---------+
                                    | Codigo valido?    |
                                    +---------+---------+
                                              |
                            +-----------------+-----------------+
                            |                                   |
                        [NO]                                [SI]
                            |                                   |
                    +-------v-------+               +-----------v-----------+
                    | Mostrar error |               | Crear cuenta admin    |
                    | "Codigo       |               | Marcar codigo usado   |
                    |  invalido"    |               +-----------+-----------+
                    +---------------+                           |
                                                    +-----------v-----------+
                                                    | Redirigir a           |
                                                    | /admin/onboarding     |
                                                    +-----------+-----------+
                                                                |
                                                    +-----------v-----------+
                                                    | Completar 4 pasos     |
                                                    | de configuracion      |
                                                    +-----------+-----------+
                                                                |
                                                    +-----------v-----------+
                                                    | Marcar setup_completed|
                                                    | Ir a /admin/dashboard |
                                                    +-----------------------+
```

---

## Checklist de Implementacion

- [ ] Crear tabla `gym_settings`
- [ ] Mejorar `/auth/admin-setup` con verificacion de admin existente
- [ ] Crear `/admin/onboarding` con 4 pasos
- [ ] Actualizar middleware para verificar `setup_completed`
- [ ] Agregar `ADMIN_SETUP_CODE` a variables de entorno
- [ ] Crear acciones de server para el setup
- [ ] Tests de flujo completo

---

## Consideraciones de UX

1. **Progreso visible**: Mostrar barra de progreso en onboarding
2. **Poder saltar**: Permitir saltar pasos no esenciales
3. **Guardar progreso**: Si cierra, puede continuar donde quedo
4. **Ayuda contextual**: Tooltips explicando cada campo
5. **Validacion en tiempo real**: Feedback inmediato de errores
6. **Celebracion al final**: Animacion/confetti al completar

---

## Mensaje de Bienvenida

Al completar el setup, mostrar:

```
Felicidades, Coach [Nombre]!

Tu cuenta de GymCoach esta lista.

Ahora puedes:
- Crear rutinas personalizadas
- Invitar a tus clientes
- Trackear su progreso
- Ver estadisticas en tiempo real

[Empezar a usar GymCoach]
```
