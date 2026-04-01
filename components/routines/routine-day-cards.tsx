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
          <Card key={day.id} className="overflow-hidden rounded-[1.25rem] border border-border/50 bg-card/60 shadow-sm backdrop-blur-xl transition-all">
            <CardHeader className="pb-4 bg-muted/10 border-b border-border/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-[1.1rem] font-bold tracking-tight text-foreground flex items-center">
                  Día {day.day_number ?? '-'} {day.day_name ? <span className="text-muted-foreground font-medium ml-1.5 opacity-80">· {day.day_name}</span> : ''}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {day.is_rest_day ? (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                      <MoonStar className="mr-1.5 size-3.5" />
                      Descanso
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-semibold bg-secondary/80 text-secondary-foreground shadow-sm px-2.5 py-0.5 rounded-full border-transparent">
                      <Dumbbell className="mr-1.5 size-3.5" />
                      {exercises.length} ejercicios
                    </Badge>
                  )}
                </div>
              </div>
              {(day.focus ?? day.notes) && (
                <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border/40 font-medium">
                  {day.focus ? <span className="font-bold text-foreground">Enfoque: </span> : ''}
                  {day.focus ? day.focus : day.notes}
                </p>
              )}
              {!day.is_rest_day && exercises.length > 0 && (
                <div className="grid gap-3 pt-3 mt-2 border-t border-border/30">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-border/60 bg-background/50">Push {analysis.push}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-border/60 bg-background/50">Pull {analysis.pull}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-border/60 bg-background/50">Legs {analysis.legs}</Badge>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 ml-auto bg-primary/10 text-primary border-primary/20">{getBalanceLabel(analysis.upper, analysis.lower)}</Badge>
                  </div>
                  <div className="overflow-hidden rounded-full border border-border/60 bg-muted/50 h-2 shadow-inner">
                    <div className="flex h-full w-full">
                      <div
                        className="bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ width: upperLowerTotal >= 2 ? `${upperPct}%` : '50%' }}
                        aria-label={`Upper ${upperLowerTotal >= 2 ? upperPct : 50}%`}
                      />
                      <div
                        className="bg-primary/20"
                        style={{ width: upperLowerTotal >= 2 ? `${lowerPct}%` : '50%' }}
                        aria-label={`Lower ${upperLowerTotal >= 2 ? lowerPct : 50}%`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Upper <span className="text-foreground">{upperLowerTotal >= 2 ? upperPct : 50}%</span></span>
                    <span>Lower <span className="text-foreground">{upperLowerTotal >= 2 ? lowerPct : 50}%</span></span>
                  </div>
                </div>
              )}
            </CardHeader>

            {!day.is_rest_day && (
              <CardContent className="flex flex-col gap-3 pt-4 px-4 pb-4 bg-background/30 min-w-0">
                <div className="flex flex-col gap-2.5 w-full min-w-0">
                  {exercises.length > 0 ? (
                    exercises.map((ex, index) => (
                      <div key={ex.id} className="flex w-full min-w-0 items-center justify-between gap-3 rounded-[1rem] border border-border/50 bg-card p-2.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md group">
                        <div className="flex min-w-0 flex-1 items-center gap-3.5">
                          <div className="shrink-0 overflow-hidden rounded-[0.7rem] border border-border/40 bg-white dark:bg-[#f8f9fa] shadow-sm">
                            {ex.exercises?.gif_url ? (
                              <button
                                type="button"
                                className="cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
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
                                  className={cn('object-cover mix-blend-multiply drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]', compact ? 'size-[2.75rem]' : 'size-[3.25rem]')}
                                  loading="lazy"
                                />
                              </button>
                            ) : (
                              <div className={cn('flex items-center justify-center text-[10px] font-bold text-muted-foreground/60 tracking-widest bg-muted/30', compact ? 'size-[2.75rem]' : 'size-[3.25rem]')}>
                                N/A
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="truncate text-[14px] font-bold leading-none tracking-tight text-foreground transition-colors group-hover:text-primary">
                              {index + 1}. {ex.exercises?.name ?? 'Ejercicio'}
                            </p>
                            {ex.exercises?.primary_muscle && (
                              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-1.5 opacity-80">
                                {ex.exercises.primary_muscle}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs text-muted-foreground">
                          <span className="rounded-md bg-secondary/60 px-2 py-1 font-bold tracking-widest text-[#cfcfcf]">
                            {ex.sets ?? '-'}x{ex.reps || '-'}
                          </span>
                          {ex.rest_seconds ? (
                            <span className="inline-flex items-center gap-1 font-medium bg-background/50 rounded-md px-2 py-0.5 border border-border/40 text-[10px] uppercase tracking-wider">
                              <Timer className="size-3 text-muted-foreground" />
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
