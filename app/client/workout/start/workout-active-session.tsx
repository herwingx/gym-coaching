"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CircularProgress } from '@/components/ui/circular-progress'
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  Check, 
  Trophy,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Timer
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { calculate1RM } from '@/lib/types'
import type { RoutineDay, RoutineExercise, PersonalRecord, Exercise } from '@/lib/types'
import { ExerciseDetailDrawer } from '@/components/client/exercise-detail-drawer'
import { Badge } from '@/components/ui/badge'

interface WorkoutActiveSessionProps {
  clientId: string
  routineDay: RoutineDay & { routine_exercises: (RoutineExercise & { exercises: any })[] }
  routineName: string
  previousLogs: { exercise_id: string; weight_kg: number; reps: number }[]
  personalRecords: PersonalRecord[]
}

interface SetLog {
  setNumber: number
  weight: number
  reps: number
  rpe?: number
  completed: boolean
  isPR: boolean
}

export function WorkoutActiveSession({
  clientId,
  routineDay,
  routineName,
  previousLogs,
  personalRecords,
}: WorkoutActiveSessionProps) {
  const router = useRouter()
  const exercises = routineDay.routine_exercises || []
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [sets, setSets] = useState<Map<string, SetLog[]>>(new Map())
  const [isResting, setIsResting] = useState(false)
  const [restTime, setRestTime] = useState(0)
  const [totalRestTime, setTotalRestTime] = useState(90)
  const [workoutStartTime] = useState(Date.now())
  const [isPaused, setIsPaused] = useState(false)
  
  // Drawer state
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const currentExercise = exercises[currentExerciseIndex]
  const currentSets = sets.get(currentExercise?.id?.toString()) || []

  // Initialize sets for current exercise
  useEffect(() => {
    if (currentExercise && !sets.has(currentExercise.id.toString())) {
      const initialSets: SetLog[] = Array.from(
        { length: currentExercise.sets },
        (_, i) => ({
          setNumber: i + 1,
          weight: getSuggestedWeight(currentExercise.exercise_id),
          reps: parseInt(currentExercise.reps || '10'),
          completed: false,
          isPR: false,
        })
      )
      setSets(new Map(sets).set(currentExercise.id.toString(), initialSets))
    }
  }, [currentExercise])

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTime > 0 && !isPaused) {
      interval = setInterval(() => {
        setRestTime((t) => t - 1)
      }, 1000)
    } else if (restTime === 0 && isResting) {
      setIsResting(false)
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      toast.success('Descanso terminado. ¡Siguiente serie!')
    }
    return () => clearInterval(interval)
  }, [isResting, restTime, isPaused])

  const getSuggestedWeight = (exerciseId: string): number => {
    const prev = previousLogs.find((l) => l.exercise_id === exerciseId)
    return prev?.weight_kg || 20
  }

  const checkForPR = (exerciseId: string, weight: number, reps: number): boolean => {
    const currentPR = personalRecords.find((pr) => pr.exercise_id === exerciseId)
    if (!currentPR) return true
    const newEstimated1RM = calculate1RM(weight, reps)
    return newEstimated1RM > (currentPR.estimated_1rm || 0)
  }

  const completeSet = (setIndex: number) => {
    if (!currentExercise) return
    
    const updatedSets = [...currentSets]
    const set = updatedSets[setIndex]
    
    // Check for PR
    const isPR = checkForPR(currentExercise.exercise_id, set.weight, set.reps)
    set.completed = true
    set.isPR = isPR
    
    setSets(new Map(sets).set(currentExercise.id.toString(), updatedSets))
    
    if (isPR) {
      toast.success('¡Nuevo récord personal!', {
        description: `${set.weight} kg × ${set.reps} repeticiones`,
        icon: <Trophy className="w-5 h-5 text-primary" />,
      })
    }
    
    // Start rest timer if not last set
    if (setIndex < currentSets.length - 1) {
      setRestTime(currentExercise.rest_seconds || 90)
      setTotalRestTime(currentExercise.rest_seconds || 90)
      setIsResting(true)
    }
  }

  const updateSetValue = (setIndex: number, field: 'weight' | 'reps', delta: number) => {
    if (!currentExercise) return
    
    const updatedSets = [...currentSets]
    const set = updatedSets[setIndex]
    
    if (field === 'weight') {
      set.weight = Math.max(0, set.weight + delta)
    } else {
      set.reps = Math.max(1, set.reps + delta)
    }
    
    setSets(new Map(sets).set(currentExercise.id.toString(), updatedSets))
  }

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setIsResting(false)
    }
  }

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setIsResting(false)
    }
  }

  const finishWorkout = async () => {
    // Calculate total volume
    let totalVolume = 0
    sets.forEach((exerciseSets) => {
      exerciseSets.forEach((set) => {
        if (set.completed) {
          totalVolume += set.weight * set.reps
        }
      })
    })

    const duration = Math.round((Date.now() - workoutStartTime) / 60000)
    
    toast.success('¡Entrenamiento completado!', {
      description: `${duration} min de entreno · ${(totalVolume / 1000).toFixed(1)} t de volumen total`,
    })
    
    router.push('/client/dashboard')
  }

  const skipRest = () => {
    setIsResting(false)
    setRestTime(0)
  }

  const completedSetsCount = currentSets.filter((s) => s.completed).length
  const allSetsCompleted = completedSetsCount === currentSets.length && currentSets.length > 0

  return (
    <div id="main-content" role="main" className="min-h-dvh bg-background flex flex-col" tabIndex={-1}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur safe-area-header-pt">
        <div className="container flex items-center justify-between py-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/client/dashboard')} aria-label="Volver al dashboard">
            <X className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{routineName}</p>
            <p className="font-semibold">{routineDay.day_name}</p>
          </div>
          <Button 
            variant="default" 
            size="sm"
            onClick={finishWorkout}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Terminar
          </Button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Rest Timer Overlay */}
      {isResting && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col items-center justify-center p-6">
          <p className="text-sm text-muted-foreground mb-4">DESCANSO</p>
          <CircularProgress 
            value={restTime} 
            max={totalRestTime}
            size={200}
            strokeWidth={8}
          >
            <div className="text-center">
              <span className="text-5xl font-bold">{restTime}</span>
              <p className="text-sm text-muted-foreground">segundos</p>
            </div>
          </CircularProgress>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" size="lg" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button variant="default" size="lg" onClick={skipRest} className="bg-primary text-primary-foreground">
              <SkipForward className="w-5 h-5 mr-2" />
              Saltar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            Siguiente: Serie {completedSetsCount + 1} de {currentSets.length}
          </p>
        </div>
      )}

      {/* Exercise Content */}
      <main className="flex-1 container py-6 space-y-6">
        {currentExercise && (
          <>
            {/* Exercise Header */}
            <div className="flex items-center justify-between mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={prevExercise}
                disabled={currentExerciseIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ejercicio {currentExerciseIndex + 1} de {exercises.length}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextExercise}
                disabled={currentExerciseIndex === exercises.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div 
              className="bg-card border rounded-2xl p-4 shadow-sm flex gap-4 items-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedExercise(currentExercise.exercises)
                setDetailOpen(true)
              }}
            >
              <div className="size-20 shrink-0 bg-muted rounded-xl overflow-hidden relative shadow-sm border border-border/50">
                {currentExercise.exercises?.gif_url ? (
                  <img
                    src={currentExercise.exercises.gif_url}
                    alt={currentExercise.exercises.name}
                    className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-muted-foreground">
                    GIF
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold capitalize truncate leading-tight mb-1">
                  {currentExercise.exercises?.name}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase font-semibold h-4">
                    {currentExercise.exercises?.primary_muscle || 'General'}
                  </Badge>
                  {currentExercise.exercises?.equipment && (
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase font-semibold h-4 text-muted-foreground border-border/60">
                      {currentExercise.exercises.equipment}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-primary">
                  {currentExercise.sets} series x {currentExercise.reps || 'var'} reps
                </p>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-3">
              {currentSets.map((set, index) => (
                <Card 
                  key={index}
                  className={`transition-all ${
                    set.completed 
                      ? set.isPR 
                        ? 'border-primary bg-primary/10' 
                        : 'border-success/50 bg-success/5'
                      : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Set number */}
                      <div className={`size-10 rounded-full flex items-center justify-center font-bold ${
                        set.completed ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {set.completed ? <Check className="w-5 h-5" /> : set.setNumber}
                      </div>

                      {/* Weight control */}
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Peso (kg)</p>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateSetValue(index, 'weight', -2.5)}
                            disabled={set.completed}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={set.weight}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0
                              const updatedSets = [...currentSets]
                              updatedSets[index].weight = val
                              setSets(new Map(sets).set(currentExercise.id.toString(), updatedSets))
                            }}
                            className="w-16 text-center font-bold"
                            disabled={set.completed}
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateSetValue(index, 'weight', 2.5)}
                            disabled={set.completed}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Reps control */}
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Reps</p>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateSetValue(index, 'reps', -1)}
                            disabled={set.completed}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1
                              const updatedSets = [...currentSets]
                              updatedSets[index].reps = val
                              setSets(new Map(sets).set(currentExercise.id.toString(), updatedSets))
                            }}
                            className="w-12 text-center font-bold"
                            disabled={set.completed}
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateSetValue(index, 'reps', 1)}
                            disabled={set.completed}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Complete button */}
                      <Button
                        variant={set.completed ? "outline" : "default"}
                        size="icon"
                        className={`h-10 w-10 ${!set.completed ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                        onClick={() => completeSet(index)}
                        disabled={set.completed}
                      >
                        <Check className="w-5 h-5" />
                      </Button>
                    </div>
                    {set.isPR && (
                      <div className="flex items-center gap-2 mt-2 text-primary">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-medium">Nuevo Record Personal!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Next Exercise Button */}
            {allSetsCompleted && currentExerciseIndex < exercises.length - 1 && (
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                onClick={nextExercise}
              >
                Siguiente Ejercicio
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}

            {/* Finish Button */}
            {allSetsCompleted && currentExerciseIndex === exercises.length - 1 && (
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                onClick={finishWorkout}
              >
                Finalizar Entrenamiento
                <Trophy className="w-5 h-5 ml-2" />
              </Button>
            )}
          </>
        )}
      </main>

      <ExerciseDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        exercise={selectedExercise}
      />
    </div>
  )
}
