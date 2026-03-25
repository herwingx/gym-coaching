'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dumbbell, Check, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { completeAdminOnboarding } from '@/app/actions/admin-onboarding'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdminOnboardingFlowProps {
  userId: string
  gymName: string
}

export function AdminOnboardingFlow({ userId, gymName }: AdminOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gymNameLocal, setGymNameLocal] = useState(gymName)
  const [timezone, setTimezone] = useState('America/Mexico_City')
  const [currency, setCurrency] = useState('MXN')

  const progress = 50

  const handleComplete = async () => {
    setIsSubmitting(true)

    try {
      const result = await completeAdminOnboarding({
        userId,
        gymName: gymNameLocal,
        timezone,
        currency,
      })

      if (result.success) {
        toast.success('¡Configuración guardada! Ya puedes gestionar tus asesorados.')
        window.location.href = '/admin/dashboard'
      } else {
        toast.error('No pudimos guardar la configuración. Intenta de nuevo.')
      }
    } catch {
      toast.error('Algo salió mal al guardar. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="border-b">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold">GymCoach</h1>
              <p className="text-xs text-muted-foreground">Configuración inicial</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`size-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <div className="flex-1 h-0.5 bg-muted" />
          <div
            className={`size-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <main className="flex-1 container py-6">
        <Card className="max-w-lg mx-auto">
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>
                  Revisa y ajusta los datos de tu marca o negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="gym_name">Tu marca o negocio</Label>
                  <Input
                    id="gym_name"
                    placeholder="Ej: Coach Juan, CrossFit Central, etc."
                    value={gymNameLocal}
                    onChange={(e) => setGymNameLocal(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue placeholder="Seleccionar zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">America/Mexico City</SelectItem>
                      <SelectItem value="America/New_York">America/New York</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                      <SelectItem value="America/Bogota">America/Bogota</SelectItem>
                      <SelectItem value="America/Argentina/Buenos_Aires">America/Argentina</SelectItem>
                      <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN (Peso Mexicano)</SelectItem>
                      <SelectItem value="USD">USD (Dolar)</SelectItem>
                      <SelectItem value="COP">COP (Peso Colombiano)</SelectItem>
                      <SelectItem value="ARS">ARS (Peso Argentino)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>¡Listo para empezar!</CardTitle>
                <CardDescription>
                  Tu cuenta está configurada. Crea rutinas, agrega asesorados y sigue su progreso.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="size-10 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Bienvenido a GymCoach</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>{gymNameLocal}</strong> está listo. Gestiona tus asesorados y cobra por tus asesorías.
                  </p>
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end">
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? 'Guardando...' : 'Empezar a usar GymCoach'}
                  <Check className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  )
}
