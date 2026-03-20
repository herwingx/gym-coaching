'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { toast } from 'sonner'
import { updateGymSettings } from '@/app/actions/gym-settings'
import { 
  Building2, 
  Phone, 
  Clock, 
  Globe2, 
  Coins, 
  Save,
  Info
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { 
  InputGroup, 
  InputGroupAddon, 
  InputGroupInput 
} from '@/components/ui/input-group'

interface GymSettingsFormProps {
  initialData: {
    gym_name: string
    phone?: string
    schedule?: string
    currency: string
    timezone: string
  } | null
}

const CURRENCIES = [
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
]

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México' },
  { value: 'America/New_York', label: 'Nueva York' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles' },
  { value: 'America/Chicago', label: 'Chicago' },
  { value: 'Europe/Madrid', label: 'Madrid' },
]

export function GymSettingsForm({ initialData }: GymSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [gymName, setGymName] = useState(initialData?.gym_name ?? 'Mi marca')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [schedule, setSchedule] = useState(initialData?.schedule ?? '')
  const [currency, setCurrency] = useState(initialData?.currency ?? 'MXN')
  const [timezone, setTimezone] = useState(initialData?.timezone ?? 'America/Mexico_City')

  useEffect(() => {
    if (initialData) {
      setGymName(initialData.gym_name)
      setPhone(initialData.phone ?? '')
      setSchedule(initialData.schedule ?? '')
      setCurrency(initialData.currency ?? 'MXN')
      setTimezone(initialData.timezone ?? 'America/Mexico_City')
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gymName.trim()) {
      toast.error('El nombre de tu marca o gimnasio es obligatorio.')
      return
    }
    setLoading(true)
    const result = await updateGymSettings({
      gym_name: gymName.trim(),
      phone: phone.trim() || undefined,
      schedule: schedule.trim() || undefined,
      currency,
      timezone,
    })
    setLoading(false)
    if (result.success) {
      toast.success('¡Configuración guardada correctamente!')
      router.refresh()
    } else {
      toast.error('No pudimos guardar los cambios. Revisa los datos e intenta de nuevo.')
    }
  }

  return (
    <Card className="shadow-md border-muted/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Tu marca o negocio</CardTitle>
        <CardDescription>
          Configura el nombre de tu negocio, contacto y preferencias
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="space-y-6">
            {/* Identidad */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Identidad
              </h3>
              <Field>
                <FieldLabel htmlFor="gym_name">Nombre de tu Marca o Gimnasio</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Building2 data-icon="inline-start" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="gym_name"
                    placeholder="Mi marca / Gimnasio"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    required
                    className="h-11"
                  />
                </InputGroup>
              </Field>
            </div>

            {/* Contacto y Horario */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contacto y Horario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="phone">Teléfono de contacto</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Phone data-icon="inline-start" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="phone"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11"
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="schedule">Horario de Servicio</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Clock data-icon="inline-start" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="schedule"
                      placeholder="Lun-Vie 6:00-22:00"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      className="h-11"
                    />
                  </InputGroup>
                </Field>
              </div>
            </div>

            {/* Preferencias */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Preferencias Locales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Moneda de cobro</FieldLabel>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full h-11 pl-3 bg-background border-muted hover:border-muted-foreground/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Coins className="size-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Zona horaria</FieldLabel>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="w-full h-11 pl-3 bg-background border-muted hover:border-muted-foreground/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Globe2 className="size-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button type="submit" disabled={loading} className="w-full md:w-fit px-8 h-11 gap-2 font-semibold shadow-xs">
              {loading ? (
                <>Guardando...</>
              ) : (
                <>
                  <Save data-icon="inline-start" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
