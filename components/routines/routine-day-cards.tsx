'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Dumbbell, MoonStar, Timer } from 'lucide-react'

type RoutineExerciseLike = {
  id: string | number
  sets?: number | null
  reps?: string | null
  rest_seconds?: number | null
  exercises?: {
    id?: string
    name?: string | null
    primary_muscle?: string | null
    gif_url?: string | null
  } | null
}

type RoutineDayLike = {
  id: string
  day_number?: number | null
  day_name?: string | null
  focus?: string | null
  notes?: string | null
  is_rest_day?: boolean | null
  routine_exercises?: RoutineExerciseLike[] | null
}

interface RoutineDayCardsProps {
  days: RoutineDayLike[]
  emptyMessage?: string
  compact?: boolean
}

function normalizeMuscle(muscle?: string | null) {
  return (muscle || '').toLowerCase().trim()
}

function getLowerBodyScore(muscle?: string | null) {
  const m = normalizeMuscle(muscle)
  if (!m) return 0
  const lowerKeywords = [
    'quad',
    'cuadri',
    'femoral',
    'isquio',
    'glute',
    'glut',
    'pantorr',
    'calf',
    'pierna',
    'aductor',
    'abductor',
    'hip',
  ]
  return lowerKeywords.some((k) => m.includes(k)) ? 1 : 0
}

function getUpperBodyScore(muscle?: string | null) {
  const m = normalizeMuscle(muscle)
  if (!m) return 0
  const upperKeywords = [
    'pecho',
    'chest',
    'espalda',
    'back',
    'hombro',
    'shoulder',
    'bicep',
    'bícep',
    'tricep',
    'trícep',
    'lats',
    'dorsal',
    'delto',
    'trap',
    'antebrazo',
    'forearm',
    'core',
    'abs',
    'abdom',
  ]
  return upperKeywords.some((k) => m.includes(k)) ? 1 : 0
}

function getPatternBucket(muscle?: string | null): 'push' | 'pull' | 'legs' | 'other' {
  const m = normalizeMuscle(muscle)
  if (!m) return 'other'

  const legs = ['quad', 'cuadri', 'femoral', 'isquio', 'glute', 'glut', 'pierna', 'pantorr', 'calf']
  if (legs.some((k) => m.includes(k))) return 'legs'

  const push = ['pecho', 'chest', 'tricep', 'trícep', 'hombro', 'shoulder', 'delto']
  if (push.some((k) => m.includes(k))) return 'push'

  const pull = ['espalda', 'back', 'dorsal', 'lats', 'bicep', 'bícep', 'trap', 'antebrazo', 'forearm']
  if (pull.some((k) => m.includes(k))) return 'pull'

  return 'other'
}

function getBalanceLabel(upperCount: number, lowerCount: number) {
  const total = upperCount + lowerCount
  if (total < 2) return 'Sin data suficiente'
  const upperRatio = upperCount / total
  if (upperRatio >= 0.7) return 'Upper dominante'
  if (upperRatio <= 0.3) return 'Lower dominante'
  return 'Simétrico'
}

