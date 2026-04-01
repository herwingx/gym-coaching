'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { ProfileAvatarSection } from '@/components/profile/profile-avatar-section'

export function CoachProfileSettings({
  userId,
  initialFullName,
  initialAvatarUrl,
}: {
  userId: string
  initialFullName?: string | null
  initialAvatarUrl?: string | null
}) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(initialFullName ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() || null })
        .eq('id', userId)

      if (error) {
        toast.error('No pudimos guardar el nombre.')
        return
      }

      toast.success('Perfil actualizado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfileAvatarSection
        userId={userId}
        initialUrl={initialAvatarUrl}
        title="Tu foto"
        description="La verán tus asesorados en mensajes. JPG, PNG o WebP · máx. 2 MB."
      />
      <Card className="border-muted/60 shadow-sm">
        <CardHeader>
          <CardTitle>Tu nombre</CardTitle>
          <CardDescription>Así apareces para tus asesorados en la app.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="coach-full-name">Nombre completo</FieldLabel>
                <Input
                  id="coach-full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  placeholder="Tu nombre y apellido"
                />
              </Field>
            </FieldGroup>
            
            <div className="border-t pt-4">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? 'Guardando…' : 'Guardar nombre'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
