import { getAuthUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Award, Sparkles, TrendingUp } from "lucide-react";
import {
  VolumeChartLazy,
  ExerciseProgressChartLazy,
} from "@/components/charts/progress-charts-lazy";
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientIncompleteProfileCard,
  ClientStackPageHeader,
} from "@/components/client/client-app-page-parts";
import {
  buildExerciseProgressFromLogs,
  exerciseOptionsFromPoints,
  mergePrEventsIntoPoints,
} from "@/lib/client-exercise-progress";
import { exerciseUsesExternalLoad } from "@/lib/exercise-tracking";
import {
  computeStrengthProgressInsight,
  computeVolumeInsightFromVolumes,
} from "@/lib/progress-insights";

export default async function ClientProgressPage() {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const { data: clientRecord } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!clientRecord) {
    return (
      <>
        <ClientStackPageHeader
          title="Progreso"
          subtitle="Completa tu perfil para ver volumen, PRs e insights."
        />
        <div className={CLIENT_DATA_PAGE_SHELL}>
          <ClientIncompleteProfileCard />
        </div>
      </>
    );
  }

  const clientId = clientRecord.id as string;

  const [
    { data: completedSessions },
    { data: prRows },
    { data: exerciseLogRows },
  ] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("started_at,total_volume_kg,status")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .order("started_at", { ascending: true })
      .limit(60),
    supabase
      .from("pr_events")
      .select(
        "achieved_at,weight_kg,reps,exercise_id,exercises(name,primary_muscle,exercise_type,uses_external_load,equipment)",
      )
      .eq("client_id", clientId)
      .order("achieved_at", { ascending: true })
      .limit(250),
    supabase
      .from("exercise_logs")
      .select(
        `exercise_id, exercise_name, weight_kg, reps, is_warmup, workout_session_id,
           workout_sessions!inner(started_at, client_id, status)`,
      )
      .eq("workout_sessions.client_id", clientId)
      .eq("workout_sessions.status", "completed"),
  ]);

  const loadAwarePrRows = (prRows ?? []).filter((r) => {
    const ex =
      r.exercises && !Array.isArray(r.exercises)
        ? (r.exercises as {
            exercise_type?: string | null;
            uses_external_load?: boolean | null;
            equipment?: string | null;
          })
        : null;
    return exerciseUsesExternalLoad(
      ex?.exercise_type,
      ex?.uses_external_load,
      ex?.equipment,
    );
  });

  const fromLogs = buildExerciseProgressFromLogs(exerciseLogRows);
  const nameById = new Map(fromLogs.nameById);
  const pointsByExerciseId = mergePrEventsIntoPoints(
    fromLogs.pointsByExerciseId,
    nameById,
    loadAwarePrRows,
  );
  const exercises = exerciseOptionsFromPoints(pointsByExerciseId, nameById);

  const now = new Date();

  const strengthEntries = exercises.map((ex) => ({
    name: ex.name,
    points: (pointsByExerciseId[ex.id] || []).map((p) => ({
      achieved_at:
        typeof p.achieved_at === "string"
          ? p.achieved_at
          : new Date(p.achieved_at).toISOString(),
      weight_kg: p.weight_kg,
    })),
  }));
  const strengthInsight = computeStrengthProgressInsight(strengthEntries, now);

  const volumeSeries = (completedSessions || [])
    .map((s) => {
      const raw = s.total_volume_kg;
      const n = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(n) && n > 0 ? n : null;
    })
    .filter((v): v is number => v != null);
  const volumeInsight = computeVolumeInsightFromVolumes(volumeSeries);

  const sessionCountForChart = (completedSessions || []).length;
  const exerciseTrackCount = exercises.length;
  const progressSubtitle =
    sessionCountForChart === 0 && exerciseTrackCount === 0
      ? "Sin datos aún · completa entrenos para ver volumen y curvas por ejercicio."
      : `${sessionCountForChart} ${sessionCountForChart === 1 ? "sesión" : "sesiones"} en volumen · ${exerciseTrackCount} ${exerciseTrackCount === 1 ? "ejercicio en seguimiento" : "ejercicios en seguimiento"}`;

  return (
    <>
      <ClientStackPageHeader title="Progreso" subtitle={progressSubtitle} />

      <div
        className={`${CLIENT_DATA_PAGE_SHELL} grid gap-6 lg:grid-cols-12 lg:items-start`}
      >
        <aside className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-4 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:self-start">
          <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Sparkles className="size-4 text-primary" aria-hidden />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    Insights
                  </CardTitle>
                  <CardDescription>
                    Resumen automático con lo que tus datos sugieren hoy
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {strengthInsight.status === "ok" &&
                strengthInsight.recentMilestone && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 ring-1 ring-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="size-4 text-primary" />
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        ¡Nuevo Récord!
                      </p>
                    </div>
                    <p className="font-semibold leading-snug">
                      {strengthInsight.recentMilestone.name}:{" "}
                      <span className="tabular-nums">
                        {strengthInsight.recentMilestone.weight_kg.toFixed(1)}
                      </span>{" "}
                      kg
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Superaste tu mejor marca personal hace poco. ¡Sigue así!
                    </p>
                  </div>
                )}

              {strengthInsight.status === "ok" &&
              strengthInsight.deltaPct > 0 ? (
                <div className="rounded-xl border border-border/60 bg-muted/15 p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tendencia de carga
                  </p>
                  <p className="mt-2 font-semibold leading-snug">
                    {strengthInsight.exerciseName}: +
                    <span className="tabular-nums">
                      {strengthInsight.deltaPct.toFixed(1)}
                    </span>
                    %
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      en ~30 días
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                    Mediana inicial{" "}
                    <span className="font-medium text-foreground">
                      {strengthInsight.fromKg.toFixed(1)} kg
                    </span>{" "}
                    → ahora{" "}
                    <span className="font-medium text-foreground">
                      {strengthInsight.toKg.toFixed(1)} kg
                    </span>
                  </p>
                </div>
              ) : strengthInsight.status === "ok" &&
                strengthInsight.recentMilestone ? null : (
                <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-6 text-center sm:text-left">
                  <p className="text-sm text-foreground/90 text-pretty leading-relaxed">
                    Cuando tengas varios registros del mismo ejercicio en ~30
                    días, mostraremos la tendencia de carga.
                  </p>
                </div>
              )}

              {volumeInsight.status === "ok" ? (
                <div className="rounded-xl border border-border/60 bg-muted/15 p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tendencia de volumen
                  </p>
                  <p className="mt-2 font-semibold leading-snug">
                    {volumeInsight.direction === "up"
                      ? "Tu volumen total va en alza"
                      : volumeInsight.direction === "down"
                        ? "Tu volumen total está bajando"
                        : "Tu volumen total se mantiene estable"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                    Δ vs periodo previo:{" "}
                    <span className="font-medium text-foreground">
                      {volumeInsight.diffPct >= 0 ? "+" : ""}
                      {volumeInsight.diffPct.toFixed(1)}%
                    </span>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {volumeInsight.window === "4v4"
                      ? "Mediana de las 4 sesiones más recientes frente a las 4 anteriores (menos ruido que un solo pico)."
                      : "Mediana de las 3 sesiones más recientes frente a las 3 anteriores. Con 8+ sesiones usamos ventanas de 4."}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-6 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                    {volumeInsight.sessionsWithVolume > 0 ? (
                      <>
                        Tienes{" "}
                        <span className="tabular-nums font-medium text-foreground">
                          {volumeInsight.sessionsWithVolume}
                        </span>{" "}
                        sesiones con volumen registrado. Necesitamos al menos{" "}
                        <span className="tabular-nums font-medium text-foreground">
                          {volumeInsight.needed}
                        </span>{" "}
                        para estimar una tendencia fiable.
                      </>
                    ) : (
                      <>
                        Registra entrenos completados con volumen para ver la
                        tendencia.
                      </>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="order-1 flex min-w-0 flex-col gap-6 lg:order-2 lg:col-span-8">
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5 lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <TrendingUp className="size-4 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      Volumen
                    </CardTitle>
                    <CardDescription>
                      Kilos totales por sesión completada
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <VolumeChartLazy
                  sessions={(completedSessions || []).map((s) => {
                    const raw = s.total_volume_kg;
                    const n = typeof raw === "number" ? raw : Number(raw);
                    return {
                      started_at: s.started_at as string,
                      total_volume_kg: Number.isFinite(n) ? n : null,
                    };
                  })}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5 lg:col-span-3">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      Progreso por ejercicio
                    </CardTitle>
                    <CardDescription>
                      Mejor serie por entreno completado; los hitos de PR se
                      fusionan en la misma línea temporal
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ExerciseProgressChartLazy
                  exercises={exercises}
                  pointsByExerciseId={pointsByExerciseId}
                  defaultExerciseId={exercises[0]?.id}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
