# Plan de Mejoras Premium - GymCoach

## Estado Actual vs Objetivo

### Implementado (Fase 1 - Completada)
- [x] Autenticacion con roles (admin, client, receptionist)
- [x] Sistema de invitaciones con codigos unicos
- [x] Crear/editar rutinas con dias y ejercicios
- [x] Asignar rutinas a clientes
- [x] Tracking de ejercicios (peso, reps, RPE)
- [x] Sistema de XP y niveles
- [x] Achievements basicos
- [x] Deteccion automatica de PRs
- [x] Dark/Light mode con tema lime
- [x] PWA con offline support
- [x] RLS en todas las tablas

### Por Implementar (Fase 2 - Premium)

---

## Fase 2A: Dashboard del Coach Mejorado

### Objetivo
El coach debe ver en UN SOLO VISTAZO el estado de TODOS sus asesorados.

### Funcionalidades
1. **Vista de Tarjetas por Cliente**
   - Foto de perfil
   - Nombre y plan activo
   - Ultima sesion (hace X dias)
   - Racha actual
   - Tendencia (subiendo/bajando/estancado)
   - Alerta si no entrena hace +3 dias

2. **Filtros Rapidos**
   - Todos
   - Activos esta semana
   - Inactivos (+3 dias sin entrenar)
   - Por plan de membresia
   - Por rutina asignada

3. **Metricas Globales**
   - Total de entrenamientos esta semana
   - PRs logrados este mes
   - Cliente mas activo
   - Cliente que necesita atencion

### Archivos a Crear/Modificar
```
app/admin/dashboard/page.tsx (rehacer)
app/admin/dashboard/coach-overview.tsx (nuevo)
app/admin/dashboard/client-card.tsx (nuevo)
app/admin/dashboard/global-metrics.tsx (nuevo)
```

### Estimacion: 1-2 horas

---

## Fase 2B: Perfil Detallado del Cliente (Vista Coach)

### Objetivo
El coach puede ver TODO sobre un cliente en una pagina.

### Funcionalidades
1. **Header con Info Clave**
   - Foto, nombre, email
   - Fecha de inicio
   - Plan actual y fecha de vencimiento
   - Boton de suspender/activar

2. **Tabs de Informacion**
   - **Resumen**: Stats generales, racha, nivel, XP
   - **Rutina**: Rutina asignada con progreso
   - **Historial**: Todas las sesiones completadas
   - **Progreso**: Graficas de peso levantado por ejercicio
   - **Medidas**: Historial de medidas corporales con graficas
   - **Fotos**: Comparador antes/despues
   - **Notas**: Notas del coach sobre el cliente

3. **Acciones Rapidas**
   - Asignar nueva rutina
   - Registrar pago
   - Enviar mensaje
   - Agregar nota

### Archivos a Crear
```
app/admin/clients/[clientId]/page.tsx (rehacer como hub)
app/admin/clients/[clientId]/tabs/summary.tsx
app/admin/clients/[clientId]/tabs/routine.tsx
app/admin/clients/[clientId]/tabs/history.tsx
app/admin/clients/[clientId]/tabs/progress.tsx
app/admin/clients/[clientId]/tabs/measurements.tsx
app/admin/clients/[clientId]/tabs/photos.tsx
app/admin/clients/[clientId]/tabs/notes.tsx
```

### Estimacion: 2-3 horas

---

## Fase 2C: Comparador de Fotos Antes/Despues ✅

### Objetivo
El cliente sube fotos de progreso y puede compararlas visualmente.

### Implementado
- Subida a Supabase Storage (bucket `progress-photos`), path `clients/{client_id}/`
- Migración `scripts/005_progress_photos_storage.sql`: weight_kg, bucket, RLS
- Ruta `/client/photos` con Galería, Comparador y Subir
- Slider interactivo antes/después (`ImageCompareSlider`)
- Filtro por categoría (Frente, Perfil, Espalda)

### Funcionalidades
1. **Subida de Fotos**
   - Categorias: Frente, Perfil, Espalda
   - Fecha automatica
   - Peso del dia (opcional)

2. **Comparador con Slider**
   - Seleccionar 2 fotos
   - Slider interactivo para comparar
   - Ver diferencia de fechas y peso

3. **Galeria Cronologica**
   - Timeline de fotos
   - Filtrar por categoria
   - Ver evolucion

### Migracion DB Necesaria
```sql
CREATE TABLE public.progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text REFERENCES public.clients(id),
  photo_url text NOT NULL,
  category text CHECK (category IN ('front', 'side', 'back')),
  weight_kg numeric(5,2),
  notes text,
  taken_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
```

### Archivos a Crear
```
app/client/photos/page.tsx
app/client/photos/photo-upload.tsx
app/client/photos/photo-compare.tsx
app/client/photos/photo-gallery.tsx
components/ui/image-compare-slider.tsx
```

### Estimacion: 2 horas

---

## Fase 2D: Graficas de Progreso Detalladas

### Objetivo
Ver tendencias de peso levantado por ejercicio en el tiempo.

### Funcionalidades
1. **Grafica por Ejercicio**
   - Linea de peso maximo
   - Linea de volumen total (peso x reps)
   - Marcadores de PRs

