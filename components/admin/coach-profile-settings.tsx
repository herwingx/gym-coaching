'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card>
        <CardHeader>
          <CardTitle>Tu nombre</CardTitle>
          <CardDescription>Así apareces para tus asesorados en la app.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <label htmlFor="coach-full-name" className="text-sm font-medium">
              Nombre completo
            </label>
            <Input
              id="coach-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2"
              autoComplete="name"
            />
          </div>
          <Button type="button" onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Guardando…' : 'Guardar nombre'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
