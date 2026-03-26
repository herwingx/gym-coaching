'use client'

import * as React from 'react'
import Image from 'next/image'
import { MoreVertical, Trash2, Calendar, Weight, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ProgressPhoto {
  id: string
  photo_url: string
  view_type: string | null
  weight_kg: number | null
  notes: string | null
  taken_at: string
  created_at: string
}

const VIEW_LABELS: Record<string, string> = {
  front: 'Frente',
  side: 'Perfil',
  back: 'Espalda',
  other: 'Otra',
}

interface PhotoCardProps {
  photo: ProgressPhoto
  onDelete?: (id: string) => void
  onView?: (photo: ProgressPhoto) => void
  className?: string
  showActions?: boolean
}

export function PhotoCard({
  photo,
  onDelete,
  onView,
  className,
  showActions = true,
}: PhotoCardProps) {
  const date = new Date(photo.taken_at)
  const formattedDate = format(date, "d 'de' MMMM, yyyy", { locale: es })
  const viewLabel = VIEW_LABELS[photo.view_type || ''] || photo.view_type || 'General'

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Image
          src={photo.photo_url}
          alt={`Progreso - ${viewLabel}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        
        {/* Overlay Badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 bg-gradient-to-b from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white/90">
            {viewLabel}
          </Badge>
          
          {showActions && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-8 bg-white/90 text-black hover:bg-white"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(photo.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* View/Zoom Button */}
        {onView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/20">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shadow-lg"
              onClick={() => onView(photo)}
            >
              <Eye className="mr-2 size-4" />
              Ver detalle
            </Button>
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>{formattedDate}</span>
          </div>
          {photo.weight_kg && (
            <div className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Weight className="size-3" />
              <span>{photo.weight_kg} kg</span>
            </div>
          )}
        </div>
        
        {photo.notes && (
          <p className="text-xs text-muted-foreground line-clamp-1 italic">
            &quot;{photo.notes}&quot;
          </p>
        )}
      </div>
    </div>
  )
}
