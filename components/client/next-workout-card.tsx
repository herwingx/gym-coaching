"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Dumbbell, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { RoutineDay, RoutineExercise } from "@/lib/types"

interface NextWorkoutCardProps {
  routineDay?: RoutineDay & { routine_exercises?: RoutineExercise[] }
  routineName?: string
}

export function NextWorkoutCard({ routineDay, routineName }: NextWorkoutCardProps) {
  if (!routineDay) {
    return (
      <Card className="overflow-hidden border-dashed bg-muted/30">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="size-14 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <Dumbbell className="size-7 text-muted-foreground" />
          </div>
          <h3 className="font-bold mb-1">Sin rutina asignada</h3>
          <p className="text-sm text-muted-foreground">
            Tu entrenador te asignará una rutina pronto
          </p>
        </CardContent>
      </Card>
    )
  }

  const exerciseCount = routineDay.routine_exercises?.length || 0
  const estimatedTime = exerciseCount * 5 // 5 min per exercise estimate

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Próximo entrenamiento
            </p>
            <CardTitle className="text-xl mt-1">
              {routineDay.day_name || `Dia ${routineDay.day_number}`}
            </CardTitle>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {routineName}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Quick stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" />
            <span>{exerciseCount} ejercicios</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>~{estimatedTime} min</span>
          </div>
        </div>

        {/* Exercise preview */}
        {routineDay.routine_exercises && routineDay.routine_exercises.length > 0 && (
          <div className="flex flex-col gap-2">
            {routineDay.routine_exercises.slice(0, 3).map((ex, i) => (
              <div 
                key={ex.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  <span className="font-medium">{ex.exercises?.name || 'Ejercicio'}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {ex.sets}x{ex.reps || 'var'}
                </span>
              </div>
            ))}
            {exerciseCount > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{exerciseCount - 3} ejercicios más
              </p>
            )}
          </div>
        )}

        {/* Start button */}
        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 group">
          <Link href={`/client/workout/start`}>
            <Play className="size-4 mr-2 shrink-0 group-hover:scale-110 transition-transform duration-200 motion-reduce:group-hover:scale-100" />
            Comenzar Entrenamiento
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
