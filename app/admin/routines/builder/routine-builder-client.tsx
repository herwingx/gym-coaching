'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Plus, GripVertical } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { saveRoutineFromBuilder } from '@/app/actions/routine-builder'
import { toast } from 'sonner'

interface Exercise {
  id: string
  name: string
}

interface DayExercise {
  id: string
  exerciseId: string
  sets: number
  reps: string
}

interface Day {
  id: string
  dayNumber: number
  name: string
  isRestDay: boolean
  exercises: DayExercise[]
}

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function RoutineBuilderClient({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(4)
  const [days, setDays] = useState<Day[]>(
    DAY_NAMES.map((name, i) => ({
      id: String(i + 1),
      dayNumber: i + 1,
      name,
      isRestDay: [5, 6].includes(i),
      exercises: [],
    }))
  )
  const [saving, setSaving] = useState(false)

  const toggleRestDay = (dayId: string) => {
    setDays(
      days.map((d) =>
        d.id === dayId ? { ...d, isRestDay: !d.isRestDay, exercises: [] } : d
      )
    )
  }

  const addExerciseToDay = (dayId: string) => {
    const firstEx = exercises[0]
    setDays(
      days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  id: crypto.randomUUID(),
                  exerciseId: firstEx?.id || '',
                  sets: 3,
                  reps: '8-12',
                },
              ],
            }
          : d
      )
    )
  }

  const updateExercise = (dayId: string, exId: string, field: string, value: any) => {
    setDays(
      days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((ex) =>
                ex.id === exId ? { ...ex, [field]: value } : ex
              ),
            }
          : d
      )
    )
  }

  const removeExercise = (dayId: string, exId: string) => {
    setDays(
      days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exId) }
          : d
      )
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Escribe un nombre para la rutina.')
      return
    }

    setSaving(true)
    try {
      const routineId = await saveRoutineFromBuilder({
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
          })),
        })),
      })
      toast.success('¡Rutina creada correctamente!')
      router.push(`/admin/routines/${routineId}`)
    } catch {
      toast.error('No pudimos guardar la rutina. Revisa los datos e intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="routine-name">Nombre de la rutina</FieldLabel>
              <Input
                id="routine-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Full Body Split"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="routine-desc">Descripción</FieldLabel>
              <Input
                id="routine-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe la rutina"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="routine-duration">Duración (semanas)</FieldLabel>
              <Input
                id="routine-duration"
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value) || 4)}
                min={1}
                className="w-24"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Plan semanal</h3>
        {days.map((day) => (
          <Card key={day.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{day.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {day.isRestDay ? 'Descanso' : 'Entrenar'}
                  </span>
                  <Switch
                    checked={!day.isRestDay}
                    onCheckedChange={() => toggleRestDay(day.id)}
                  />
                </div>
              </div>
            </CardHeader>
            {!day.isRestDay && (
              <CardContent className="space-y-4">
                {day.exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin ejercicios</p>
                ) : (
                  <div className="space-y-3">
                    {day.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-end gap-2 p-3 rounded-lg bg-muted/50"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Select
                          value={ex.exerciseId}
                          onValueChange={(v) =>
                            updateExercise(day.id, ex.id, 'exerciseId', v)
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Ejercicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(day.id, ex.id, 'sets', Number(e.target.value))
                          }
                          placeholder="Sets"
                          className="w-20"
                        />
                        <Input
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(day.id, ex.id, 'reps', e.target.value)
                          }
                          placeholder="Reps"
                          className="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(day.id, ex.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addExerciseToDay(day.id)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar ejercicio
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} size="lg" className="w-full" disabled={saving}>
        {saving ? 'Guardando...' : 'Crear rutina'}
      </Button>
    </div>
  )
}
