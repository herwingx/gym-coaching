'use client'

import { Exercise } from '@/lib/types'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExerciseMedia } from '@/components/client/exercise-media'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface ExerciseDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise | null
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
}: ExerciseDetailDrawerProps) {
  const instructions = exercise ? normalizeLines(exercise.instructions) : []
  const targets = exercise?.target_muscles?.length
    ? exercise.target_muscles
    : []

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
                  {exercise.name}
                </DrawerTitle>
                <DrawerDescription className="sr-only">
                  Detalles, técnica e instrucciones del ejercicio
                </DrawerDescription>
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
              </DrawerHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-4">
                <div className="flex flex-col gap-6 pb-4">
                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-inner">
                    <ExerciseMedia
                      src={exercise.gif_url || exercise.image_url}
                      alt={exercise.name}
                      variant="fill"
                      className="aspect-square w-full"
                      imgClassName="object-contain sm:object-cover"
                    />
                  </div>

                  {targets.length > 0 ? (
                    <section className="flex flex-col gap-2" aria-labelledby="exercise-targets-heading">
                      <h3
                        id="exercise-targets-heading"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Músculos objetivo
                      </h3>
                      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
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
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {exercise.technique_notes}
                        </p>
                      </section>
                    </>
                  ) : null}
                </div>
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
