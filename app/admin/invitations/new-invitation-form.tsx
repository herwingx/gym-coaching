'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { createInvitationCode } from '@/app/actions/invitations'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export function NewInvitationForm() {
  const [forRole, setForRole] = React.useState('client')
  const [isPending, setIsPending] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    formData.set('for_role', forRole)

    try {
      const result = await createInvitationCode(formData)
      if (result.success) {
        toast.success(`¡Código ${result.code} generado! Cópialo y compártelo cuando quieras.`)
        // The action revalidates the path, so the list below will update if this was in the same page
        // But since we want to clear the form:
        e.currentTarget.reset()
      } else {
        toast.error('No pudimos generar el código. Intenta de nuevo.')
      }
    } catch (error) {
      toast.error('No pudimos generar el código. Revisa tu conexión.')
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="size-5" />
          Generar nuevo código
        </CardTitle>
        <CardDescription>
          Genera códigos para asesorados o para agregar otro coach al equipo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Tipo de invitación</FieldLabel>
              <ToggleGroup 
                type="single" 
                value={forRole} 
                onValueChange={(val) => val && setForRole(val)} 
                className="justify-start"
              >
                <ToggleGroupItem value="client" className="px-4">
                  Cliente (asesorado)
                </ToggleGroupItem>
                <ToggleGroupItem value="admin" className="px-4">
                  Coach / Admin
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-xs text-muted-foreground mt-2">
                {forRole === 'admin' 
                  ? 'El código de coach crea otro administrador con acceso completo al panel.' 
                  : 'El código de cliente permite el registro de un nuevo asesorado.'}
              </p>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="email">Email (opcional)</FieldLabel>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="cliente@ejemplo.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Opcional. Si lo pones, enviamos el enlace por correo.
                </p>
              </Field>
              <Field>
                <FieldLabel htmlFor="expires_in_days">Expira en (días)</FieldLabel>
                <Input 
                  id="expires_in_days" 
                  name="expires_in_days" 
                  type="number" 
                  defaultValue={30}
                  min={1}
                  max={365}
                />
              </Field>
            </div>
          </FieldGroup>
          
          <Button type="submit" disabled={isPending}>
            <UserPlus className="size-4 mr-2" />
            {isPending ? 'Generando...' : 'Generar código'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
