'use client'

import * as React from 'react'
import { ImageCompareSlider } from '@/components/ui/image-compare-slider'
import { type ProgressPhoto } from './photo-card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Layers, Calendar, Weight } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PhotoCompareProps {
  photos: ProgressPhoto[]
}

export function PhotoCompare({ photos }: PhotoCompareProps) {
  const [beforeId, setBeforeId] = React.useState<string | null>(null)
  const [afterId, setAfterId] = React.useState<string | null>(null)

  const sortedPhotos = React.useMemo(() => {
    return [...photos].sort(
      (a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime()
    )
  }, [photos])

  const before = photos.find((p) => p.id === beforeId)
  const after = photos.find((p) => p.id === afterId)

  // Auto-select first and last if not set
  React.useEffect(() => {
    if (photos.length >= 2 && !beforeId && !afterId) {
      setBeforeId(sortedPhotos[0].id)
      setAfterId(sortedPhotos[sortedPhotos.length - 1].id)
    }
  }, [photos, sortedPhotos, beforeId, afterId])

  if (photos.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Layers className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Necesitas más fotos</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Sube al menos dos fotos para poder comparar tu evolución visual.
        </p>
      </div>
    )
  }

  const renderPhotoSelector = (
    label: string,
    currentId: string | null,
    setter: (id: string) => void,
    excludeId?: string | null
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {currentId && (
          <span className="text-xs font-medium text-primary">
            {format(new Date(photos.find(p => p.id === currentId)?.taken_at || ''), "d MMM, yyyy", { locale: es })}
          </span>
        )}
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-2xl border bg-muted/30 p-2">
        <div className="flex gap-2">
          {sortedPhotos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setter(photo.id)}
              className={cn(
                'relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                currentId === photo.id
                  ? 'border-primary ring-2 ring-primary/20 scale-95'
                  : 'border-transparent hover:border-border grayscale-[0.5] hover:grayscale-0'
              )}
            >
              <Image
                src={photo.photo_url}
                alt="Miniatura"
                fill
                className="object-cover"
                sizes="80px"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[8px] text-white text-center">
                {format(new Date(photo.taken_at), 'dd/MM/yy')}
              </div>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Selectors Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {renderPhotoSelector('Estado Inicial (Antes)', beforeId, setBeforeId)}
        {renderPhotoSelector('Estado Actual (Después)', afterId, setAfterId)}
      </div>

      {/* Comparison Tool */}
      {before && after && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border bg-card shadow-2xl">
            <ImageCompareSlider
              beforeImage={before.photo_url}
              afterImage={after.photo_url}
              className="aspect-[3/4] md:aspect-video w-full"
            />
          </div>

          {/* Stats Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span className="text-xs font-medium uppercase">Fecha Inicio</span>
              </div>
              <p className="text-lg font-bold">{format(new Date(before.taken_at), "d 'de' MMMM", { locale: es })}</p>
              {before.weight_kg && (
                <div className="flex items-center gap-1.5 text-primary font-semibold">
                  <Weight className="size-4" />
                  <span>{before.weight_kg} kg</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span className="text-xs font-medium uppercase">Fecha Actual</span>
              </div>
              <p className="text-lg font-bold">{format(new Date(after.taken_at), "d 'de' MMMM", { locale: es })}</p>
              {after.weight_kg && (
                <div className="flex items-center gap-1.5 text-primary font-semibold">
                  <Weight className="size-4" />
                  <span>{after.weight_kg} kg</span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Info */}
          {(before.notes || after.notes) && (
            <div className="grid gap-4 md:grid-cols-2">
               {before.notes && (
                 <div className="text-sm italic text-muted-foreground bg-muted/30 p-3 rounded-xl border">
                   &quot;{before.notes}&quot;
                 </div>
               )}
               {after.notes && (
                 <div className="text-sm italic text-muted-foreground bg-muted/30 p-3 rounded-xl border">
                   &quot;{after.notes}&quot;
                 </div>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
