'use client'

import { useEffect, useState } from 'react'
import type { Exercise } from '@/lib/types'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExerciseMedia } from '@/components/client/exercise-media'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExternalLink, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise | null
  /**
   * `compact`: en sesión activa el GIF ya se ve en pantalla — aquí solo técnica, pasos y vídeo externo.
   * `default`: vista completa con media grande (p. ej. desde lista de rutina).
   */
  variant?: 'default' | 'compact'
}

function normalizeLines(value: unknown): string[] {
  if (value == null) return []
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }
  return []
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = () => setMatches(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

function ExerciseBadges({ exercise }: { exercise: Exercise }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {exercise.exercise_type ? (
        <Badge variant="outline" className="capitalize">
          {exercise.exercise_type}
        </Badge>
      ) : null}
      {exercise.primary_muscle ? (
        <Badge variant="secondary" className="capitalize">
          {exercise.primary_muscle}
        </Badge>
      ) : null}
      {exercise.equipment ? (
        <Badge variant="outline" className="capitalize">
          {exercise.equipment}
        </Badge>
      ) : null}
    </div>
  )
}

function ExerciseDetailSections({
  exercise,
  showCompactCallout,
  showHeroMedia,
  classNames,
}: {
  exercise: Exercise
  showCompactCallout: boolean
  showHeroMedia: boolean
  classNames?: { root?: string }
}) {
  const instructions = normalizeLines(exercise.instructions)
  const targets = exercise.target_muscles?.length ? exercise.target_muscles : []
  const showInstructionPlaceholder = !instructions.length && (showCompactCallout || !showHeroMedia)

  return (
    <div className={cn('flex flex-col gap-6', classNames?.root)}>
      {showCompactCallout ? (
        <Alert>
          <Info aria-hidden />
          <AlertTitle className="text-sm">Mismo ejercicio, otro contenido</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed">
            La repetición animada sigue arriba en el entreno. Esta vista es solo para leer pasos, músculos y
            consejos sin duplicar el GIF.
          </AlertDescription>
        </Alert>
      ) : null}

      {exercise.demo_video_url ? (
        <Button variant="outline" size="sm" className="w-fit" asChild>
          <a href={exercise.demo_video_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
            Ver vídeo demostración
          </a>
        </Button>
      ) : null}

      {showHeroMedia ? (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/50 shadow-inner dark:bg-muted/25">
          <ExerciseMedia
            src={exercise.gif_url || exercise.image_url}
            alt={exercise.name}
            variant="fill"
            className="aspect-square w-full max-h-[min(55vh,420px)] sm:max-h-[min(50vh,480px)]"
            imgClassName="object-contain"
          />
        </div>
      ) : null}

      {targets.length > 0 ? (
        <section className="flex flex-col gap-2" aria-labelledby="exercise-targets-heading">
          <h3
            id="exercise-targets-heading"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Músculos objetivo
          </h3>
          <div className="flex flex-wrap gap-2 sm:justify-start">
            {targets.map((m) => (
              <Badge key={m} variant="secondary" className="capitalize">
                {m}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {instructions.length > 0 ? (
        <section className="flex flex-col gap-3" aria-labelledby="exercise-steps-heading">
          <h3
            id="exercise-steps-heading"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Cómo hacerlo
          </h3>
          <ol className="flex flex-col gap-2 text-sm leading-relaxed text-foreground/90">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary tabular-nums"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="min-w-0 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : showInstructionPlaceholder ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay pasos detallados para este ejercicio. Si tu coach añade instrucciones en el catálogo,
          aparecerán aquí.
        </p>
      ) : null}

      {exercise.technique_notes ? (
        <>
          <Separator />
          <section className="flex flex-col gap-2" aria-labelledby="exercise-tech-heading">
            <h3
              id="exercise-tech-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Técnica y notas
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{exercise.technique_notes}</p>
          </section>
        </>
      ) : null}
    </div>
  )
}

function DrawerInnerSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-6" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function ExerciseDetailDrawer({
  open,
  onOpenChange,
  exercise,
  variant = 'default',
}: ExerciseDetailDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const title = exercise?.name ?? 'Ejercicio'

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          className={cn(
            'max-h-[90vh] translate-y-[-50%] gap-0 overflow-y-auto p-0 sm:max-w-lg',
            variant === 'default' && 'lg:max-w-4xl lg:overflow-hidden',
            variant === 'compact' && 'lg:max-w-2xl',
          )}
        >
          {open && !exercise ? (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Cargando ejercicio</DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <DrawerInnerSkeleton />
              </div>
            </>
          ) : null}

          {exercise ? (
            <>
              <DialogDescription className="sr-only">
                Detalles, técnica e instrucciones del ejercicio
              </DialogDescription>
              {variant === 'default' ? (
                <div className="flex flex-col lg:grid lg:min-h-[min(70vh,560px)] lg:grid-cols-2 lg:gap-0">
                  <div className="border-b border-border/60 lg:border-r lg:border-b-0">
                    <DialogHeader className="p-6 pb-4 text-left lg:sticky lg:top-0">
                      <DialogTitle className="text-xl font-bold capitalize tracking-tight sm:text-2xl">
                        {exercise.name}
                      </DialogTitle>
                      <ExerciseBadges exercise={exercise} />
                    </DialogHeader>
                    <div className="px-6 pb-6 lg:px-6 lg:pb-6">
                      <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/50 dark:bg-muted/25">
                        <ExerciseMedia
                          src={exercise.gif_url || exercise.image_url}
                          alt={exercise.name}
                          variant="fill"
                          className="aspect-4/3 w-full lg:aspect-square lg:max-h-[min(52vh,520px)]"
                          imgClassName="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="min-h-0 overflow-y-auto lg:max-h-[min(85vh,640px)]">
                    <div className="p-6 pt-4 lg:pt-6">
                      <ExerciseDetailSections
                        exercise={exercise}
                        showCompactCallout={false}
                        showHeroMedia={false}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <DialogHeader className="p-6 pb-2 text-left">
                    <DialogTitle className="text-xl font-bold capitalize tracking-tight sm:text-2xl">
                      {exercise.name}
                    </DialogTitle>
                    <ExerciseBadges exercise={exercise} />
                  </DialogHeader>
                  <div className="max-h-[min(65vh,520px)] overflow-y-auto px-6 pb-4">
                    <ExerciseDetailSections
                      exercise={exercise}
                      showCompactCallout
                      showHeroMedia={false}
                    />
                  </div>
                </>
              )}
              <DialogFooter className="border-t border-border/60 p-4 sm:px-6">
                <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] border-t border-border/80 bg-background">
        <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden">
          {open && !exercise ? (
            <>
              <DrawerHeader className="sr-only">
                <DrawerTitle>Cargando ejercicio</DrawerTitle>
              </DrawerHeader>
              <DrawerInnerSkeleton />
            </>
          ) : null}

          {exercise ? (
            <>
              <DrawerHeader className="pb-2 text-left">
                <DrawerTitle className="text-xl font-bold capitalize tracking-tight sm:text-2xl">
                  {title}
                </DrawerTitle>
                <DrawerDescription className="sr-only">Detalles, técnica e instrucciones del ejercicio</DrawerDescription>
                <ExerciseBadges exercise={exercise} />
              </DrawerHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-4">
                <ExerciseDetailSections
                  exercise={exercise}
                  showCompactCallout={variant === 'compact'}
                  showHeroMedia={variant === 'default'}
                />
              </div>

              <DrawerFooter className="border-t border-border/60 pt-2">
                <DrawerClose asChild>
                  <Button type="button" variant="secondary" className="w-full">
                    Cerrar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
