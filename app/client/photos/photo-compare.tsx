'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageCompareSlider } from '@/components/ui/image-compare-slider'
import { ImageIcon } from 'lucide-react'
import type { ProgressPhoto } from './photos-content'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const VIEW_LABELS: Record<string, string> = {
  front: 'Frente',
  side: 'Perfil',
  back: 'Espalda',
  other: 'Otra',
}

export function PhotoCompare({ photos }: { photos: ProgressPhoto[] }) {
  const [beforeId, setBeforeId] = useState<string>('')
  const [afterId, setAfterId] = useState<string>('')

  const photoOptions = useMemo(() => {
    return photos
      .slice()
      .sort(
        (a, b) =>
          new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime(),
      )
  }, [photos])

  const before = photos.find((p) => p.id === beforeId)
  const after = photos.find((p) => p.id === afterId)

  const canCompare = before && after && before.id !== after.id

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparar fotos</CardTitle>
        <CardDescription>
          Elige dos fotos para ver la diferencia con el slider. Antes (izq.) vs
          Después (der.).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {photos.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p>Necesitas al menos 2 fotos para comparar.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="photo-compare-before" className="text-sm font-medium mb-2 block">Antes</label>
                <Select value={beforeId} onValueChange={setBeforeId}>
                  <SelectTrigger id="photo-compare-before">
                    <SelectValue placeholder="Elige foto" />
                  </SelectTrigger>
                  <SelectContent>
                    {photoOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {VIEW_LABELS[p.view_type || ''] || p.view_type} ·{' '}
                        {formatDate(p.taken_at)}
                        {p.weight_kg != null ? ` · ${p.weight_kg}kg` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="photo-compare-after" className="text-sm font-medium mb-2 block">Después</label>
                <Select value={afterId} onValueChange={setAfterId}>
                  <SelectTrigger id="photo-compare-after">
                    <SelectValue placeholder="Elige foto" />
                  </SelectTrigger>
                  <SelectContent>
                    {photoOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {VIEW_LABELS[p.view_type || ''] || p.view_type} ·{' '}
                        {formatDate(p.taken_at)}
                        {p.weight_kg != null ? ` · ${p.weight_kg}kg` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {canCompare && before && after && (
              <div className="space-y-3">
                <ImageCompareSlider
                  beforeImage={before.photo_url}
                  afterImage={after.photo_url}
                  beforeLabel={`${formatDate(before.taken_at)}${before.weight_kg != null ? ` · ${before.weight_kg}kg` : ''}`}
                  afterLabel={`${formatDate(after.taken_at)}${after.weight_kg != null ? ` · ${after.weight_kg}kg` : ''}`}
                  className="max-w-2xl mx-auto"
                />
              </div>
            )}

            {beforeId && afterId && before?.id === after?.id && (
              <p className="text-sm text-muted-foreground">
                Elige dos fotos diferentes para comparar.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
