'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Upload, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

interface Profile {
  id: string
  username?: string
  avatar_url?: string
  full_name?: string
  email?: string
  phone?: string
  gender?: string
  birth_date?: string
  fitness_goal?: string
  experience_level?: string
  xp_points?: number
  level?: number
  streak_days?: number
}

export function UserProfileContent({
  initialProfile,
  userId,
  userEmail,
}: {
  initialProfile: Profile
  userId: string
  userEmail: string
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile || {})
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileName = `${userId}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        toast.error('No pudimos subir la foto. Intenta con otra imagen.')
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId)

      if (updateError) {
        toast.error('No pudimos actualizar el perfil. Intenta de nuevo.')
        return
      }

      setProfile({ ...profile, avatar_url: data.publicUrl })
      toast.success('¡Foto de perfil actualizada!')
    } catch (err) {
      toast.error('No pudimos procesar la foto. Usa una imagen más pequeña.')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          full_name: profile.full_name,
          phone: profile.phone,
          gender: profile.gender,
          birth_date: profile.birth_date,
          fitness_goal: profile.fitness_goal,
          experience_level: profile.experience_level,
        })
        .eq('id', userId)

      if (error) {
        toast.error('No pudimos guardar. Intenta de nuevo.')
        return
      }

      toast.success('¡Perfil actualizado!')
    } catch (err) {
      toast.error('No pudimos guardar el perfil. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="relative size-24 rounded-full overflow-hidden bg-muted border-2 border-primary/20">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="avatar-upload">
                <Button asChild variant="outline" disabled={uploading}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Subiendo...' : 'Cambiar Foto'}
                  </span>
                </Button>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={userEmail} disabled className="mt-2 bg-muted" />
          </div>

          <div>
            <label className="text-sm font-medium">Nombre de Usuario</label>
            <Input
              value={profile.username || ''}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              placeholder="Tu nombre de usuario único"
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nombre Completo</label>
            <Input
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Tu nombre completo"
              className="mt-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Tu número de teléfono"
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fecha de Nacimiento</label>
              <div className="mt-2">
                <DatePicker
                  date={profile.birth_date ? new Date(profile.birth_date) : undefined}
                  setDate={(date) =>
                    setProfile({
                      ...profile,
                      birth_date: date ? date.toISOString().split('T')[0] : undefined,
                    })
                  }
                  placeholder="Tu fecha de nacimiento"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Género</label>
            <div className="mt-2">
              <Select
                value={profile.gender || ''}
                onValueChange={(value) => setProfile({ ...profile, gender: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled className="hidden">Seleccionar</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fitness Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Fitness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Objetivo Fitness</label>
            <div className="mt-2">
              <Select
                value={profile.fitness_goal || ''}
                onValueChange={(value) => setProfile({ ...profile, fitness_goal: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Perder Peso</SelectItem>
                  <SelectItem value="gain_muscle">Ganar Músculo</SelectItem>
                  <SelectItem value="maintain">Mantener</SelectItem>
                  <SelectItem value="strength">Fuerza</SelectItem>
                  <SelectItem value="endurance">Resistencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Nivel de Experiencia</label>
            <div className="mt-2">
              <Select
                value={profile.experience_level || ''}
                onValueChange={(value) => setProfile({ ...profile, experience_level: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {profile.xp_points !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Nivel</p>
                <p className="text-3xl font-bold text-primary">{profile.level || 1}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Experiencia</p>
                <p className="text-3xl font-bold text-primary">{profile.xp_points || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Racha</p>
                <p className="text-3xl font-bold text-primary">{profile.streak_days || 0} días</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button onClick={handleSaveProfile} size="lg" className="w-full" disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  )
}
