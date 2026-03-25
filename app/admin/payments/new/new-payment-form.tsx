'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { registerPayment } from '@/app/actions/payments'
import { toast } from 'sonner'
import { addDays, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Client {
  id: string
  full_name: string
  email: string
}

interface Plan {
  id: string
  name: string
  price: number
  duration_days: number
}

interface NewPaymentFormProps {
  clients: Client[]
  plans: Plan[]
}

export function NewPaymentForm({ clients, plans }: NewPaymentFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [openClientSelect, setOpenClientSelect] = React.useState(false)
  const [selectedClientId, setSelectedClientId] = React.useState<string>('')
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>('none')
  const [amount, setAmount] = React.useState<string>('')
  const [paymentMethod, setPaymentMethod] = React.useState<string>('cash')
  const [periodStart, setPeriodStart] = React.useState<Date | undefined>(new Date())
  const [periodEnd, setPeriodEnd] = React.useState<Date | undefined>(addDays(new Date(), 30))

  // Handle plan selection to auto-fill amount and dates
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId)
    if (planId === 'none') {
      setAmount('')
      return
    }

    const plan = plans.find((p) => p.id === planId)
    if (plan) {
      setAmount(plan.price.toString())
      
      const start = periodStart || new Date()
      setPeriodStart(start)
      
      if (plan.duration_days) {
        setPeriodEnd(addDays(start, plan.duration_days))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedClientId) {
      toast.error('Selecciona un asesorado para registrar el pago.')
      return
    }

    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    
    formData.set('clientId', selectedClientId)
    formData.set('planId', selectedPlanId === 'none' ? '' : selectedPlanId)
    formData.set('amount', amount)
    formData.set('paymentMethod', paymentMethod)
    formData.set('periodStart', periodStart ? format(periodStart, 'yyyy-MM-dd') : '')
    formData.set('periodEnd', periodEnd ? format(periodEnd, 'yyyy-MM-dd') : '')

    try {
      await registerPayment(formData)
      toast.success('¡Pago registrado correctamente!')
      router.push('/admin/payments')
      router.refresh()
    } catch (error) {
      toast.error('No pudimos registrar el pago. Revisa los datos e intenta de nuevo.')
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="clientId">Asesorado *</FieldLabel>
              <Popover open={openClientSelect} onOpenChange={setOpenClientSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openClientSelect}
                    className="w-full justify-between font-normal"
                  >
                    {selectedClientId
                      ? `${selectedClient?.full_name} (${selectedClient?.email})`
                      : "Seleccionar asesorado..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar asesorado..." />
                    <CommandList>
                      <CommandEmpty>No se encontró el asesorado.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.full_name}
                            onSelect={() => {
                              setSelectedClientId(client.id)
                              setOpenClientSelect(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClientId === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{client.full_name}</span>
                              <span className="text-xs text-muted-foreground">{client.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel htmlFor="planId">Plan de Membresía</FieldLabel>
              <Select value={selectedPlanId} onValueChange={handlePlanChange}>
                <SelectTrigger id="planId" className="w-full">
                  <SelectValue placeholder="Sin plan específico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">Sin plan específico</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="amount">Monto *</FieldLabel>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Al seleccionar un plan se sugiere el precio; puedes personalizarlo.
                </p>
              </Field>
              <Field>
                <FieldLabel htmlFor="paymentMethod">Método de Pago</FieldLabel>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod" className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Período Inicio</FieldLabel>
                <DatePicker 
                  date={periodStart} 
                  setDate={setPeriodStart} 
                />
              </Field>
              <Field>
                <FieldLabel>Período Fin</FieldLabel>
                <DatePicker 
                  date={periodEnd} 
                  setDate={setPeriodEnd} 
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="reference">Referencia</FieldLabel>
              <Input
                id="reference"
                name="reference"
                placeholder="Número de recibo o referencia"
              />
            </Field>
          </FieldGroup>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Registrando...' : 'Registrar Pago'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" disabled={isPending} asChild>
              <Link href="/admin/payments">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
