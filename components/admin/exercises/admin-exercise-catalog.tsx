'use client'

import { useMemo, useState } from 'react'
import type { Exercise } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Library, Search as SearchIcon, Eye, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExerciseDetailDrawer } from '@/components/client/exercise-detail-drawer'

interface AdminExerciseCatalogProps {
  exercises: Exercise[]
}

export function AdminExerciseCatalog({ exercises }: AdminExerciseCatalogProps) {
  const [search, setSearch] = useState('')
  const [activeBodyPart, setActiveBodyPart] = useState<string | null>(null)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const bodyParts = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((ex) => {
      ex.body_parts?.forEach((bp) => set.add(bp))
    })
    return Array.from(set).sort()
  }, [exercises])

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch = search
        ? ex.name.toLowerCase().includes(search.toLowerCase())
        : true
      const matchBodyPart = activeBodyPart ? ex.body_parts?.includes(activeBodyPart) : true
      return matchSearch && matchBodyPart
    })
  }, [exercises, search, activeBodyPart])

  const openDetail = (ex: Exercise) => {
    setDetailExercise(ex)
    setDetailOpen(true)
  }

  const clearFilters = () => {
    setSearch('')
    setActiveBodyPart(null)
  }

  const hasActiveFilters = Boolean(search.trim() || activeBodyPart)

  return (
    <>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-[max(6.5rem,env(safe-area-inset-top,0px))] lg:col-span-4 lg:self-start xl:col-span-3">
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-muted/40 to-muted/10 p-1 ring-1 ring-primary/5">
            <div
              className="pointer-events-none absolute -right-8 -top-12 size-32 rounded-full bg-primary/10 blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-4 rounded-[0.875rem] bg-card/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Library className="size-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Biblioteca</p>
                  <p className="text-[11px] leading-tight text-muted-foreground">Filtra sin perder contexto</p>
                </div>
              </div>

              <div className="relative">
                <SearchIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  placeholder="Buscar por nombre…"
                  className="h-11 rounded-xl border-border/80 bg-background pl-10 shadow-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar ejercicios"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <SlidersHorizontal className="size-3" aria-hidden />
                  Zona muscular
                </p>
                <div className="flex max-h-[min(40vh,16rem)] flex-wrap gap-2 overflow-y-auto pr-1 lg:max-h-[min(50vh,20rem)]">
                  <Badge
                    variant={!activeBodyPart ? 'default' : 'secondary'}
                    className={cn(
                      'h-9 shrink-0 cursor-pointer rounded-full px-3 text-xs font-medium',
                      activeBodyPart ? 'hover:bg-secondary/80' : '',
                    )}
                    onClick={() => setActiveBodyPart(null)}
                  >
                    Todas
                  </Badge>
                  {bodyParts.map((bp) => (
                    <Badge
                      key={bp}
                      variant={activeBodyPart === bp ? 'default' : 'outline'}
                      className="h-9 shrink-0 cursor-pointer rounded-full px-3 text-xs font-medium capitalize"
                      onClick={() => setActiveBodyPart(activeBodyPart === bp ? null : bp)}
                    >
                      {bp}
                    </Badge>
                  ))}
                </div>
              </div>

              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-full text-muted-foreground"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
              ) : null}
            </div>
          </div>

          <p className="hidden text-xs leading-relaxed text-muted-foreground lg:block text-pretty">
            Vista muestra hasta tres columnas en pantallas anchas. Usa la ficha para GIF, técnica y notas.
          </p>
        </aside>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 xl:col-span-9">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="tabular-nums font-semibold text-foreground">{filtered.length}</span>
              <span className="mx-1">/</span>
              <span className="tabular-nums">{exercises.length}</span>
              <span className="ml-1">ejercicios</span>
              {activeBodyPart ? (
                <span className="mt-1 block text-xs capitalize sm:mt-0 sm:ml-2 sm:inline">
                  · zona <span className="font-medium text-foreground">{activeBodyPart}</span>
                </span>
              ) : null}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/10 px-4 py-16 text-center ring-1 ring-primary/5">
              <p className="font-medium text-foreground">Sin resultados</p>
              <p className="max-w-sm text-sm text-muted-foreground text-pretty">
                Prueba otra búsqueda o quita filtros de zona.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3"
              role="list"
            >
              {filtered.map((ex) => (
                <article
                  key={ex.id}
                  role="listitem"
                  className={cn(
                    'group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card',
                    'ring-1 ring-primary/5 transition-colors duration-200',
                    'hover:border-primary/25 hover:ring-primary/10',
                  )}
                >
                  <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-muted/30">
                    {ex.gif_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URLs externas
                      <img
                        src={ex.gif_url}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        loading="lazy"
                      />
                    ) : ex.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ex.image_url}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted/50 text-xs text-muted-foreground">
                        Sin preview
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
                    <h3 className="line-clamp-2 font-semibold capitalize leading-snug text-foreground">
                      {ex.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {ex.primary_muscle ? (
                        <Badge variant="secondary" className="text-[10px] font-medium capitalize">
                          {ex.primary_muscle}
                        </Badge>
                      ) : null}
                      {ex.exercise_type ? (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {ex.exercise_type}
                        </Badge>
                      ) : null}
                    </div>
                    {ex.equipment ? (
                      <p className="line-clamp-1 text-xs text-muted-foreground">{ex.equipment}</p>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-auto min-h-10 w-full"
                      onClick={() => openDetail(ex)}
                    >
                      <Eye data-icon="inline-start" />
                      Ver ficha
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <ExerciseDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setDetailExercise(null)
        }}
        exercise={detailExercise}
        variant="default"
      />
    </>
  )
}
