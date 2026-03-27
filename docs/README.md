<!--
   GymCoach Premium - Documentación Oficial
   Última actualización: Marzo 2026
-->

# GymCoach

## Índice

- [Visión General](#visión-general)
- [Onboarding y Primeros Pasos](#onboarding-y-primeros-pasos)
- [Guía del Coach/Admin](#guía-del-coachadmin)
- [Guía del Cliente](#guía-del-cliente)
- [Rutinas y Progresión](#rutinas-y-progresión)
- [Gamificación y Logros](#gamificación-y-logros)
- [Seguridad y Acceso](#seguridad-y-acceso)
- [Despliegue y Configuración](#despliegue-y-configuración)
- [Soporte y Roadmap](#soporte-y-roadmap)
- [Resetear DB y CORS (Producción)](docs/RESET_DB_PROD.md)

---

## Visión General

GymCoach es la plataforma definitiva de coaching fitness para gimnasios y entrenadores personales. Ofrece una experiencia premium, mobile-first y gamificada, con tecnología de punta:

- **Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui**
- **Supabase PostgreSQL** con RLS y seguridad avanzada
- **PWA**: Funciona offline, instalación en móvil y desktop
- **Gamificación**: XP, niveles, logros, rachas y dashboard inteligente
- **Control de acceso**: Invitaciones, roles, pagos y suspensión automática
- **UI/UX**: Animaciones, dark/light mode, diseño responsive y accesible

---

## Onboarding y Primeros Pasos

1. **Despliega la app** (ver sección de despliegue)
2. **Crea el primer admin** accediendo a `/auth/admin-setup` (solo una vez)
3. **Configura tu gym y perfil** en el onboarding guiado
4. **Invita a tus clientes** desde el dashboard admin
5. **Aprueba clientes** y asigna rutinas personalizadas

---

## Guía del Coach/Admin

### Crear y Gestionar Clientes

- Genera códigos de invitación únicos y compártelos por email/WhatsApp
- Aprueba o rechaza clientes desde el panel de pendientes
- Asigna rutinas, monitorea progreso, registra pagos y suspende acceso si es necesario

### Crear Rutinas Premium

- Usa el builder visual para crear rutinas semanales, días de descanso y entrenamientos
- Asigna ejercicios, series, repeticiones, pesos y notas personalizadas
- Guarda plantillas y reutiliza rutinas para nuevos clientes

### Dashboard Inteligente

- Visualiza el estado de todos tus clientes en tarjetas
- Filtros rápidos: activos, inactivos, por plan, por racha
- Métricas globales: entrenamientos, PRs, clientes destacados

---

## Guía del Cliente

### Registro y Onboarding

1. Recibe un código de invitación de tu coach
2. Regístrate en `/auth/sign-up` con tu email y código
3. Completa el onboarding: objetivo, experiencia, foto de perfil
4. Espera aprobación del coach para acceder

### Uso Diario

- Consulta tu rutina y progreso en el dashboard
- Marca entrenamientos como completados y registra sets/reps/peso/RPE
- Recibe sugerencias automáticas de progresión y logros
- Visualiza tu XP, nivel, racha y badges

---

## Rutinas y Progresión

- Crea rutinas personalizadas con días de entrenamiento y descanso
- El sistema calcula automáticamente el siguiente día y semana
- Progresión inteligente: sugerencias de peso, reps y cambios de ejercicio
- Tracking automático de PRs, volumen semanal y consistencia

---

## Gamificación y Logros

- Ganas XP por entrenar, mantener rachas, desbloquear PRs y logros
- Sistema de niveles: sube de nivel con XP acumulado
- 15+ logros con rarezas (común, raro, épico, legendario)
- Dashboard visual con animaciones y feedback inmediato

---

## Seguridad y Acceso

- Control de acceso por invitación y aprobación manual
- Suspensión automática por falta de pago
- RLS en base de datos: cada usuario solo accede a su información
- Políticas estrictas para admins y clientes
- Cumplimiento de mejores prácticas de seguridad Supabase

---

## Despliegue y Configuración

1. **Requisitos:** Cuenta en Supabase y Vercel (u otro hosting compatible)
2. **Variables de entorno:** Configura las variables necesarias (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_SETUP_CODE`, etc.)
3. **Primer admin:** Accede a `/auth/admin-setup` y completa el onboarding
4. **PWA:** Instala la app en tu móvil o desktop para experiencia offline

---

## Soporte y Roadmap

- ¿Dudas? Contacta a soporte: support@gymcoach.app
- Consulta el roadmap y mejoras en `PLAN_MEJORAS_PREMIUM.md`
- Documentación técnica y arquitectura en `ARCHITECTURE.md`
- [Resetear DB y CORS (Producción)](docs/RESET_DB_PROD.md)

---

¡Bienvenido a la experiencia GymCoach! Siéntete libre de explorar, personalizar y llevar tu coaching al siguiente nivel.

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
