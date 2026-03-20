'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { getNextWorkoutDay, suggestProgressionWeekly } from '@/app/actions/routine-assignment'
import { CheckCircle2, ChevronRight, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface ClientRoutine {
  id: string
  routine_id: string
  current_week: number
  current_day_index: number
  is_active: boolean
  routines: {
    id: string
    name: string
    duration_weeks: number
    days_per_week: number
    description: string
  }
}

export default function ClientRoutinesPage() {
  const [routines, setRoutines] = useState<ClientRoutine[]>([])
  const [nextWorkout, setNextWorkout] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRoutines = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Get user's client record
        const { data: clients } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!clients) return

        // Get assigned routines
        const { data: clientRoutines } = await supabase
          .from('client_routines')
          .select(`
            id,
            routine_id,
            current_week,
            current_day_index,
            is_active,
            routines (
              id,
              name,
              duration_weeks,
              days_per_week,
              description
            )
          `)
          .eq('client_id', clients.id)
          .eq('is_active', true)

        setRoutines(clientRoutines || [])

        // Get next workout
        if (clientRoutines && clientRoutines.length > 0) {
          const nextWorkoutInfo = await getNextWorkoutDay(clientRoutines[0].id)
          setNextWorkout(nextWorkoutInfo)

          // Get progression suggestions
          const progressSuggestions = await suggestProgressionWeekly(clientRoutines[0].id)
          setSuggestions(progressSuggestions)
        }
      } catch (error) {
        toast.error('No pudimos cargar tus rutinas. Recarga la página.')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutines()
  }, [])

  if (isLoading) {
    return <div id="main-content" className="container py-8" role="main" tabIndex={-1}>Cargando...</div>
  }

  if (routines.length === 0) {
    return (
      <div id="main-content" className="container py-8 text-center" role="main" tabIndex={-1}>
        <p className="text-muted-foreground mb-4">Aún no tienes rutinas asignadas</p>
        <p className="text-sm text-muted-foreground">Tu coach te asignará una rutina pronto</p>
      </div>
    )
  }

  return (
    <main id="main-content" className="container py-8 space-y-8" tabIndex={-1}>
      {/* Current Routine */}
      {routines.map((routine) => {
        const progress = (routine.current_week / routine.routines.duration_weeks) * 100
        
        return (
          <Card key={routine.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{routine.routines.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {routine.routines.description}
                  </p>
                </div>
                {nextWorkout?.isComplete && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completada
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progreso de la Rutina</span>
                  <span className="text-sm text-muted-foreground">
                    Semana {routine.current_week} de {routine.routines.duration_weeks}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Next Workout Info */}
              {nextWorkout && (
                <div className="bg-accent/10 rounded-lg p-4 space-y-3">
                  {nextWorkout.isComplete ? (
                    <div className="text-center space-y-2">
                      <p className="font-medium text-success">Rutina Completada!</p>
                      <p className="text-sm text-muted-foreground">
                        {nextWorkout.suggestedAction}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium">{nextWorkout.message}</p>
                        {nextWorkout.isRestDay && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Usa este día para recuperarte y prepararte para el próximo entrenamiento
                          </p>
                        )}
                      </div>

                      {!nextWorkout.isRestDay && nextWorkout.exercises && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Ejercicios de hoy:</p>
                          <div className="space-y-1">
                            {nextWorkout.exercises.map((exercise: any) => (
                              <div
                                key={exercise.id}
                                className="text-sm flex items-center justify-between p-2 bg-background rounded"
                              >
                                <span>{exercise.exercises?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {exercise.sets} x {exercise.reps}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!nextWorkout.isRestDay && (
                        <Button asChild className="w-full">
                          <Link href="/client/workout/start">
                            Comenzar Entrenamiento
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Progression Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="size-4 text-primary" />
                    <p className="font-medium text-sm">Sugerencias de Progresión</p>
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, idx) => (
                      <div key={idx} className="text-sm bg-background rounded p-2">
                        <p className="font-medium">{suggestion.exercise}</p>
                        {suggestion.suggestedWeight && (
                          <p className="text-xs text-muted-foreground">
                            Aumenta a {suggestion.suggestedWeight} kg
                          </p>
                        )}
                        {suggestion.suggestedReps && (
                          <p className="text-xs text-muted-foreground">
                            Intenta {suggestion.suggestedReps} repeticiones
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground italic">
                          {suggestion.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Routine Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Dias por semana</p>
                  <p className="text-2xl font-bold">{routine.routines.days_per_week}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duracion total</p>
                  <p className="text-2xl font-bold">{routine.routines.duration_weeks} semanas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </main>
  )
}