2. **Filtros**
   - Rango de fechas
   - Por ejercicio especifico
   - Por grupo muscular

3. **Insights Automaticos**
   - "Tu bench press subio 15% este mes"
   - "Llevas 3 semanas sin mejorar en squat"
   - "Tu volumen total aumento 20%"

### Archivos a Crear
```
app/client/progress/page.tsx
app/client/progress/exercise-chart.tsx
app/client/progress/volume-chart.tsx
app/client/progress/insights.tsx
components/charts/exercise-progress-chart.tsx
```

### Estimacion: 2 horas

---

## Fase 2E: Sistema de Mensajeria Coach-Cliente ✅

### Objetivo
Comunicacion directa sin salir de la app.

### Implementado
- Tabla `messages`, RLS, Realtime
- Ruta `/messages` para coach y cliente
- Chat con burbujas, emojis, mensajes rápidos
- Migración `scripts/006_messages_avatars.sql`

### Funcionalidades
1. **Chat Simple**
   - Mensajes de texto
   - Timestamps
   - Indicador de leido

2. **Notificaciones**
   - Badge de mensajes no leidos
   - Lista de conversaciones (para coach)

3. **Mensajes Rapidos**
   - "Excelente sesion!"
   - "Recuerda entrenar hoy"
   - "Necesitas aumentar peso"

### Migracion DB Necesaria
```sql
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES auth.users(id),
  to_user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### Archivos a Crear
```
app/messages/page.tsx
app/messages/[conversationId]/page.tsx
components/chat/message-list.tsx
components/chat/message-input.tsx
components/chat/conversation-list.tsx
```

### Estimacion: 2-3 horas

---

## Fase 2F: Notas del Coach

### Objetivo
El coach puede agregar notas privadas sobre cada cliente.

### Funcionalidades
1. **Notas por Cliente**
   - Observaciones generales
   - Lesiones/limitaciones
   - Preferencias

2. **Notas por Sesion**
   - Comentarios post-entrenamiento
   - Ajustes sugeridos
   - Feedback

3. **Sistema de Tags**
   - #lesion #dieta #motivacion #tecnica

### Migracion DB Necesaria
```sql
CREATE TABLE public.coach_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES auth.users(id),
  client_id text REFERENCES public.clients(id),
  workout_session_id text REFERENCES public.workout_sessions(id),
  content text NOT NULL,
  tags text[],
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

### Archivos a Crear
```
components/admin/client-notes.tsx
components/admin/note-editor.tsx
app/actions/notes.ts
```

### Estimacion: 1 hora

---

## Fase 2G: Historial de Medidas Corporales

### Objetivo
Tracking completo de medidas con graficas de evolucion.

### Funcionalidades
1. **Registro de Medidas**
   - Peso
   - % Grasa corporal
   - Circunferencias (pecho, cintura, cadera, brazo, muslo)
   - Fecha automatica

2. **Graficas de Evolucion**
   - Linea de tiempo por medida
   - Comparacion de fechas
   - Tendencia general

3. **Metas**
   - Definir meta por medida
   - Ver progreso hacia meta

### Archivos a Crear
```
app/client/measurements/page.tsx
app/client/measurements/measurement-form.tsx
app/client/measurements/measurement-chart.tsx
```

### Estimacion: 1-2 horas

---

## Fase 2H: Calendario de Entrenamientos

### Objetivo
Vista de calendario con historial de sesiones.

### Funcionalidades
1. **Vista Mensual**
   - Dias con entrenamiento marcados
   - Color por tipo de dia (pecho, pierna, etc.)
   - Click para ver detalle

2. **Detalle del Dia**
   - Ejercicios realizados
   - Volumen total
   - PRs del dia

3. **Estadisticas Mensuales**
   - Dias entrenados
   - Volumen total
   - PRs logrados

### Archivos a Crear
```
app/client/calendar/page.tsx
components/calendar/workout-calendar.tsx
components/calendar/day-detail.tsx
```

### Estimacion: 2 horas

---

## Resumen de Prioridades

| Fase | Funcionalidad | Impacto | Esfuerzo | Prioridad |
|------|---------------|---------|----------|-----------|
| 2A | Dashboard Coach Mejorado | Alto | Medio | 1 |
| 2B | Perfil Detallado Cliente | Alto | Alto | 2 |
| 2D | Graficas de Progreso | Alto | Medio | 3 |
| 2G | Medidas Corporales | Alto | Bajo | 4 |
| 2C | Comparador de Fotos | Medio | Medio | 5 |
| 2H | Calendario | Medio | Medio | 6 |
| 2F | Notas del Coach | Medio | Bajo | 7 |
| 2E | Mensajeria | Medio | Alto | 8 |

---

## Estimacion Total

- **Tiempo total estimado:** 13-17 horas de desarrollo
- **Migraciones DB necesarias:** 3 tablas nuevas
- **Archivos nuevos:** ~30-40 archivos

---

## Orden de Implementacion Recomendado

1. **Sprint 1 (Core Coach):** 2A + 2B + 2F
2. **Sprint 2 (Progreso Visual):** 2D + 2G + 2H
3. **Sprint 3 (Extras):** 2C + 2E

Esto permite que el coach tenga las herramientas esenciales primero, luego el cliente ve su progreso de forma visual, y finalmente se agregan los extras.
