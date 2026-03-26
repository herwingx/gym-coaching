'use client'

import * as React from 'react'
import { PhotoCard, type ProgressPhoto } from './photo-card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Filter, Camera, LayoutGrid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PhotoGalleryProps {
  photos: ProgressPhoto[]
  onDeleteSuccess?: (id: string) => void
  onView?: (photo: ProgressPhoto) => void
  showActions?: boolean
}

export function PhotoGallery({
  photos,
  onDeleteSuccess,
  onView,
  showActions = true,
}: PhotoGalleryProps) {
  const [filter, setFilter] = React.useState<string>('all')
  const [search, setSearch] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  const filteredPhotos = React.useMemo(() => {
    return photos
      .filter((p) => (filter === 'all' ? true : p.view_type === filter))
      .filter((p) => {
        if (!search) return true
        const searchLower = search.toLowerCase()
        return (
          p.notes?.toLowerCase().includes(searchLower) ||
          p.view_type?.toLowerCase().includes(searchLower) ||
          format(new Date(p.taken_at), 'MMMM', { locale: es }).includes(searchLower)
        )
      })
      .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime())
  }, [photos, filter, search])

  // Group by Month and Year
  const groupedPhotos = React.useMemo(() => {
    const groups: Record<string, ProgressPhoto[]> = {}
    filteredPhotos.forEach((photo) => {
      const monthYear = format(new Date(photo.taken_at), 'MMMM yyyy', { locale: es })
      if (!groups[monthYear]) groups[monthYear] = []
      groups[monthYear].push(photo)
    })
    return groups
  }, [filteredPhotos])

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Camera className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Sin fotos aún</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Comienza a documentar tu progreso subiendo tu primera foto.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por notas o mes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-11 rounded-xl">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="front">Frente</SelectItem>
              <SelectItem value="side">Perfil</SelectItem>
              <SelectItem value="back">Espalda</SelectItem>
              <SelectItem value="other">Otras</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="hidden sm:flex border rounded-xl p-1 bg-muted/50">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="size-9 rounded-lg"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="size-9 rounded-lg"
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Groups */}
      <div className="space-y-10">
        {Object.entries(groupedPhotos).map(([monthYear, monthPhotos]) => (
          <div key={monthYear} className="space-y-4">
            <div className="flex items-center gap-4">
              <h4 className="text-lg font-bold capitalize">{monthYear}</h4>
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {monthPhotos.length} {monthPhotos.length === 1 ? 'foto' : 'fotos'}
              </span>
            </div>

            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1 max-w-2xl mx-auto'
              )}
            >
              {monthPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onDelete={onDeleteSuccess}
                  onView={onView}
                  showActions={showActions}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No se encontraron fotos con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}
