# Progresión de Carga - GymCoach Premium

## Índice
- [Cómo Funciona](#cómo-funciona)
- [Sistema Automático](#sistema-automático)
- [Registro Manual](#registro-manual)
- [Detección de PRs](#detección-de-prs)
- [Estrategias](#estrategias)
- [Troubleshooting](#troubleshooting)

## Cómo Funciona

### El Ciclo de Progresión

```
1. ENTRENAR
   ↓
2. REGISTRAR (peso, reps, RPE)
   ↓
3. APP ANALIZA
   ↓
4. SUGERENCIAS (aumenta peso/reps)
   ↓
5. TÚ IMPLEMENTAS
   ↓
6. (Repetir)
```

### Variables Principales

**PESO (Load)**
- Aumentar: +2.5-5kg cada semana

**REPS (Repeticiones)**
- Aumentar: +1-2 reps cada sesión

**SETS (Series)**
- Mantener consistencia

**RPE (Rate of Perceived Exertion)**
- 1-3: Muy fácil
- 4-5: Fácil
- 6-7: Moderado
- 8: Difícil
- 9: Muy difícil
- 10: Máximo esfuerzo

## Sistema Automático

### Cómo la App Detecta Progresión

La app registra cada ejercicio:
```
Fecha    | Ejercicio        | Peso | Reps | RPE | Sets
2026-01-15 | Press Banca     | 80kg |  8   |  8  |  3
2026-01-20 | Press Banca     | 80kg |  9   |  7  |  3
2026-01-25 | Press Banca     | 80kg | 10   |  6  |  3
2026-02-01 | Press Banca     | 82kg |  8   |  8  |  3  ← APP SUGIRIÓ EL AUMENTO
```

### Análisis Automático

Cada semana, la app calcula:

1. **Promedio de Peso** - Peso promedio usado
2. **RPE Promedio** - Esfuerzo promedio
3. **Consistencia** - ¿Fue consistente?
4. **Tendencia** - ¿Fue en aumento?

### Sugerencias Generadas

**Si RPE Bajo + Reps Altas:**
```
"Has completado 12 reps con RPE 6. 
Intenta aumentar a 14 reps próxima sesión."
```

**Si Consistencia Alta:**
```
"4 sesiones sin cambios. 
Sugiero aumentar a 77.5kg (ahora: 75kg)"
```

**Si Mucha Fatiga:**
```
"Tu RPE ha sido alto últimamente (9-10).
Considera decargar este mes."
```

## Registro Manual

### Durante el Entrenamiento

1. Completa cada set
2. La app te pide:
   - **Peso utilizado**
   - **Reps completadas**
   - **RPE** (1-10)
   - **Notas** (opcional)

3. La app automáticamente:
   - Detecta si es PR
   - Guarda en base de datos
   - Actualiza tu histórico

### Histórico de Ejercicios

Ve todos tus entrenamientos de un ejercicio:
```
Press de Banca - Histórico Completo

2026-01-15: 80kg x 8 (RPE 8)
2026-01-20: 80kg x 9 (RPE 7)
2026-01-25: 80kg x 10 (RPE 6)
2026-02-01: 82kg x 8 (RPE 8)  ← Nuevo Personal Record!
2026-02-05: 82kg x 9 (RPE 7)
2026-02-10: 82kg x 10 (RPE 6)
```

## Detección de PRs

### Tipos de PRs

**1. PR Absoluto** (Personal Record)
```
Mejor peso jamás levantado en ese ejercicio
Ejemplo: Press Banca 100kg (anterior era 95kg)
Recompensa: +100 XP + Badge "1RM Beast"
```

**Ejemplo: PR de Reps**
```
Mejor número de repeticiones con cierto peso
Ejemplo: Pull-ups 15 reps @ peso corporal (anterior era 12)
Recompensa: +50 XP
```

**3. PR de Volumen**
```
Mayor volumen total en un entrenamiento
Ejemplo: 50 series en una sesión (anterior era 45)
Recompensa: +75 XP
```

### Cómo la App Detecta PRs

- Compara cada sesión con toda la historia
- Si `peso > máximo anterior` = PR de peso
- Si `reps > máximo anterior con ese peso` = PR de reps
- Notificación inmediata: "🔥 NUEVO PR! 💪"

## Estrategias

### Estrategia 1: Progresión Lineal (Principiantes)

```
Semana 1: 60kg x 8 reps x 3 sets
Semana 2: 62.5kg x 8 reps x 3 sets (aumenta peso)
Semana 3: 65kg x 8 reps x 3 sets
Semana 4: 67.5kg x 8 reps x 3 sets
```

**Ventaja:** Simple, funciona rápido
**Desventaja:** Eventualmente se platearán

### Estrategia 2: Progresión de Reps → Peso

```
Semana 1: 60kg x 8 reps (RPE 8)
Semana 2: 60kg x 9 reps (RPE 7)
Semana 3: 60kg x 10 reps (RPE 6)
Semana 4: 62.5kg x 8 reps (RPE 8)  ← Reset reps, aumenta peso
```

**Ventaja:** Más sostenible, menos plateaus
**Desventaja:** Progresión más lenta

### Estrategia 3: Periodización

```
Mes 1 (Fuerza): 75kg x 3-5 reps
Mes 2 (Hipertrofia): 65kg x 8-10 reps
Mes 3 (Resistencia): 55kg x 12-15 reps
Mes 4 (Deload): 50% x cualquier reps
```

**Ventaja:** Evita plateaus, recuperación
**Desventaja:** Requiere planificación

### Estrategia 4: DUP (Daily Undulating Periodization)

```
Lunes: 3x5 @ 80kg (Fuerza)
Miércoles: 4x8 @ 70kg (Hipertrofia)
Viernes: 3x12 @ 60kg (Resistencia)
```

**Ventaja:** Máxima progresión, menos aburrimiento
**Desventaja:** Necesita experiencia

## Troubleshooting

### Problema: No Puedo Aumentar Peso

**Causas:**
- Fatiga acumulada
- Mala técnica
- Dormir poco
- Nutrición deficiente

**Solución:**
```
1. Haz un "Deload" (semana con 50% carga)
2. Practica técnica con peso ligero
3. Duerme 8+ horas
4. Come más proteína (1.6-2.2g/kg)
5. Reintenta después de 1-2 semanas
```

### Problema: Todas mis Cargas Bajan

**Causas:**
- Lesión o dolor
- Entrenamiento demasiado frecuente
- Demasiado volumen

**Solución:**
```
1. PARA si hay dolor
2. Ve a un fisio si persiste
3. Reduce volumen a 50%
4. Aumenta descanso entre entrenamientos
5. Vuelve gradualmente
```

### Problema: Mi RPE es Siempre 10

**Causas:**
- Ego lift (peso muy pesado)
- Mala calibración del RPE
- Dormir poco

**Solución:**
```
1. Reduce peso 10-15%
2. Practica escalas de RPE (1-10)
3. Come/duerme más
```

### Problema: Estoy en Plateau

**Causas:**
- Adaptación (cuerpo se acostumbra)
- No hay variación
- Fatiga acumulada

**Solución:**
```
1. Cambia ejercicios (variaciones)
2. Cambia sets/reps (si haces 3x8, intenta 4x6)
3. Añade técnicas (drop sets, supersets)
4. Toma semana de deload
5. Varía velocidad (lento/rápido)
```

### Problema: No Veo el PR en la App

**Posibles Razones:**
- No registraste correctamente
- Es PR pero no es absoluto
- La app necesita más datos

**Solución:**
```
1. Verifica el histórico del ejercicio
2. Asegúrate registrar peso/reps exactos
3. Si aún no ves, contacta soporte
```

---

## Metricas a Monitorear

Semanalmente, el coach revisa:

```
Cliente: Juan
Semana: 2026-W12

📊 Progreso General:
- Peso Promedio: ↑ +2.5kg
- RPE Promedio: ↓ 8 → 7.2 (mejor)
- Consistencia: ✅ 100% (6/6 días)
- PRs: 2 nuevos esta semana

🏋️ Por Ejercicio:
- Press Banca: ↑ 80kg → 82.5kg
- Sentadilla: → 95kg (sin cambio, RPE alto)
- Curl: ↑ 15kg → 16kg (+1 rep)

💡 Recomendación:
"Juan va bien pero tiene RPE alto en Sentadilla.
Sugiero decargar un poco o tomar día extra de descanso."
```

---

[Volver a Documentación Principal](./README.md)
