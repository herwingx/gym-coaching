'use client'

import { useState, useMemo } from 'react'
import { Exercise } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SearchIcon, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseSelectorProps {
  exercises: Exercise[]
  onSelectExercises: (selectedIds: string[]) => void
  onClose?: () => void
  showCloseButton?: boolean
}

export function ExerciseSelector({
  exercises,
  onSelectExercises,
  onClose,
  showCloseButton = false,
}: ExerciseSelectorProps) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeBodyPart, setActiveBodyPart] = useState<string | null>(null)
  const [activeMuscle, setActiveMuscle] = useState<string | null>(null)
  const [activeEquipment, setActiveEquipment] = useState<string | null>(null)

  const bodyParts = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((ex) => {
      ex.body_parts?.forEach((bp) => set.add(bp))
    })
    return Array.from(set).sort()
  }, [exercises])

  const muscles = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((ex) => {
      if (activeBodyPart) {
        if (ex.body_parts?.includes(activeBodyPart)) {
          ex.target_muscles?.forEach((m) => set.add(m))
        }
      } else {
        ex.target_muscles?.forEach((m) => set.add(m))
      }
    })
    return Array.from(set).sort()
  }, [exercises, activeBodyPart])

  const equipments = useMemo(() => {
    const eqs = new Set<string>()
    exercises.forEach((ex) => {
      ex.equipments?.forEach((eq) => eqs.add(eq))
    })
    return Array.from(eqs).sort()
  }, [exercises])

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch = search
        ? ex.name.toLowerCase().includes(search.toLowerCase())
        : true
      const matchBodyPart = activeBodyPart
        ? ex.body_parts?.includes(activeBodyPart)
        : true
      const matchMuscle = activeMuscle
        ? ex.target_muscles?.includes(activeMuscle)
        : true
      const matchEquipment = activeEquipment
        ? ex.equipments?.includes(activeEquipment)
        : true

      return matchSearch && matchBodyPart && matchMuscle && matchEquipment
    })
  }, [exercises, search, activeBodyPart, activeMuscle, activeEquipment])

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleConfirm = () => {
    if (selectedIds.size === 0) return
    onSelectExercises(Array.from(selectedIds))
    setSelectedIds(new Set())
    onClose?.()
  }

  const clearFilters = () => {
    setSearch('')
    setActiveBodyPart(null)
    setActiveMuscle(null)
    setActiveEquipment(null)
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border bg-background px-4 pt-5 pb-3 sm:px-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Catálogo</h3>
            <p className="text-sm text-muted-foreground">
              {filteredExercises.length} ejercicios
              {selectedIds.size > 0 ? (
                <span className="text-foreground"> · {selectedIds.size} seleccionados</span>
              ) : null}
            </p>
          </div>
          {showCloseButton && onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>

        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Buscar por nombre…"
            className="h-11 rounded-xl pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex w-max gap-2 pb-1">
              <Badge
                variant={!activeBodyPart ? 'default' : 'secondary'}
                className={cn(
                  'h-9 cursor-pointer rounded-full px-3 text-xs font-medium',
                  !activeBodyPart ? '' : 'hover:bg-secondary/80',
                )}
                onClick={() => {
                  setActiveBodyPart(null)
                  setActiveMuscle(null)
                }}
              >
                Todo el cuerpo
              </Badge>
              {bodyParts.map((bp) => (
                <Badge
                  key={`bp-${bp}`}
                  variant={activeBodyPart === bp ? 'default' : 'outline'}
                  className="h-9 cursor-pointer rounded-full px-3 text-xs font-medium capitalize"
                  onClick={() => {
                    setActiveBodyPart(activeBodyPart === bp ? null : bp)
                    setActiveMuscle(null)
                  }}
                >
                  {bp}
                </Badge>
              ))}
            </div>
          </div>

          {(muscles.length > 0 || equipments.length > 0) && (
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex w-max flex-wrap gap-2 pb-1">
                {muscles.map((m) => (
                  <Badge
                    key={`muscle-${m}`}
                    variant={activeMuscle === m ? 'default' : 'outline'}
                    className="h-8 cursor-pointer rounded-full px-2.5 text-xs capitalize"
                    onClick={() => setActiveMuscle(activeMuscle === m ? null : m)}
                  >
                    {m}
                  </Badge>
                ))}
                {equipments.map((eq) => (
                  <Badge
                    key={`eq-${eq}`}
                    variant={activeEquipment === eq ? 'default' : 'outline'}
                    className="h-8 cursor-pointer rounded-full px-2.5 text-xs capitalize"
                    onClick={() => setActiveEquipment(activeEquipment === eq ? null : eq)}
                  >
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/10 px-3 py-4 sm:px-5">
        {filteredExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <SearchIcon className="size-7 text-muted-foreground" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-foreground">Sin resultados</p>
              <p className="text-sm text-muted-foreground">
                Prueba otra búsqueda o limpia los filtros.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <ul className="mx-auto flex max-w-2xl flex-col gap-2 pb-24" role="list">
            {filteredExercises.map((ex) => {
              const isSelected = selectedIds.has(ex.id)
              return (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => toggleSelection(ex.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow] duration-200',
                      'min-h-18',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/25 hover:bg-accent/30',
                    )}
                  >
                    <div
                      className={cn(
                        'relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30',
                      )}
                    >
                      {ex.gif_url ? (
                        <img
                          src={ex.gif_url}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold capitalize text-foreground">{ex.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {ex.primary_muscle ? (
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            {ex.primary_muscle}
                          </Badge>
                        ) : null}
                        {ex.equipment ? (
                          <span className="text-xs text-muted-foreground">{ex.equipment}</span>
                        ) : null}
                      </div>
                    </div>

                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 bg-background',
                      )}
                      aria-hidden
                    >
                      {isSelected ? <Check className="size-4" /> : null}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-border bg-linear-to-t from-background via-background/98 to-transparent px-4 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={selectedIds.size === 0}
          size="lg"
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          {selectedIds.size === 0
            ? 'Selecciona ejercicios'
            : `Añadir ${selectedIds.size} ejercicio${selectedIds.size !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
}