export function RoutineDayCards({
  days,
  emptyMessage = 'Esta rutina no tiene días configurados aún.',
  compact = false,
}: RoutineDayCardsProps) {
  const [selectedExercise, setSelectedExercise] = useState<{
    name: string
    primaryMuscle: string
    sets: string
    rest: string
    gifUrl: string
  } | null>(null)

  if (!days?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</CardContent>
      </Card>
    )
  }

  const sortedDays = [...days].sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))

  return (
    <div className="grid gap-4">
      {sortedDays.map((day) => {
        const exercises = day.routine_exercises ?? []
        const analysis = exercises.reduce(
          (acc, ex) => {
            const primary = ex.exercises?.primary_muscle
            acc.upper += getUpperBodyScore(primary)
            acc.lower += getLowerBodyScore(primary)
            const bucket = getPatternBucket(primary)
            if (bucket === 'push') acc.push += 1
            if (bucket === 'pull') acc.pull += 1
            if (bucket === 'legs') acc.legs += 1
            return acc
          },
          { upper: 0, lower: 0, push: 0, pull: 0, legs: 0 },
        )
        const upperLowerTotal = analysis.upper + analysis.lower
        const upperPct = upperLowerTotal > 0 ? Math.round((analysis.upper / upperLowerTotal) * 100) : 50
        const lowerPct = 100 - upperPct

        return (
          <Card key={day.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  Día {day.day_number ?? '-'} {day.day_name ? `· ${day.day_name}` : ''}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {day.is_rest_day ? (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      <MoonStar className="mr-1 size-3.5" />
                      Descanso
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Dumbbell className="mr-1 size-3.5" />
                      {exercises.length} ejercicios
                    </Badge>
                  )}
                </div>
              </div>
              {(day.focus ?? day.notes) && (
                <p className="text-sm text-muted-foreground">{day.focus ? `Enfoque: ${day.focus}` : day.notes}</p>
              )}
              {!day.is_rest_day && exercises.length > 0 && (
                <div className="grid gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Push {analysis.push}</Badge>
                    <Badge variant="outline">Pull {analysis.pull}</Badge>
                    <Badge variant="outline">Legs {analysis.legs}</Badge>
                    <Badge variant="secondary">{getBalanceLabel(analysis.upper, analysis.lower)}</Badge>
                  </div>
                  <div className="overflow-hidden rounded-full border bg-muted">
                    <div className="flex h-2 w-full">
                      <div
                        className="bg-primary/80"
                        style={{ width: upperLowerTotal >= 2 ? `${upperPct}%` : '50%' }}
                        aria-label={`Upper ${upperLowerTotal >= 2 ? upperPct : 50}%`}
                      />
                      <div
                        className="bg-primary/30"
                        style={{ width: upperLowerTotal >= 2 ? `${lowerPct}%` : '50%' }}
                        aria-label={`Lower ${upperLowerTotal >= 2 ? lowerPct : 50}%`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Upper {upperLowerTotal >= 2 ? upperPct : 50}%</span>
                    <span>Lower {upperLowerTotal >= 2 ? lowerPct : 50}%</span>
                  </div>
                </div>
              )}
            </CardHeader>

            {!day.is_rest_day && (
              <CardContent className="grid gap-4 pt-0">
                <div className="grid gap-2">
                  {exercises.length > 0 ? (
                    exercises.map((ex, index) => (
                      <div key={ex.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="overflow-hidden rounded-md border bg-muted/40">
                            {ex.exercises?.gif_url ? (
                              <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() =>
                                  setSelectedExercise({
                                    name: ex.exercises?.name || 'Ejercicio',
                                    primaryMuscle: ex.exercises?.primary_muscle || 'No especificado',
                                    sets: `${ex.sets ?? '-'}x${ex.reps || '-'}`,
                                    rest: ex.rest_seconds ? `${ex.rest_seconds}s` : 'Sin descanso',
                                    gifUrl: ex.exercises?.gif_url || '',
                                  })
                                }
                                aria-label={`Ver detalle de ${ex.exercises?.name || 'ejercicio'}`}
                              >
                                <img
                                  src={ex.exercises.gif_url}
                                  alt={ex.exercises?.name || 'Ejercicio'}
                                  className={cn('object-cover', compact ? 'size-10' : 'size-12')}
                                  loading="lazy"
                                />
                              </button>
                            ) : (
                              <div className={cn('flex items-center justify-center text-[10px] text-muted-foreground', compact ? 'size-10' : 'size-12')}>
                                GIF
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {index + 1}. {ex.exercises?.name ?? 'Ejercicio'}
                            </p>
                            {ex.exercises?.primary_muscle && (
                              <p className="text-xs text-muted-foreground">{ex.exercises.primary_muscle}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded bg-muted px-2 py-1 font-medium text-foreground">
                            {ex.sets ?? '-'}x{ex.reps || '-'}
                          </span>
                          {ex.rest_seconds ? (
                            <span className="inline-flex items-center gap-1">
                              <Timer className="size-3.5" />
                              {ex.rest_seconds}s
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
                      Este día no tiene ejercicios cargados.
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      <Dialog open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedExercise?.name || 'Ejercicio'}</DialogTitle>
            <DialogDescription>{selectedExercise?.primaryMuscle || 'No especificado'}</DialogDescription>
          </DialogHeader>

          {selectedExercise?.gifUrl ? (
            <div className="overflow-hidden rounded-lg border bg-muted/40">
              <img
                src={selectedExercise.gifUrl}
                alt={selectedExercise.name}
                className="aspect-square w-full object-cover"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="rounded-md border px-3 py-2">
              <p className="text-muted-foreground">Series x repeticiones</p>
              <p className="font-medium">{selectedExercise?.sets || '-'}</p>
            </div>
            <div className="rounded-md border px-3 py-2">
              <p className="text-muted-foreground">Descanso</p>
              <p className="font-medium">{selectedExercise?.rest || '-'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RoutineDayCards
