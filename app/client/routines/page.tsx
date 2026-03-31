"use client";

// Triggering re-build for chunkload fix
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  getNextWorkoutDay,
  suggestProgressionWeekly,
} from "@/app/actions/routine-assignment";
import {
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Info,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";
import { ExerciseDetailDrawer } from "@/components/client/exercise-detail-drawer";
import { ExerciseMedia } from "@/components/client/exercise-media";
import { ClientRoutinesPageSkeleton } from "@/components/client/client-routines-skeleton";
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientStackPageHeader,
} from "@/components/client/client-app-page-parts";
import type { Exercise } from "@/lib/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface RoutineSummary {
  id: string;
  name: string;
  duration_weeks: number;
  days_per_week: number;
  /** Días con trabajo (excluye `is_rest_day`), para no confundir con slots totales del microciclo */
  training_days_per_week: number;
  description: string | null;
}

interface ClientRoutine {
  id: string;
  routine_id: string;
  current_week: number;
  current_day_index: number;
  is_active: boolean;
  routines: RoutineSummary;
}

function countTrainingDaysPerWeek(
  routineDays: { is_rest_day: boolean | null }[] | undefined | null,
  fallback: number,
): number {
  if (!routineDays?.length) return fallback;
  const n = routineDays.filter((d) => !d.is_rest_day).length;
  return n > 0 ? n : fallback;
}

type RoutineRowFromDb = Omit<RoutineSummary, "training_days_per_week"> & {
  routine_days?: { is_rest_day: boolean | null }[] | null;
};

function normalizeClientRoutineRow(row: {
  id: string;
  routine_id: string;
  current_week: number;
  current_day_index: number;
  is_active: boolean;
  routines: RoutineRowFromDb | RoutineRowFromDb[] | null;
}): ClientRoutine | null {
  const r = row.routines;
  const routineRaw = Array.isArray(r) ? r[0] : r;
  if (!routineRaw) return null;
  const { routine_days: routineDays, ...routine } = routineRaw;
  const training_days_per_week = countTrainingDaysPerWeek(
    routineDays,
    routine.days_per_week ?? 0,
  );
  return {
    id: row.id,
    routine_id: row.routine_id,
    current_week: row.current_week,
    current_day_index: row.current_day_index,
    is_active: row.is_active,
    routines: {
      ...routine,
      training_days_per_week,
      description: routine.description ?? "",
    },
  };
}

