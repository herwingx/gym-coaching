# GymCoach Premium - Documentación Completa

**Tabla de Contenidos**
- [Visión General](#visión-general)
- [Guía del Coach/Admin](#guía-del-coachadmin)
- [Guía del Asesorado/Cliente](#guía-del-asesoradocliente)
- [Sistema de Rutinas](#sistema-de-rutinas)
- [Progresión de Carga](#progresión-de-carga)
- [Gamificación](#gamificación)
- [Seguridad y Acceso](#seguridad-y-acceso)

---

## Visión General

GymCoach Premium es una plataforma revolucionaria de coaching de fitness que permite a un entrenador personal (coach) administrar y hacer seguimiento de múltiples clientes de forma inteligente.

**Características Principales:**
- ✅ Asignación de rutinas personalizadas
- ✅ Tracking automático de progresión de carga
- ✅ Sistema de gamificación con logros y niveles
- ✅ Dashboard inteligente que sugiere próximas sesiones
- ✅ Control de acceso por suscripción
- ✅ Dark/Light mode con tema premium
- ✅ Aplicación PWA (funciona offline)

---

## Guía del Coach/Admin

### Paso 1: Crear tu Cuenta (Primera Vez)

1. Ve a `https://tu-app/auth/admin-setup`
2. Ingresa el código secreto: `GYMCOACH2024`
3. Completa el formulario con tu email y contraseña
4. ¡Listo! Serás el admin principal del gym

**Nota:** Esta ruta solo funciona UNA SOLA VEZ. Después se bloquea automáticamente.

### Paso 2: Invitar Asesorados

1. Entra al dashboard admin en `/admin/dashboard`
2. Ve a **"Invitaciones"** en el sidebar
3. Click en **"Generar Nuevo Código"**
4. Configura:
   - **Email del asesorado** (opcional)
   - **Fecha de expiración** (cuando expire el código)
   - **Máximo de usos** (normalmente 1)
5. Click en **"Generar"**
6. **Copia el código** y comparte con tu asesorado por WhatsApp, email, etc.

### Paso 3: Aprobar Asesorados

1. En el sidebar, ve a **"Clientes"** > **"Pendientes"**
2. Verás una lista de clientes que se registraron
3. Revisa sus datos y haz click en **"Aprobar"**
4. El cliente ahora puede acceder a la app

### Paso 4: Crear Rutinas

1. Ve a **"Rutinas"** en el sidebar
2. Click en **"Crear Rutina"**
3. Completa:
   - **Nombre** (ej: "Hipertrofia Push/Pull/Legs")
   - **Descripción** (objetivos de la rutina)
   - **Duración** (semanas)
   - **Días por semana** (cuántos entrenamientos)
4. Para cada día:
   - Click en **"Agregar Día"**
   - Selecciona si es un "Día de Entrenamie nto" o "Día de Descanso"
   - Si es día de entrenamiento:
     - Agrega ejercicios
     - Define sets, reps, peso base
     - Define tiempo de descanso

### Paso 5: Asignar Rutina a un Asesorado

1. Ve a **"Clientes"** en el sidebar
2. Click en el cliente que quieres
3. Click en **"Asignar Rutina"**
4. Selecciona la rutina de la lista
5. (Opcional) Agrega notas personalizadas
6. Click en **"Asignar"**

El cliente verá la rutina en su dashboard y podrá empezar inmediatamente.

### Paso 6: Registrar Pagos

1. Ve a **"Pagos"** en el sidebar
2. Click en **"Registrar Pago"**
3. Selecciona:
   - **Cliente**
   - **Plan** (Básico, Pro, Elite, etc.)
   - **Monto pagado**
   - **Método de pago**
4. Click en **"Guardar"**

El cliente ahora tiene acceso activo por 30 días (configurable).

### Paso 7: Monitorear Progreso

1. Ve a **"Clientes"** > selecciona cliente
2. Verás:
   - **Progreso de la rutina actual** (en qué semana va)
   - **Histórico de entrenamientos** (qué días entrenó)
   - **PRs (Récords Personales)** desbloqueados
   - **XP acumulado** y **nivel actual**
   - **Últimos workouts** con peso usado

### Paso 8: Suspender Asesorado

Si el cliente no paga:

1. Ve a **"Clientes"** > selecciona cliente
2. Click en **"Cambiar Estado"**
3. Selecciona **"Suspendido"**
4. El cliente verá la pantalla de "Cuenta Suspendida" al intentar entrar

---

## Guía del Asesorado/Cliente

### Paso 1: Registrarse

1. Recibe un código de invitación de tu coach (ej: `ABC123XYZ`)
2. Ve a `https://tu-app/auth/sign-up`
3. Ingresa:
   - **Código de invitación**
   - **Email**
   - **Contraseña**
4. Click en **"Crear Cuenta"**
5. Completa el **onboarding**:
   - Tu objetivo fitness (perder peso, ganar músculo, etc.)
   - Tu experiencia (principiante, intermedio, avanzado)
   - Subir una foto de perfil (opcional)

**¡Listo!** Ya estás registrado. Tu coach debe aprobarte para empezar.

### Paso 2: Esperar Aprobación

Después de registrarte, verás un mensaje de "Esperando aprobación".

Tu coach recibirá una notificación y te aprobará. Una vez aprobado, tendrás acceso completo.

### Paso 3: Ver Tu Rutina

1. En el sidebar, ve a **"Mi Rutina"**
2. Verás:
   - **Nombre de la rutina**
   - **Tu progreso** (en qué semana vas)
   - **Próxima sesión** (qué día de entrenamiento sigue)
   - **Ejercicios de hoy** (si es día de entrenamiento)

### Paso 4: Completar tu Primer Entrenamiento

1. Haz click en **"Comenzar Entrenamiento"**
2. Verás todos los ejercicios del día
3. Para cada ejercicio:
   - **Calienta** (sets de calentamiento)
   - **Realiza sets de trabajo** registrando:
     - **Peso utilizado**
     - **Reps completadas**
     - **RPE (Esfuerzo percibido)** 1-10
   - **Descansa** entre sets (la app te avisa con timer)
4. La app te avisa si lograste un **PR (nuevo récord)** 🔥
5. Al terminar, click en **"Finalizar Entrenamiento"**

### Paso 5: Ver Tu Progreso

1. Ve a **"Progreso"**
2. Verás:
   - **Tu nivel y XP** actual
   - **Racha de entrenamientos** (días consecutivos)
   - **PRs desbloqueados** (tus mejores números)
   - **Logros ganados** (badges especiales)
   - **Gráficos de volumen** entrenado por semana

### Paso 6: Seguir Sugerencias de Progresión

La app analiza tu última semana de entrenamientos y te sugiere:

- **Aumentar peso** (si has estado consistente)
- **Aumentar reps** (si tu RPE es bajo)
- **Cambiar ejercicio** (si llevas muchas semanas igual)

Estas sugerencias aparecen en tu rutina cada semana.

### Paso 7: Ganar Logros

Completa desafíos y gana logros:

- 🏋️ **First Workout** - Completa tu primer entrenamiento
- ⚡ **Week Warrior** - Entrena 7 veces en una semana
- 🔥 **100 Day Streak** - Mantén racha de 100 días
- 💪 **1RM Beast** - Logra un nuevo PR absoluto
- ⭐ **XP Collector** - Acumula 1000 XP
- 👑 **Level 10** - Alcanza nivel 10

---

## Sistema de Rutinas

### Estructura de una Rutina

```
Rutina: "Hipertrofia Push/Pull/Legs"
├── Duracion: 12 semanas
├── Dias por semana: 6
└── Estructura:
    ├── Dia 1: Push (Pecho, Hombros, Triceps)
    ├── Dia 2: Pull (Espalda, Biceps)
    ├── Dia 3: Legs (Cuadriceps, Femoral, Gluteos)
    ├── Dia 4: Descanso
    ├── Dia 5: Push (Variaciones)
    ├── Dia 6: Pull (Variaciones)
    └── Dia 7: Descanso
```

### Asignación de Rutina

Cuando el coach asigna una rutina:

1. El cliente comienza en **Semana 1, Día 1**
2. Sistema calcula automáticamente el próximo día
3. Cada vez que completa un entrenamiento, avanza al siguiente día
4. Al completar una semana, pasa a la siguiente
5. **Si termina la rutina**, el sistema notifica y sugiere repetir o nueva rutina

### Progresión Inteligente

La app es inteligente sobre progresión:

- Si terminas Semana 6 de 12 el viernes, tu próxima sesión es lunes
- No cuenta días de descanso en la progresión
- Si saltas días (por enfermedad), puedes actualizar manualmente
- Si completas todo un mes consistente, recibe badge especial

---

## Progresión de Carga

### Cómo Funciona

1. **Cada vez que completas un ejercicio**, se registra:
   - Peso
   - Reps
   - RPE (Esfuerzo)
   - Sets

2. **La app detecta automáticamente:**
   - Nuevo PR? (más peso o reps que antes)
   - Consistencia? (mismo peso múltiples veces)
   - Espacio para más? (RPE bajo pero muchas reps)

3. **Cada semana te sugiere:**
   - "Prueba con 75kg (ahora usas 72kg)"
   - "Intenta 15 reps (ahora haces 12)"
   - "Considera cambiar el ángulo del ejercicio"

### Ejemplos Reales

**Ejemplo 1: Progresión de Peso**
```
Semana 1: Bench Press 80kg x 8 reps (RPE 8)
Semana 2: Bench Press 80kg x 9 reps (RPE 7)
Semana 3: Bench Press 80kg x 10 reps (RPE 6)
Semana 4: Sistema sugiere 82.5kg x 8 reps
Resultado: PR desbloqueado! 🔥
```

**Ejemplo 2: Progresión de Volumen**
```
Semana 1: Curl 12kg x 12 reps (RPE 9)
Semana 2: Curl 12kg x 13 reps (RPE 8)
Semana 3: Curl 12kg x 14 reps (RPE 7)
Semana 4: Sistema sugiere 14kg x 12 reps
```

---

## Gamificación

### Sistema de XP

Ganas XP por:
- Completar un entrenamiento: +50 XP
- Terminar sesión sin saltar días: +20 XP bonus
- Lograr un PR: +100 XP
- Mantener racha 7 días: +75 XP
- Desbloquear logro: +Variable XP

### Niveles

```
Nivel 1: 0 XP
Nivel 2: 100 XP
Nivel 3: 250 XP
Nivel 4: 450 XP
Nivel 5: 700 XP
...
Nivel 100: 1,000,000 XP (Leyenda)
```

### Logros/Badges

15 logros diferentes con 4 niveles de rareza:

- 🟩 **Común** (fácil de conseguir)
- 🟦 **Raro** (requiere esfuerzo)
- 🟪 **Épico** (muy desafiante)
- 🟨 **Legendario** (casi imposible)

---

## Seguridad y Acceso

### Control de Acceso por Código

- Solo asesorados con código válido pueden registrarse
- El código expira después de cierta fecha
- Cada código se puede usar máximo X veces
- El coach genera códigos desde el dashboard

### Aprobación Manual

- Después de registrarse, el cliente está en estado "Pendiente"
- El coach recibe notificación
- Coach aprueba desde `/admin/clients/pending`
- Solo clientes aprobados pueden entrenar

### Control de Pagos

- Si no pagó: **Status = Suspended**
- Si pagó: **Status = Active**
- Clientes suspendidos ven pantalla: "Tu suscripción expiró"
- No pueden registrar workouts ni ver progreso

### RLS (Row Level Security)

Todas las tablas tienen políticas:
- Admins ven TODO
- Clientes ven SOLO sus datos
- Nadie puede hackear otra cuenta

---

## Próximas Características

- [ ] Mensajes entre coach y cliente
- [ ] Historial de fotos (antes/después)
- [ ] Integración con Strava/Apple Health
- [ ] Análisis de macros automático
- [ ] Plans de entrenamiento prediseñados
- [ ] API para pulseras fitness

---

¿Preguntas? Contacta al soporte en support@gymcoach.app
