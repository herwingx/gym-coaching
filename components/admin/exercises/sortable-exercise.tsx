'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, GripVertical, ImageOff } from 'lucide-react'
import { Exercise } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SortableExerciseProps {
  id: string
  dayId: string
  exerciseId: string
  sets: number
  reps: string
  restSeconds: number
  exerciseInfo?: Exercise
  onUpdate: (field: string, value: string | number) => void
  onRemove: () => void
}

export function SortableExercise({
  id,
  sets,
  reps,
  restSeconds,
  exerciseInfo,
  onUpdate,
  onRemove,
}: SortableExerciseProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/ex flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-[opacity,box-shadow,border-color] duration-200 sm:flex-row sm:items-center',
        isDragging && 'opacity-70 shadow-lg ring-2 ring-ring/50',
        !isDragging && 'hover:border-primary/20 hover:shadow-sm',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <button
          type="button"
          className={cn(
            'hidden shrink-0 cursor-grab touch-none rounded-lg p-2 text-muted-foreground',
            'hover:bg-accent hover:text-foreground active:cursor-grabbing sm:flex sm:items-center sm:justify-center',
            'min-h-11 min-w-11', // touch-friendly when visible
          )}
          aria-label="Arrastrar para reordenar"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30">
          {exerciseInfo?.gif_url && !imgFailed ? (
            <img
              src={exerciseInfo.gif_url}
              alt={exerciseInfo.name}
              className="size-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-0.5 bg-muted/50 text-muted-foreground">
              <ImageOff className="size-5 opacity-60" aria-hidden />
              <span className="px-1 text-center text-[10px] font-medium leading-tight">
                Sin vista
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-foreground">
            {exerciseInfo?.name || 'Ejercicio'}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {exerciseInfo?.primary_muscle ? (
              <Badge variant="secondary" className="text-[10px] font-medium">
                {exerciseInfo.primary_muscle}
              </Badge>
            ) : null}
            {exerciseInfo?.equipment ? (
              <span className="text-xs text-muted-foreground">{exerciseInfo.equipment}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex w-full items-end justify-between gap-3 border-t border-border pt-3 sm:w-auto sm:border-0 sm:pt-0">
        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Series</span>
            <Input
              type="number"
              inputMode="numeric"
              value={sets}
              min={1}
              onChange={(e) => onUpdate('sets', Number(e.target.value))}
              className="h-10 w-14 rounded-lg text-center tabular-nums"
              aria-label="Series"
            />
          </div>
          <span className="hidden pb-2 text-muted-foreground sm:inline" aria-hidden>
            ×
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Reps / notas</span>
            <Input
              value={reps}
              onChange={(e) => onUpdate('reps', e.target.value)}
              placeholder="8–12"
              className="h-10 min-w-18 rounded-lg text-center text-sm sm:w-24"
              aria-label="Repeticiones o notas"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Descanso (s)</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={restSeconds}
              onChange={(e) => onUpdate('restSeconds', Number(e.target.value) || 0)}
              className="h-10 w-18 rounded-lg text-center tabular-nums"
              aria-label="Descanso en segundos"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
          aria-label="Quitar ejercicio"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
