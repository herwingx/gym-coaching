"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Target, 
  Dumbbell, 
  Bell,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { completeOnboarding } from '@/app/actions/onboarding'
import type { FitnessGoal, ExperienceLevel } from '@/lib/types'

interface OnboardingFlowProps {
  userId: string
  userEmail: string
}

const STEPS = [
  { id: 1, title: 'Datos Basicos', icon: User },
  { id: 2, title: 'Tu Objetivo', icon: Target },
  { id: 3, title: 'Experiencia', icon: Dumbbell },
  { id: 4, title: 'Notificaciones', icon: Bell },
]

const FITNESS_GOALS: { value: FitnessGoal; label: string; description: string }[] = [
  { value: 'lose_weight', label: 'Perder Peso', description: 'Quemar grasa y definir' },
  { value: 'gain_muscle', label: 'Ganar Musculo', description: 'Aumentar masa muscular' },
  { value: 'maintain', label: 'Mantenerme', description: 'Conservar mi forma actual' },
  { value: 'strength', label: 'Fuerza', description: 'Ser mas fuerte' },
  { value: 'endurance', label: 'Resistencia', description: 'Mejorar mi cardio' },
]

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Principiante', description: 'Menos de 6 meses entrenando' },
  { value: 'intermediate', label: 'Intermedio', description: '6 meses a 2 anos de experiencia' },
  { value: 'advanced', label: 'Avanzado', description: 'Mas de 2 anos entrenando' },
]

export function OnboardingFlow({ userId, userEmail }: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null)
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const progress = (currentStep / STEPS.length) * 100

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return fullName.trim().length >= 2 && username.trim().length >= 3
      case 2:
        return fitnessGoal !== null
      case 3:
        return experienceLevel !== null
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await completeOnboarding({
        userId,
        fullName,
        username,
        fitnessGoal: fitnessGoal!,
        experienceLevel: experienceLevel!,
        notificationsEnabled,
      })

      if (result.success) {
        toast.success('¡Bienvenido a GymCoach! Tu perfil está listo.')
        window.location.href = '/client/dashboard'
      } else {
        toast.error(result.error || 'No pudimos guardar tus datos. Intenta de nuevo.')
      }
    } catch (err) {
      console.error('[Onboarding] Error:', err)
      toast.error('Algo salió mal. Intenta de nuevo o recarga la página.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">GC</span>
            </div>
            <div>
              <h1 className="font-bold">GymCoach</h1>
              <p className="text-xs text-muted-foreground">Configuración inicial</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container py-4">
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isComplete = currentStep > step.id
            const isCurrent = currentStep === step.id
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-2 ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isComplete ? 'bg-primary text-primary-foreground' :
                  isCurrent ? 'bg-primary/20 text-primary border-2 border-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            )
          })}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Content */}
      <main id="main-content" className="flex-1 container py-6" tabIndex={-1}>
        <Card className="max-w-lg mx-auto">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Cuentanos sobre ti</CardTitle>
                <CardDescription>
                  Empecemos con lo basico para personalizar tu experiencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Juan Perez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input
                      id="username"
                      placeholder="juanperez"
                      className="pl-8"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este sera tu identificador unico en la plataforma
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Fitness Goal */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Cual es tu objetivo?</CardTitle>
                <CardDescription>
                  Esto nos ayudara a personalizar tu entrenamiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {FITNESS_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setFitnessGoal(goal.value)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      fitnessGoal === goal.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{goal.label}</p>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </button>
                ))}
              </CardContent>
            </>
          )}

          {/* Step 3: Experience Level */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Tu nivel de experiencia</CardTitle>
                <CardDescription>
                  Esto nos ayuda a sugerirte rutinas apropiadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setExperienceLevel(level.value)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      experienceLevel === level.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </button>
                ))}
              </CardContent>
            </>
          )}

          {/* Step 4: Notifications */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle>Casi listo!</CardTitle>
                <CardDescription>
                  Configura tus preferencias de notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Bell className="size-10 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Recordatorios de entrenamiento</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Te enviaremos recordatorios para que no pierdas tu racha
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant={notificationsEnabled ? 'default' : 'outline'}
                      onClick={() => setNotificationsEnabled(true)}
                      className={notificationsEnabled ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                    >
                      Activar
                    </Button>
                    <Button
                      variant={!notificationsEnabled ? 'default' : 'outline'}
                      onClick={() => setNotificationsEnabled(false)}
                    >
                      Ahora no
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="p-6 pt-0 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Atras
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? 'Guardando...' : 'Comenzar'}
                <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