export default function ClientRoutinesPage() {
  const [routines, setRoutines] = useState<ClientRoutine[]>([]);
  const [nextWorkout, setNextWorkout] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [suggestions, setSuggestions] = useState<
    {
      exerciseId: string;
      exercise: string;
      suggestedWeight?: number;
      suggestedReps?: number;
      reason: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    const loadRoutines = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: clients } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!clients) return;

        const { data: clientRoutines } = await supabase
          .from("client_routines")
          .select(
            `
            id,
            routine_id,
            current_week,
            current_day_index,
            is_active,
            routines (
              id,
              name,
              duration_weeks,
              days_per_week,
              description,
              routine_days ( is_rest_day )
            )
          `,
          )
          .eq("client_id", clients.id)
          .eq("is_active", true);

        const normalized = (clientRoutines || [])
          .map((row) => normalizeClientRoutineRow(row))
          .filter((r): r is ClientRoutine => r !== null);
        setRoutines(normalized);

        if (clientRoutines && clientRoutines.length > 0) {
          const nextWorkoutInfo = await getNextWorkoutDay(clientRoutines[0].id);
          setNextWorkout(nextWorkoutInfo as Record<string, unknown>);

          const progressSuggestions = await suggestProgressionWeekly(
            normalized[0].id,
          );
          setSuggestions(progressSuggestions);
        }
      } catch (error) {
        toast.error("No pudimos cargar tus rutinas. Recarga la página.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutines();
  }, []);

  if (isLoading) {
    return <ClientRoutinesPageSkeleton />;
  }

  if (routines.length === 0) {
    return (
      <>
        <ClientStackPageHeader
          title="Mis rutinas"
          subtitle="Sin rutinas asignadas · tu coach te asignará una pronto."
        />
        <div className={CLIENT_DATA_PAGE_SHELL}>
          <Empty className="border-border/80 shadow-sm ring-1 ring-primary/5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Dumbbell />
              </EmptyMedia>
              <EmptyTitle>Aún no tienes rutinas asignadas</EmptyTitle>
              <EmptyDescription>
                Cuando tu coach te asigne una rutina, verás aquí el plan semanal
                y el botón para iniciar tu siguiente sesión.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild variant="outline">
                <Link href="/client/messages">Pedir rutina a mi coach</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </>
    );
  }

  const activeRoutines = routines.filter((r) => r.is_active).length;
  const routinesSubtitle = `${routines.length} ${routines.length === 1 ? "rutina asignada" : "rutinas asignadas"} · ${activeRoutines} ${activeRoutines === 1 ? "activa" : "activas"}`;

  return (
    <>
      <ClientStackPageHeader title="Mis rutinas" subtitle={routinesSubtitle} />
      <div
        className={`${CLIENT_DATA_PAGE_SHELL} flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start`}
      >
        <section className="order-1 flex min-w-0 flex-col gap-6 lg:order-2 lg:col-span-8">
          {routines.map((routine) => {
            const progress =
              (routine.current_week / routine.routines.duration_weeks) * 100;
            const nw = nextWorkout as {
              isComplete?: boolean;
              message?: string;
              suggestedAction?: string;
              isRestDay?: boolean;
              exercises?: Array<{
                id: string;
                sets: number;
                reps: string;
                exercises?: Exercise | Exercise[] | null;
              }>;
            } | null;

            return (
              <Card
                key={routine.id}
                className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5"
              >
                <CardHeader className="flex flex-col gap-4 pb-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <CardTitle className="text-balance text-xl sm:text-2xl">
                        {routine.routines.name}
                      </CardTitle>
                      {routine.routines.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {routine.routines.description}
                        </p>
                      ) : null}
                    </div>
                    {nw?.isComplete ? (
                      <Badge
                        variant="secondary"
                        className="mx-auto shrink-0 gap-1.5 border border-primary/30 bg-primary/10 text-primary sm:mx-0"
                      >
                        <CheckCircle2 data-icon="inline-start" />
                        Completada
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium">Progreso de la rutina</span>
                      <span className="tabular-nums text-muted-foreground">
                        Semana {routine.current_week} de{" "}
                        {routine.routines.duration_weeks}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {nw ? (
                    <div className="rounded-xl border border-border/60 bg-muted/15 p-4 sm:p-5">
                      {nw.isComplete ? (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <p className="font-medium text-success">
                            Rutina completada
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {nw.suggestedAction}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="text-center sm:text-left">
                            <p className="font-medium leading-snug">
                              {nw.message}
                            </p>
                            {nw.isRestDay ? (
                              <p className="mt-2 text-sm text-muted-foreground">
                                Usa este día para recuperarte y prepararte para
                                el próximo entrenamiento.
                              </p>
                            ) : null}
                          </div>

                          {!nw.isRestDay &&
                          nw.exercises &&
                          nw.exercises.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-left">
                                Ejercicios de hoy
                              </p>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {nw.exercises.map((exercise) => {
                                  const raw = exercise.exercises;
                                  const exDetails = Array.isArray(raw)
                                    ? raw[0]
                                    : raw;
                                  const label = exDetails?.name
                                    ? `Ver detalles: ${exDetails.name}`
                                    : "Detalles del ejercicio";
                                  return (
                                    <button
                                      key={exercise.id}
                                      type="button"
                                      disabled={!exDetails}
                                      onClick={() =>
                                        exDetails &&
                                        handleExerciseClick(exDetails)
                                      }
                                      className="group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-background p-3 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-primary/40 hover:shadow-md active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
                                      aria-label={label}
                                    >
                                      <ExerciseMedia
                                        src={
                                          exDetails?.gif_url ||
                                          exDetails?.image_url
                                        }
                                        alt={exDetails?.name ?? "Ejercicio"}
                                        variant="thumb"
                                        className="size-16 shrink-0 rounded-xl"
                                      />
                                      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
                                        <h4 className="truncate text-sm font-semibold capitalize">
                                          {exDetails?.name ?? "Ejercicio"}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                          <Badge
                                            variant="secondary"
                                            className="h-5 px-1.5 text-[10px] font-medium capitalize"
                                          >
                                            {exDetails?.primary_muscle ??
                                              "General"}
                                          </Badge>
                                          <span className="tabular-nums">
                                            {exercise.sets} series ×{" "}
                                            {exercise.reps}
                                          </span>
                                        </div>
                                      </div>
                                      <span className="flex size-11 shrink-0 items-center justify-center text-muted-foreground transition-opacity group-hover:text-foreground">
                                        <Info className="size-4" aria-hidden />
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {!nw.isRestDay ? (
                            <Button
                              asChild
                              className="min-h-12 w-full text-base font-semibold shadow-sm"
                            >
                              <Link href="/client/workout/start">
                                Comenzar entrenamiento
                                <ChevronRight data-icon="inline-end" />
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-6 border-t border-border/60 pt-6 text-center sm:text-left">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Días de entreno
                      </p>
                      <p className="text-2xl font-bold tabular-nums sm:text-3xl">
                        {routine.routines.training_days_per_week}
                      </p>
                      {routine.routines.training_days_per_week !==
                      routine.routines.days_per_week ? (
                        <p className="text-[11px] leading-snug text-muted-foreground">
                          {routine.routines.days_per_week} bloques en el ciclo
                          (incl. descansos)
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Duración total
                      </p>
                      <p className="text-2xl font-bold tabular-nums sm:text-3xl">
                        {routine.routines.duration_weeks}{" "}
                        <span className="text-lg font-semibold text-muted-foreground">
                          sem
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <aside className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-4 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:self-start">
          {suggestions.length > 0 ? (
            <Card className="overflow-hidden border-primary/25 bg-primary/5 shadow-sm ring-1 ring-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-center gap-2 text-base sm:justify-start">
                  <TrendingUp
                    className="size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  Sugerencias de progresión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.exerciseId}
                      className="rounded-lg border border-border/50 bg-background/90 p-3 text-center sm:text-left"
                    >
                      <p className="font-medium capitalize">
                        {suggestion.exercise}
                      </p>
                      {suggestion.suggestedWeight != null ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Siguiente carga sugerida:{" "}
                          <span className="font-semibold tabular-nums text-foreground">
                            {suggestion.suggestedWeight} kg
                          </span>
                        </p>
                      ) : null}
                      {suggestion.suggestedReps != null ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Objetivo de reps:{" "}
                          <span className="font-semibold tabular-nums text-foreground">
                            {suggestion.suggestedReps}
                          </span>
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs leading-snug italic text-muted-foreground">
                        {suggestion.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-center gap-2 text-base sm:justify-start">
                  <TrendingUp
                    className="size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  Progresión
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-center sm:text-left">
                <p className="text-sm text-muted-foreground text-pretty">
                  Cuando tengas historial suficiente, aquí verás sugerencias
                  para subir peso o repeticiones de forma ordenada.
                </p>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/client/progress">Ver gráficos de progreso</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
      <ExerciseDetailDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        exercise={selectedExercise}
      />
    </>
  );
}
