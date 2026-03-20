'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, ImageIcon, Loader2 } from 'lucide-react'
import type { ProgressPhoto } from './photos-content'

const VIEW_TYPES = [
  { value: 'front', label: 'Frente' },
  { value: 'side', label: 'Perfil' },
  { value: 'back', label: 'Espalda' },
] as const

export function PhotoUpload({
  clientId,
  onSuccess,
}: {
  clientId: string
  onSuccess: (photo: ProgressPhoto) => void
}) {
  const [viewType, setViewType] = useState<string>('front')
  const [weightKg, setWeightKg] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Selecciona una imagen')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no válido. Usa JPG, PNG o WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Máximo 5 MB por imagen')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `clients/${clientId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(path, file, { upsert: false })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('progress-photos').getPublicUrl(path)

      const { data: row, error: insertError } = await supabase
        .from('progress_photos')
        .insert({
          client_id: clientId,
          photo_url: publicUrl,
          view_type: viewType,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          notes: notes || null,
          taken_at: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single()

      if (insertError) throw insertError

      onSuccess(row as ProgressPhoto)
      setFile(null)
      setWeightKg('')
      setNotes('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir'
      setError(msg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Subir foto de progreso
        </CardTitle>
        <CardDescription>
          Categoría, peso opcional y fecha automática. Máx. 5 MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Categoría</Label>
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger>
                <SelectValue placeholder="Elige vista" />
              </SelectTrigger>
              <SelectContent>
                {VIEW_TYPES.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Imagen</Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              className="mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setFile(f)
                }}
              />
              {file ? (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <ImageIcon className="w-5 h-5" />
                  {file.name}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm">Haz clic para elegir imagen</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="weight">Peso del día (kg, opcional)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              placeholder="75.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input
              id="notes"
              placeholder="Ej: post entreno piernas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={isUploading || !file}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir foto
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
