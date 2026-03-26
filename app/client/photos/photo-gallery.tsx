'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ImageIcon, Trash2 } from 'lucide-react'
import type { ProgressPhoto } from './photos-content'

const VIEW_LABELS: Record<string, string> = {
  front: 'Frente',
  side: 'Perfil',
  back: 'Espalda',
  other: 'Otra',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function PhotoGallery({
  photos,
  onDeleteSuccess,
  clientId,
}: {
  photos: ProgressPhoto[]
  onDeleteSuccess: (id: string) => void
  clientId: string
}) {
  const [filter, setFilter] = useState<string>('all')

  const filtered =
    filter === 'all'
      ? photos
      : photos.filter((p) => p.view_type === filter)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Galería cronológica</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="front">Frente</SelectItem>
            <SelectItem value="side">Perfil</SelectItem>
            <SelectItem value="back">Espalda</SelectItem>
            <SelectItem value="other">Otra</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <Empty className="border-0 bg-transparent">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImageIcon />
              </EmptyMedia>
              <EmptyTitle>Sin fotos todavía</EmptyTitle>
              <EmptyDescription>
                Sube la primera desde la pestaña <span className="font-medium">Subir</span> para empezar tu
                comparativa.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PhotoCard
                key={p.id}
                photo={p}
                onDeleteSuccess={onDeleteSuccess}
                clientId={clientId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PhotoCard({
  photo,
  onDeleteSuccess,
  clientId,
}: {
  photo: ProgressPhoto
  onDeleteSuccess: (id: string) => void
  clientId: string
}) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const supabase = createClient()
      // Extraer path del public URL para borrar de Storage
      const url = new URL(photo.photo_url)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/progress-photos\/(.+)/)
      const storagePath = pathMatch?.[1]

      if (storagePath) {
        await supabase.storage.from('progress-photos').remove([storagePath])
      }

      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photo.id)

      if (error) throw error
      onDeleteSuccess(photo.id)
    } catch {
      // fallback: al menos borrar de DB si el storage falla
      const supabase = createClient()
      await supabase.from('progress_photos').delete().eq('id', photo.id)
      onDeleteSuccess(photo.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="group relative rounded-lg border overflow-hidden bg-muted">
      <div className="aspect-4/3 relative">
        <img
          src={photo.photo_url}
          alt={VIEW_LABELS[photo.view_type || ''] || 'Foto'}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar esta foto?</AlertDialogTitle>
                <AlertDialogDescription>
                  La foto se eliminará de forma permanente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="p-3 text-sm">
        <div className="font-medium">
          {VIEW_LABELS[photo.view_type || ''] || photo.view_type || '-'} ·{' '}
          {formatDate(photo.taken_at)}
        </div>
        {photo.weight_kg != null && (
          <div className="text-muted-foreground">{photo.weight_kg} kg</div>
        )}
      </div>
    </div>
  )
}
