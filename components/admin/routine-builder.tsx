'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Plus, GripVertical } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
}

interface Day {
  id: string
  dayNumber: number
  name: string
  isRestDay: boolean
  exercises: Exercise[]
}

export function RoutineBuilder({
  onSave,
  initialData,
}: {
  onSave: (data: any) => void
  initialData?: any
}) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [durationWeeks, setDurationWeeks] = useState(initialData?.duration_weeks || 4)
  const [days, setDays] = useState<Day[]>(
    initialData?.days || Array.from({ length: 7 }, (_, i) => ({
      id: String(i + 1),
      dayNumber: i + 1,
      name: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][i],
      isRestDay: [5, 6].includes(i),
      exercises: [],
    }))
  )

  const toggleRestDay = (dayId: string) => {
    setDays(
      days.map((day) =>
        day.id === dayId ? { ...day, isRestDay: !day.isRestDay, exercises: [] } : day
      )
    )
  }

  const addExerciseToDay = (dayId: string) => {
    setDays(
      days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: [...day.exercises, { id: Date.now().toString(), name: '', sets: 3, reps: '8-12' }],
            }
          : day
      )
    )
  }

  const updateExercise = (dayId: string, exerciseId: string, field: string, value: any) => {
    setDays(
      days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, [field]: value } : ex
              ),
            }
          : day
      )
    )
  }

  const removeExercise = (dayId: string, exerciseId: string) => {
    setDays(
      days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
            }
          : day
      )
    )
  }

  const handleSave = () => {
    onSave({ name, description, duration_weeks: durationWeeks, days })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre de la Rutina</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Full Body Split"
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu rutina"
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Duración (semanas)</label>
            <Input
              type="number"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Plan de Entrenamiento</h3>
        {days.map((day) => (
          <Card key={day.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{day.name}</CardTitle>
                <Button
                  variant={day.isRestDay ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => toggleRestDay(day.id)}
                >
                  {day.isRestDay ? 'Día de Descanso' : 'Día de Entrenamiento'}
                </Button>
              </div>
            </CardHeader>

            {!day.isRestDay && (
              <CardContent className="space-y-4">
                {day.exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin ejercicios</p>
                ) : (
                  <div className="space-y-3">
                    {day.exercises.map((ex) => (
                      <div key={ex.id} className="flex items-end gap-2 p-3 bg-muted rounded-lg">
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-2" />
                        <div className="flex-1 space-y-2">
                          <Input
                            value={ex.name}
                            onChange={(e) => updateExercise(day.id, ex.id, 'name', e.target.value)}
                            placeholder="Nombre del ejercicio"
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={ex.sets}
                              onChange={(e) => updateExercise(day.id, ex.id, 'sets', Number(e.target.value))}
                              placeholder="Sets"
                              className="w-20 text-sm"
                            />
                            <Input
                              value={ex.reps}
                              onChange={(e) => updateExercise(day.id, ex.id, 'reps', e.target.value)}
                              placeholder="Reps (ej: 8-12)"
                              className="flex-1 text-sm"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
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
                  Agregar Ejercicio
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} size="lg" className="w-full">
        Guardar Rutina
      </Button>
    </div>
  )
}
