'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Exercise } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Library, Search as SearchIcon, Eye, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExerciseDetailDrawer } from '@/components/client/exercise-detail-drawer'

interface AdminExerciseCatalogProps {
  exercises: Exercise[]
  totalCount: number
  totalPages: number
  currentPage: number
  allBodyParts: string[]
  initialFilters: {
    search: string
    bodyPart: string | null
  }
}

export function AdminExerciseCatalog({ 
  exercises, 
  totalCount, 
  totalPages, 
  currentPage,
  allBodyParts,
  initialFilters
}: AdminExerciseCatalogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(initialFilters.search)
  const [isPending, setIsPending] = useState(false)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Sync internal state with URL if it changes externally (e.g. back button)
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      
      Object.entries(params).forEach(([name, value]) => {
        if (value === null) {
          newParams.delete(name)
        } else {
          newParams.set(name, value)
        }
      })
      
      return newParams.toString()
    },
    [searchParams]
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    // We don't update URL immediately on every keystroke to avoid too many fetches
    // Use a timeout or a button. Let's use a simple timeout for better UX
  }

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        setIsPending(true)
        router.push(`?${createQueryString({ search: search || null, page: '1' })}`)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search, router, createQueryString, searchParams])

  // Body part selection updates immediately
  const handleBodyPartChange = (bp: string | null) => {
    setIsPending(true)
    router.push(`?${createQueryString({ bodyPart: bp, page: '1' })}`)
  }

  const handlePageChange = (page: number) => {
    setIsPending(true)
    router.push(`?${createQueryString({ page: page.toString() })}`)
  }

  useEffect(() => {
    setIsPending(false)
  }, [exercises])

  const openDetail = (ex: Exercise) => {
    setDetailExercise(ex)
    setDetailOpen(true)
  }

  const clearFilters = () => {
    setSearch('')
    setIsPending(true)
    router.push('?')
  }

  const activeBodyPart = searchParams.get('bodyPart')
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
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Biblioteca</p>
                    {isPending && <Loader2 className="size-3 animate-spin text-primary" />}
                  </div>
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
                  onChange={(e) => handleSearch(e.target.value)}
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
                    onClick={() => handleBodyPartChange(null)}
                  >
                    Todas
                  </Badge>
                  {allBodyParts.map((bp) => (
                    <Badge
                      key={bp}
                      variant={activeBodyPart === bp ? 'default' : 'outline'}
                      className="h-9 shrink-0 cursor-pointer rounded-full px-3 text-xs font-medium capitalize"
                      onClick={() => handleBodyPartChange(activeBodyPart === bp ? null : bp)}
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
              Mostrando <span className="tabular-nums font-semibold text-foreground">{exercises.length}</span>
              <span className="mx-1">de</span>
              <span className="tabular-nums font-semibold text-foreground">{totalCount}</span>
              <span className="ml-1">ejercicios</span>
              {activeBodyPart ? (
                <span className="mt-1 block text-xs capitalize sm:mt-0 sm:ml-2 sm:inline">
                  · zona <span className="font-medium text-foreground">{activeBodyPart}</span>
                </span>
              ) : null}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg"
                  disabled={currentPage <= 1 || isPending}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="flex h-8 items-center px-3 text-xs font-medium bg-muted/50 rounded-lg border border-border/50">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg"
                  disabled={currentPage >= totalPages || isPending}
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {exercises.length === 0 ? (
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
            <>
              <div
                className={cn(
                  "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 transition-opacity duration-200",
                  isPending ? "opacity-50 pointer-events-none" : "opacity-100"
                )}
                role="list"
              >
                {exercises.map((ex) => (
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

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl"
                    disabled={currentPage <= 1 || isPending}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="mr-2 size-4" />
                    Anterior
                  </Button>
                  
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = currentPage - 2 + i
                      if (currentPage <= 2) pageNum = i + 1
                      if (currentPage >= totalPages - 1) pageNum = totalPages - 4 + i
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'ghost'}
                            size="sm"
                            className="size-10 rounded-xl"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isPending}
                          >
                            {pageNum}
                          </Button>
                        )
                      }
                      return null
                    })}
                  </div>

                  <Button
                    variant="outline"
                    className="h-10 rounded-xl"
                    disabled={currentPage >= totalPages || isPending}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Siguiente
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </div>
              )}
            </>
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
