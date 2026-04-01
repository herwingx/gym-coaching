'use client'

import * as React from 'react'
import { PhotoCard, type ProgressPhoto } from './photo-card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Filter, Camera, LayoutGrid, List } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <InputGroup>
            <InputGroupAddon>
              <Search data-icon="inline-start" className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por notas o mes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] md:w-[160px]">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="front">Frente</SelectItem>
              <SelectItem value="side">Perfil</SelectItem>
              <SelectItem value="back">Espalda</SelectItem>
              <SelectItem value="other">Otras</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex rounded-md border bg-muted/50 p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="size-8"
              onClick={() => setViewMode('grid')}
              aria-label="Vista de cuadrícula"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="size-8"
              onClick={() => setViewMode('list')}
              aria-label="Vista de lista"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Groups */}
      <div className="space-y-10">
        <Accordion 
          type="multiple" 
          defaultValue={Object.keys(groupedPhotos).slice(0, 2)} 
          className="space-y-4"
        >
          {Object.entries(groupedPhotos).map(([monthYear, monthPhotos]) => (
            <AccordionItem 
              key={monthYear} 
              value={monthYear} 
              className="border border-border/50 rounded-[1.5rem] bg-card/40 px-5 overflow-hidden shadow-sm transition-all data-[state=open]:bg-card/60"
            >
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex flex-1 items-center gap-4 w-full pr-4">
                  <h4 className="text-[17px] font-bold tracking-tight capitalize">{monthYear}</h4>
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {monthPhotos.length} {monthPhotos.length === 1 ? 'foto' : 'fotos'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredPhotos.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No se encontraron fotos con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}
