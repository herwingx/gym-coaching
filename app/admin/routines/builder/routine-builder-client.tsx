'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  ClipboardList,
  Moon,
  Sparkles,
  Lightbulb,
  Loader2,
  Dumbbell,
} from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { saveRoutineFromBuilder, updateRoutineFromBuilder } from '@/app/actions/routine-builder'
import { toast } from 'sonner'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import { ExerciseSelectorDrawer } from '@/components/admin/exercises/exercise-selector-drawer'
import { SortableExercise } from '@/components/admin/exercises/sortable-exercise'
import { Exercise } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DayExercise {
  id: string
  exerciseId: string
  sets: number
  reps: string
  restSeconds: number
}

interface Day {
  id: string
  dayNumber: number
  name: string
  isRestDay: boolean
  exercises: DayExercise[]
}

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export interface RoutineBuilderClientProps {
  exercises: Exercise[]
  routineId?: string
  initialData?: {
    name: string
    description: string
    durationWeeks: number
    days: Day[]
  }
}

export function RoutineBuilderClient({
  exercises,
  routineId,
  initialData,
}: RoutineBuilderClientProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [durationWeeks, setDurationWeeks] = useState(initialData?.durationWeeks ?? 4)
  const [days, setDays] = useState<Day[]>(
    initialData?.days ??
      DAY_NAMES.map((name, i) => ({
        id: String(i + 1),
        dayNumber: i + 1,
        name,
        isRestDay: [5, 6].includes(i),
        exercises: [],
      })),
  )
  const [saving, setSaving] = useState(false)

  const [selectorOpen, setSelectorOpen] = useState(false)
  const [activeDayId, setActiveDayId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent, dayId: string) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setDays((prev) =>
        prev.map((d) => {
          if (d.id === dayId) {
            const oldIndex = d.exercises.findIndex((ex) => ex.id === active.id)
            const newIndex = d.exercises.findIndex((ex) => ex.id === over.id)
            return { ...d, exercises: arrayMove(d.exercises, oldIndex, newIndex) }
          }
          return d
        }),
      )
    }
  }

  const handleOpenSelector = (dayId: string) => {
    setActiveDayId(dayId)
    setSelectorOpen(true)
  }

  const handleSelectExercises = (selectedIds: string[]) => {
    if (!activeDayId) return
    setDays((prev) =>
      prev.map((d) =>
        d.id === activeDayId
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                ...selectedIds.map((exId) => ({
                  id: crypto.randomUUID(),
                  exerciseId: exId,
                  sets: 3,
                  reps: '',
                  restSeconds: 60,
                })),
              ],
            }
          : d,
      ),
    )
    setSelectorOpen(false)
    setActiveDayId(null)
  }

  const setDayKind = (dayId: string, kind: 'train' | 'rest') => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d
        const nextRest = kind === 'rest'
        if (d.isRestDay === nextRest) return d
        return {
          ...d,
          isRestDay: nextRest,
          exercises: nextRest ? [] : d.exercises,
        }
      }),
    )
  }

  const updateExercise = (dayId: string, exId: string, field: string, value: string | number) => {
    setDays(
      days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((ex) =>
                ex.id === exId ? { ...ex, [field]: value } : ex,
              ),
            }
          : d,
      ),
    )
  }

  const removeExercise = (dayId: string, exId: string) => {
    setDays(
      days.map((d) =>
        d.id === dayId ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exId) } : d,
      ),
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Escribe un nombre para la rutina.')
      return
    }

    const daysWithExercises = days.filter((d) => !d.isRestDay && d.exercises.length > 0)
    const hasEmptyReps = daysWithExercises.some((d) =>
      d.exercises.some((ex) => !ex.reps?.trim()),
    )
    if (hasEmptyReps) {
      toast.error('Completa las reps o notas de cada ejercicio antes de guardar.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        duration_weeks: durationWeeks,
        days: days.map((d) => ({
          day_number: d.dayNumber,
          day_name: d.name,
          is_rest_day: d.isRestDay,
          exercises: d.exercises.map((ex, i) => ({
            exercise_id: ex.exerciseId,
            order_index: i,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.restSeconds,
          })),
        })),
      }

      if (routineId) {
        await updateRoutineFromBuilder(routineId, payload)
        toast.success('Rutina actualizada.')
        router.push(`/admin/routines/${routineId}`)
      } else {
        const id = await saveRoutineFromBuilder(payload)
        toast.success('Rutina creada.')
        router.push(`/admin/routines/${id}`)
      }
    } catch {
      toast.error('No pudimos guardar. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const trainingDays = days.filter((d) => !d.isRestDay).length
  const restDays = days.filter((d) => d.isRestDay).length

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-8 pb-28 lg:pb-10">
      {exercises.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4">
          <Card className="w-full max-w-md rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle className="text-destructive">Sin ejercicios en la base</CardTitle>
              <CardDescription>
                Ejecuta el seed de ejercicios o revisa la tabla <code className="text-xs">exercises</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => router.push('/admin/routines')}
              >
                Volver a rutinas
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Alert variant="default" className="border-primary/20 bg-primary/5">
        <Lightbulb className="size-4 text-primary" aria-hidden />
        <AlertTitle className="text-sm font-semibold text-foreground">
          Flujo rápido
        </AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          1) Nombre y duración → 2) Marca días de entreno o descanso → 3) Añade ejercicios por día,
          arrastra para ordenar → 4) Indica series, reps y descanso → Guardar.
        </AlertDescription>
      </Alert>

      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardHeader className="gap-2 px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary"
              aria-hidden
            >
              <ClipboardList className="size-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                Datos de la rutina
              </CardTitle>
              <CardDescription className="text-sm">
                Nombre, duración y notas para tu plan semanal.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 px-6 pb-6 pt-2">
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <Field className="md:col-span-8">
              <FieldLabel htmlFor="routine-name">Nombre</FieldLabel>
              <Input
                id="routine-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Hipertrofia — tren superior"
                className="h-11 rounded-xl"
              />
            </Field>
            <Field className="md:col-span-4">
              <FieldLabel htmlFor="routine-duration">Semanas</FieldLabel>
              <Input
                id="routine-duration"
                type="number"
                inputMode="numeric"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value) || 4)}
                min={1}
                className="h-11 rounded-xl text-center tabular-nums"
              />
            </Field>
            <Field className="md:col-span-12">
              <FieldLabel htmlFor="routine-desc">Descripción (opcional)</FieldLabel>
              <Textarea
                id="routine-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objetivo, progresión o recordatorios para el cliente…"
                className="min-h-20 rounded-xl md:text-sm"
                rows={3}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" aria-hidden />
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Tu semana</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Activa o desactiva cada día. Solo los días de entreno llevan ejercicios.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs font-medium">
            {trainingDays} entreno{trainingDays !== 1 ? 's' : ''} · {restDays} descanso
            {restDays !== 1 ? 's' : ''}
          </Badge>
        </div>

        <Separator />

        <div className="flex flex-col gap-5">
          {days.map((day) => {
            const selectorActive = selectorOpen && activeDayId === day.id
            return (
              <Card
                key={day.id}
                className={cn(
                  'overflow-hidden rounded-xl border shadow-sm transition-[border-color,box-shadow,background-color] duration-200',
                  day.isRestDay
                    ? 'border-dashed border-muted-foreground/25 bg-muted/15'
                    : 'border-border bg-card',
                  !day.isRestDay &&
                    'hover:border-primary/25 hover:shadow-md focus-within:border-primary/30',
                  !day.isRestDay &&
                    selectorActive &&
                    'border-primary/40 shadow-md ring-2 ring-ring/40',
                )}
              >
                <CardHeader className="flex flex-col gap-4 px-5 pb-4 pt-5 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums',
                          day.isRestDay
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary text-primary-foreground',
                        )}
                        aria-hidden
                      >
                        {day.isRestDay ? <Moon className="size-5" /> : day.dayNumber}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold sm:text-lg">{day.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {day.isRestDay
                            ? 'Día de recuperación — sin ejercicios.'
                            : 'Construye la sesión: ordena con el asa ⋮⋮ (escritorio).'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:items-end">
                      <p
                        id={`day-kind-label-${day.id}`}
                        className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Tipo de día
                      </p>
                      <ToggleGroup
                        type="single"
                        value={day.isRestDay ? 'rest' : 'train'}
                        onValueChange={(v) => {
                          if (v === 'train' || v === 'rest') setDayKind(day.id, v)
                        }}
                        variant="outline"
                        size="sm"
                        rovingFocus={false}
                        className="flex w-full rounded-xl border border-border/80 bg-muted/25 p-1 shadow-none sm:w-auto"
                        aria-labelledby={`day-kind-label-${day.id}`}
                      >
                        <ToggleGroupItem
                          value="train"
                          className={cn(
                            'min-h-10 flex-1 gap-2 rounded-lg border-0 px-3 py-2 text-xs font-semibold shadow-none sm:flex-initial sm:text-sm',
                            'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
                            'data-[state=off]:text-muted-foreground',
                          )}
                          aria-label="Marcar como día de entreno"
                        >
                          <Dumbbell className="opacity-90" data-icon="inline-start" />
                          Entreno
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="rest"
                          className={cn(
                            'min-h-10 flex-1 gap-2 rounded-lg border-0 px-3 py-2 text-xs font-semibold shadow-none sm:flex-initial sm:text-sm',
                            'data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:ring-2 data-[state=on]:ring-ring/60',
                            'data-[state=off]:text-muted-foreground',
                          )}
                          aria-label="Marcar como día de descanso"
                        >
                          <Moon className="opacity-90" data-icon="inline-start" />
                          Descanso
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </CardHeader>

                {!day.isRestDay && (
                  <CardContent className="flex flex-col gap-4 px-5 pb-6 pt-0 sm:px-6">
                    {day.exercises.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Aún no hay ejercicios este día. Pulsa{' '}
                          <span className="font-medium text-foreground">Añadir ejercicios</span> y elige
                          del catálogo.
                        </p>
                      </div>
                    )}

                    {day.exercises.length > 0 && (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, day.id)}
                        modifiers={[restrictToVerticalAxis]}
                      >
                        <SortableContext
                          items={day.exercises.map((ex) => ex.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="flex flex-col gap-3">
                            {day.exercises.map((ex) => {
                              const exerciseInfo = exercises.find((e) => e.id === ex.exerciseId)
                              return (
                                <SortableExercise
                                  key={ex.id}
                                  id={ex.id}
                                  dayId={day.id}
                                  exerciseId={ex.exerciseId}
                                  sets={ex.sets}
                                  reps={ex.reps}
                                  restSeconds={ex.restSeconds}
                                  exerciseInfo={exerciseInfo}
                                  onUpdate={(field, value) => updateExercise(day.id, ex.id, field, value)}
                                  onRemove={() => removeExercise(day.id, ex.id)}
                                />
                              )
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => handleOpenSelector(day.id)}
                      className={cn(
                        'h-12 w-full rounded-xl border-2 border-dashed text-sm font-medium',
                        selectorActive
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-muted-foreground/30 hover:border-primary/40 hover:bg-accent/50',
                      )}
                    >
                      <Plus className="size-4 shrink-0" />
                      {selectorActive ? 'Catálogo abierto — selecciona ejercicios' : 'Añadir ejercicios'}
                    </Button>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95',
          'backdrop-blur-sm',
          'px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6',
          'lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none',
        )}
      >
        <div className="mx-auto w-full max-w-3xl lg:max-w-none">
          <Button
            type="button"
            onClick={handleSave}
            size="lg"
            disabled={saving}
            className="h-12 w-full rounded-xl text-base font-semibold sm:h-11"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {routineId ? 'Guardando…' : 'Creando rutina…'}
              </span>
            ) : routineId ? (
              'Guardar cambios'
            ) : (
              'Guardar rutina'
            )}
          </Button>
        </div>
      </div>

      <ExerciseSelectorDrawer
        open={selectorOpen}
        onOpenChange={(open) => {
          setSelectorOpen(open)
          if (!open) setActiveDayId(null)
        }}
        exercises={exercises}
        onSelectExercises={handleSelectExercises}
      />
    </div>
  )
}

export default RoutineBuilderClient
