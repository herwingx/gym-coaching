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
        'group/ex relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 sm:flex-row sm:items-center',
        isDragging ? 'z-50 opacity-90 shadow-2xl ring-2 ring-primary/40 scale-[1.02]' : 'hover:border-primary/30 hover:shadow-md',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <button
          type="button"
          className={cn(
            'hidden shrink-0 cursor-grab touch-none rounded-xl p-2 text-muted-foreground/40 transition-colors',
            'hover:bg-primary/5 hover:text-primary active:cursor-grabbing sm:flex sm:items-center sm:justify-center',
            'size-10',
          )}
          aria-label="Arrastrar para reordenar"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>

        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/20 shadow-inner">
          {exerciseInfo?.gif_url && !imgFailed ? (
            <img
              src={exerciseInfo.gif_url}
              alt={exerciseInfo.name}
              className="size-full object-cover transition-transform duration-500 group-hover/ex:scale-110"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center bg-muted/30 text-muted-foreground/40">
              <ImageOff className="size-5 opacity-40" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-bold tracking-tight text-foreground group-hover/ex:text-primary transition-colors">
            {exerciseInfo?.name || 'Ejercicio'}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {exerciseInfo?.primary_muscle && (
              <Badge variant="secondary" className="h-5 rounded-md px-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary/70 border-0">
                {exerciseInfo.primary_muscle}
              </Badge>
            )}
            {exerciseInfo?.equipment && (
              <span className="text-[11px] font-medium text-muted-foreground opacity-80">
                {exerciseInfo.equipment}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full items-end justify-between gap-4 border-t border-border/40 pt-4 sm:w-auto sm:border-0 sm:pt-0">
        <div className="flex flex-1 items-end gap-2 sm:flex-initial sm:gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Series</span>
            <Input
              type="number"
              inputMode="numeric"
              value={sets}
              min={1}
              onChange={(e) => onUpdate('sets', Number(e.target.value))}
              className="h-10 w-14 rounded-xl border-border/80 bg-background text-center font-bold tabular-nums ring-primary/10 focus-visible:ring-4"
            />
          </div>
          
          <div className="flex flex-1 flex-col gap-1.5 sm:flex-initial">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Objetivo / Reps</span>
            <Input
              value={reps}
              onChange={(e) => onUpdate('reps', e.target.value)}
              placeholder="10-12 / RPE 8..."
              className="h-10 min-w-24 rounded-xl border-border/80 bg-background px-3 text-sm font-medium ring-primary/10 focus-visible:ring-4 sm:w-36"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Pausa</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={restSeconds}
              onChange={(e) => onUpdate('restSeconds', Number(e.target.value) || 0)}
              className="h-10 w-16 rounded-xl border-border/80 bg-background text-center font-bold tabular-nums ring-primary/10 focus-visible:ring-4"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 rounded-xl text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={onRemove}
          aria-label="Quitar ejercicio"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
