"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminClientStatusBadge } from "@/components/admin/admin-client-status-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  History,
  Dumbbell,
  Ruler,
  Notebook,
  Plus,
  Target,
  Camera,
  LayoutGrid,
  Diff,
  Trophy,
} from "lucide-react";
import { getGoalLabel } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import type { Routine, WorkoutSession } from "@/lib/types";
import type { SessionExerciseLogRow } from "@/lib/workouts";
import {
  formatBodyMeasurementDate,
  sessionInstantLabel,
  workoutStatusBadgeClass,
  workoutStatusLabelEs,
} from "@/lib/format-workout-session";
import { AchievementBadge } from "@/components/client/achievement-badge";

import { PhotoGallery } from "@/components/photos/photo-gallery";
import { PhotoCompare } from "@/components/photos/photo-compare";
import type { ProgressPhoto } from "@/components/photos/photo-card";

const RoutineDayCards = dynamic(
  () => import("@/components/routines/routine-day-cards"),
  {
    ssr: false,
    loading: () => <Skeleton className="min-h-40 w-full rounded-xl" />,
  },
);

export type HubWorkoutSession = WorkoutSession & {
  routine_days?: {
    day_name?: string | null;
    day_number?: number | null;
  } | null;
};

type BodyMeasurementRow = {
  id: string;
  recorded_at: string;
  weight?: number | null;
  body_fat_pct?: number | null;
};

// Actualizado para coincidir con el componente PhotoCard
export type ProgressPhotoRow = ProgressPhoto;

export type ClientHubClient = {
  id: string;
  full_name: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  status?: string | null;
  goal?: string | null;
  notes?: string | null;
  last_session_at?: string | null;
  user_id?: string | null;
  onboarding_completed?: boolean | null;
  experience_level?: string | null;
  plan_name?: string | null;
  days_until_expiry?: number | null;
};

type ClientHubProfile = {
  role?: string | null;
  streak_days?: number | null;
  last_workout_at?: string | null;
  xp_points?: number | null;
  level?: number | null;
  onboarding_completed?: boolean | null;
} | null;

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

function formatRelativeDays(fromIso?: string | null) {
  if (!fromIso) return "-";
  const from = new Date(fromIso);
  if (Number.isNaN(from.getTime())) return "-";
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff <= 0) return "hoy";
  if (diff === 1) return "ayer";
  return `hace ${diff} días`;
}

function trendFromSessions(sessions: HubWorkoutSession[]) {
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.started_at ?? "").getTime() -
      new Date(a.started_at ?? "").getTime(),
  );
  const last = sorted[0];
  const prev = sorted[1];
  const lastVol =
    typeof last?.total_volume_kg === "number" ? last.total_volume_kg : null;
  const prevVol =
    typeof prev?.total_volume_kg === "number" ? prev.total_volume_kg : null;
  if (lastVol == null || prevVol == null) return "flat";
  if (lastVol > prevVol) return "up";
  if (lastVol < prevVol) return "down";
  return "flat";
}

function exerciseGroupsFromLogs(logs: SessionExerciseLogRow[]) {
  const order: string[] = [];
  const byName = new Map<string, SessionExerciseLogRow[]>();
  for (const log of logs) {
    if (!byName.has(log.exercise_name)) {
      order.push(log.exercise_name);
      byName.set(log.exercise_name, []);
    }
    byName.get(log.exercise_name)!.push(log);
  }
  return order.map((name) => ({ name, sets: byName.get(name)! }));
}

function formatSetLine(log: SessionExerciseLogRow) {
  const w = log.weight_kg != null ? `${log.weight_kg} kg` : "—";
  const r = log.reps != null ? `${log.reps} rep.` : "—";
  const bits = [
    log.is_pr ? "PR" : null,
    log.is_warmup ? "Calentamiento" : null,
  ].filter(Boolean);
  const tag = bits.length ? ` · ${bits.join(" · ")}` : "";
  return `Serie ${log.set_number}: ${w} × ${r}${tag}`;
}

const PROGRESS_VIEWPORT = 12;

export function ClientProfileHub({
  client,
  profile,
  routine,
  workoutSessions,
  sessionExerciseLogs,
  bodyMeasurements,
  progressPhotos,
  personalRecords,
  userAchievements,
  clientId,
}: {
  client: ClientHubClient;
  profile: ClientHubProfile;
  routine: Routine | null;
  workoutSessions: HubWorkoutSession[];
  sessionExerciseLogs: SessionExerciseLogRow[];
  bodyMeasurements: BodyMeasurementRow[];
  progressPhotos: ProgressPhotoRow[];
  personalRecords: any[];
  userAchievements: any[];
  clientId?: string;
}) {
  const [tab, setTab] = useState("summary");
  const [notesDraft, setNotesDraft] = useState<string>(client?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const lastSessionAt =
    workoutSessions?.[0]?.started_at || client?.last_session_at || null;
  const streakDays = profile?.streak_days ?? null;
  const trend = useMemo(
    () => trendFromSessions(workoutSessions || []),
    [workoutSessions],
  );

  const logsBySessionId = useMemo(() => {
    const m = new Map<string, SessionExerciseLogRow[]>();
    for (const row of sessionExerciseLogs || []) {
      if (!m.has(row.workout_session_id)) m.set(row.workout_session_id, []);
      m.get(row.workout_session_id)!.push(row);
    }
    return m;
  }, [sessionExerciseLogs]);

  const progressRows = useMemo(() => {
    const list = [...(workoutSessions || [])].slice(0, PROGRESS_VIEWPORT);
    list.sort(
      (a, b) =>
        new Date(a.started_at ?? 0).getTime() -
        new Date(b.started_at ?? 0).getTime(),
    );
    const vols = list.map((s) => Math.max(0, s.total_volume_kg ?? 0));
    const maxVol = vols.length ? Math.max(...vols) : 0;
    return { list, maxVol };
  }, [workoutSessions]);

  const measurementRows = useMemo(() => {
    const list = [...(bodyMeasurements || [])];
    return list.map((m, i) => {
      const older = list[i + 1];
      let weightDelta: string | null = null;
      if (
        older &&
        m.weight != null &&
        older.weight != null &&
        Math.abs(m.weight - older.weight) > 1e-6
      ) {
        const d = m.weight - older.weight;
        const sign = d > 0 ? "+" : "";
        weightDelta = `${sign}${d.toFixed(1)} kg vs medición anterior`;
      }
      return { ...m, weightDelta };
    });
  }, [bodyMeasurements]);

  async function saveNotes() {
    try {
      setIsSaving(true);
      setSaveError(null);

      const supabase = createClient();
      const { error } = await supabase
        .from("clients")
        .update({ notes: notesDraft || null })
        .eq("id", client.id);

      if (error) throw error;
      setIsSaving(false);
    } catch (e: unknown) {
      setIsSaving(false);
      setSaveError(e instanceof Error ? e.message : "Error al guardar notas");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-md border-b sm:static sm:z-auto sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-none">
          <ScrollArea className="w-full whitespace-nowrap pb-1">
            <TabsList className="inline-flex w-auto bg-card/60 backdrop-blur-xl p-1 h-12 rounded-[1rem] border border-border/50 shadow-sm mb-1">
              <TabsTrigger
                value="summary"
                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all gap-2 text-[14px] font-medium"
              >
                <Target className="size-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger
                value="routine"
                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all gap-2 text-[14px] font-medium"
              >
                <Dumbbell className="size-4" />
                Rutina
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all gap-2 text-[14px] font-medium"
              >
                <History className="size-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all gap-2 text-[14px] font-medium"
              >
                <ArrowUpRight className="size-4" />
                Progreso
              </TabsTrigger>
              <TabsTrigger
                value="measurements"
                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all gap-2 text-[14px] font-medium"
              >
                <Ruler className="size-4" />
                Medidas
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all gap-2 text-[14px] font-medium"
              >
                <Camera className="size-4" />
                Fotos
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all gap-2 text-[14px] font-medium"
              >
                <Notebook className="size-4" />
                Notas
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all gap-2 text-[14px] font-medium"
              >
                <Trophy className="size-4" />
                Logros
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        <TabsContent value="summary" className="flex flex-col gap-6 pt-2">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase font-black tracking-widest opacity-80">
                <ArrowUpRight className="size-4" />
                Última sesión
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-2xl font-bold tracking-tight">
                  {formatRelativeDays(lastSessionAt)}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Fecha: {formatDate(lastSessionAt)}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase font-black tracking-widest opacity-80">
                <Dumbbell className="size-4" />
                Racha
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-2xl font-bold tracking-tight">{streakDays ?? "-"}</div>
                <div className="text-xs font-medium text-muted-foreground">
                  días consecutivos
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase font-black tracking-widest opacity-80">
                <History className="size-4" />
                Tendencia
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-2xl font-bold tracking-tight">
                  {trend === "up" ? "Creciendo" : trend === "down" ? "Bajando" : "Estable"}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  volumen total vs anterior
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase font-black tracking-widest opacity-80">
                <Trophy className="size-4" />
                Récords (PR)
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-2xl font-bold tracking-tight">{personalRecords?.length ?? 0}</div>
                <div className="text-xs font-medium text-muted-foreground">
                  hitos de fuerza
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
             <div className="lg:col-span-8 flex flex-col gap-6">
                <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[17px] font-bold">Resumen del atleta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <Avatar className="size-[4rem] rounded-[1.2rem] border-2 border-background shadow-sm shrink-0">
                        {client?.avatar_url ? (
                          <AvatarImage
                            src={client.avatar_url}
                            alt={client.full_name ?? "Cliente"}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">
                          {(client?.full_name || "?").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="text-xl font-bold leading-none truncate">
                            {client?.full_name || "-"}
                          </div>
                          {client?.status ? (
                            <AdminClientStatusBadge status={client.status} />
                          ) : null}
                        </div>
                        <div className="text-[13px] font-medium opacity-90 text-muted-foreground truncate">
                          {client?.email ? `${client.email}` : "Sin email"}
                          <span className="mx-2 opacity-50">·</span>
                          {client?.phone ? `${client.phone}` : "Sin teléfono"}
                        </div>
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="inline-flex items-center gap-2 text-sm bg-muted/20 rounded-lg px-3 py-2 w-fit">
                            <span className="font-semibold text-foreground">
                            {client?.plan_name ? client.plan_name : "Sin plan activo"}
                            </span>
                            <span className="opacity-50 text-muted-foreground">·</span>
                            <span className="font-medium text-muted-foreground">
                              {client?.days_until_expiry != null
                                ? client.days_until_expiry > 0
                                  ? `Vence en ${client.days_until_expiry} días`
                                  : "Membresía vencida"
                                : "Sin fecha de vencimiento"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 items-center">
                          {client?.goal && (
                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest gap-1 bg-primary/10 text-primary border-primary/20">
                              <Target className="size-3" />
                              {getGoalLabel(client.goal)}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest border-border/60">
                            Onboarding:{" "}
                            {profile?.onboarding_completed ||
                            client?.onboarding_completed ||
                            (client?.user_id && client?.goal && client?.experience_level)
                              ? "LISTO"
                              : "PENDIENTE"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
             </div>

             <div className="lg:col-span-4">
                <Card className="h-full border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden transition-all hover:bg-card">
                   <CardHeader className="pb-3 border-b border-border/30">
                      <div className="flex items-center justify-between">
                         <CardTitle className="text-[15px] font-bold">Top Records (PRs)</CardTitle>
                         <Trophy className="size-4 text-primary" />
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <ScrollArea className="h-[200px]">
                         <div className="divide-y divide-border/20">
                            {personalRecords?.length > 0 ? (
                               personalRecords.slice(0, 5).map((pr) => (
                                  <div key={pr.exercise_id} className="flex flex-col gap-1 p-4 transition-colors hover:bg-primary/5">
                                     <div className="text-[13px] font-black uppercase tracking-tight text-foreground truncate">
                                        {pr.exercise_name}
                                     </div>
                                     <div className="flex items-center justify-between">
                                        <div className="text-lg font-black text-primary italic">
                                           {pr.weight_kg} <span className="text-xs">kg</span>
                                           <span className="mx-1 text-muted-foreground">×</span>
                                           {pr.reps} <span className="text-xs">reps</span>
                                        </div>
                                        <time className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                           {formatDate(pr.achieved_at)}
                                        </time>
                                     </div>
                                  </div>
                               ))
                            ) : (
                               <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-6 text-center">
                                  <Dumbbell className="size-8 opacity-20 mb-3" />
                                  <div className="text-xs font-bold uppercase tracking-widest opacity-60">Sin récords aún</div>
                               </div>
                            )}
                         </div>
                      </ScrollArea>
                   </CardContent>
                </Card>
             </div>
           </div>

           {userAchievements.length > 0 && (
             <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
               <CardHeader className="pb-3 border-b border-border/30">
                 <div className="flex items-center justify-between">
                   <CardTitle className="text-[15px] font-bold">Logros Recientes</CardTitle>
                   <Trophy className="size-4 text-primary" />
                 </div>
               </CardHeader>
               <CardContent className="p-6">
                 <div className="flex flex-wrap gap-6">
                   {userAchievements.slice(0, 8).map((ua) => (
                     <AchievementBadge
                       key={ua.id}
                       achievement={ua.achievements}
                       unlocked={true}
                       size="md"
                       showDetails={true}
                     />
                   ))}
                 </div>
               </CardContent>
             </Card>
           )}
        </TabsContent>

        <TabsContent value="routine" className="flex flex-col gap-4 pt-2">
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="size-4" />
                Rutina asignada
              </CardTitle>
              {clientId ? (
                <Button
                  asChild
                  size="sm"
                  variant={routine ? "outline" : "default"}
                >
                  <Link href={`/admin/clients/${clientId}/assign-routine`}>
                    <Plus className="mr-1 size-4" />
                    {routine ? "Cambiar rutina" : "Asignar rutina"}
                  </Link>
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              {routine ? (
                <div className="grid gap-4">
                  <div className="grid gap-1">
                    <div className="text-lg font-semibold">{routine.name}</div>
                    {routine.description ? (
                      <div className="text-sm text-muted-foreground">
                        {routine.description}
                      </div>
                    ) : null}
                    <div className="text-sm text-muted-foreground">
                      Duración:{" "}
                      {routine.duration_weeks
                        ? `${routine.duration_weeks} semanas`
                        : "-"}{" "}
                      · Días:{" "}
                      {routine.days_per_week ||
                        routine.routine_days?.length ||
                        "-"}
                    </div>
                  </div>
                  <RoutineDayCards
                    days={(routine.routine_days || []).slice(0, 7)}
                    compact
                    emptyMessage="Esta rutina aún no tiene días cargados."
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Sin rutina asignada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="flex flex-col gap-4 pt-2">
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4" />
                Sesiones recientes
              </CardTitle>
              <CardDescription>
                Fecha y hora según el inicio real de la sesión. El bloque de
                rutina es la plantilla asignada a ese entreno, no el día del
                calendario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(workoutSessions || []).length === 0 ? (
                <Empty className="border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <History />
                    </EmptyMedia>
                    <EmptyTitle>Aún no hay sesiones</EmptyTitle>
                    <EmptyDescription>
                      Cuando el asesorado registre entrenos, aparecerán aquí con
                      volumen y detalle de series.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Accordion type="multiple" className="flex flex-col gap-2">
                  {(workoutSessions || []).map((s) => {
                    const when = sessionInstantLabel(
                      s.started_at ?? s.created_at,
                    );
                    const routineDay = s.routine_days?.day_name?.trim();
                    const logs = logsBySessionId.get(s.id) ?? [];
                    const groups = exerciseGroupsFromLogs(logs);
                    const vol = s.total_volume_kg ?? 0;
                    const volLabel =
                      vol > 0
                        ? `${vol} kg de volumen`
                        : "Volumen en 0 — puede ser sesión sin cargas registradas";

                    return (
                      <AccordionItem
                        key={s.id}
                        value={s.id}
                        className="rounded-2xl border border-border/60 bg-card/40 px-4 last:border-b transition-all data-[state=open]:bg-card/80 data-[state=open]:shadow-sm"
                      >
                        <AccordionTrigger className="py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                          <div className="flex w-full flex-col gap-1.5 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold tracking-tight leading-snug text-[15px]">
                                {when.dateLine}
                              </div>
                              <div className="text-muted-foreground text-[13px] font-medium opacity-90">
                                {when.timeLine ? `${when.timeLine} · ` : null}
                                <span className={vol > 0 ? "text-foreground font-semibold" : ""}>{volLabel}</span>
                                {typeof s.exercises_completed === "number" && s.exercises_completed > 0
                                  ? ` · ${s.exercises_completed} ejercicios`
                                  : null}
                              </div>
                              {routineDay ? (
                                <div className="text-muted-foreground mt-1 text-[13px] font-medium">
                                  Bloque: {" "}
                                  <span className="text-primary bg-primary/10 rounded-md px-1.5 py-0.5 font-bold">
                                    {routineDay}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                            <Badge
                              variant="outline"
                              className={`shrink-0 font-bold uppercase tracking-wider text-[10px] mt-2 sm:mt-0 ${workoutStatusBadgeClass(s.status)}`}
                            >
                              {workoutStatusLabelEs(s.status)}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <Separator className="mb-3" />
                          {groups.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                              No hay series registradas en esta sesión. Si el
                              entreno se completó desde otro flujo, revisa que
                              los logs se hayan guardado correctamente.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <p className="text-muted-foreground text-xs">
                                Detalle opcional: despliega para revisar series
                                sin ir al historial técnico.
                              </p>
                              {groups.map(({ name, sets }) => (
                                <div
                                  key={name}
                                  className="rounded-xl bg-muted/40 border border-border/50 px-3.5 py-2.5"
                                >
                                  <div className="text-sm font-bold tracking-tight">
                                    {name}
                                  </div>
                                  <ul className="mt-1 flex flex-col gap-0.5 text-muted-foreground text-xs">
                                    {sets.map((log, idx) => (
                                      <li
                                        key={`${name}-${log.set_number}-${idx}`}
                                      >
                                        {formatSetLine(log)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="flex flex-col gap-4 pt-2">
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Progreso (volumen total)
              </CardTitle>
              <CardDescription>
                Últimas {PROGRESS_VIEWPORT} sesiones en orden cronológico. La
                barra es proporcional al mayor volumen de esta lista (no a un
                valor fijo).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progressRows.list.length === 0 ? (
                <Empty className="border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Target />
                    </EmptyMedia>
                    <EmptyTitle>Sin datos de volumen</EmptyTitle>
                    <EmptyDescription>
                      Cuando haya sesiones completadas, verás la evolución aquí.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div
                  className="flex flex-col gap-4"
                  aria-label="Volumen por sesión"
                >
                  {progressRows.list.map((s) => {
                    const vol = Math.max(0, s.total_volume_kg ?? 0);
                    const pct =
                      progressRows.maxVol > 0
                        ? Math.min(
                            100,
                            Math.round((vol / progressRows.maxVol) * 100),
                          )
                        : 0;
                    const when = sessionInstantLabel(
                      s.started_at ?? s.created_at,
                    );
                    const isEmptyVol = vol <= 0;

                    return (
                      <div
                        key={s.id}
                        className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-card/40 p-4 transition-all hover:bg-card/60 hover:shadow-sm sm:grid sm:grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1.5fr)] sm:items-center sm:gap-4"
                      >
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium ${isEmptyVol ? "text-muted-foreground" : ""}`}
                          >
                            {when.dateLine}
                          </div>
                          {when.timeLine ? (
                            <div className="text-muted-foreground text-xs">
                              {when.timeLine}
                            </div>
                          ) : null}
                        </div>
                        <div
                          className={`tabular-nums text-sm font-semibold ${isEmptyVol ? "text-muted-foreground" : ""}`}
                        >
                          {vol} kg
                        </div>
                        <div className="min-w-0 sm:pt-0">
                          <Progress
                            value={pct}
                            className={isEmptyVol ? "opacity-40" : ""}
                            aria-label={`Volumen relativo ${pct} por ciento`}
                          />
                          {isEmptyVol ? (
                            <span className="text-muted-foreground mt-1 block text-xs">
                              Sin volumen registrado
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="flex flex-col gap-4 pt-2">
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ruler className="size-4" />
                Medidas corporales
              </CardTitle>
              <CardDescription>
                Más recientes primero. Comparación de peso respecto a la
                medición anterior en la lista.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(bodyMeasurements || []).length === 0 ? (
                <Empty className="border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Ruler />
                    </EmptyMedia>
                    <EmptyTitle>Sin medidas</EmptyTitle>
                    <EmptyDescription>
                      El asesorado aún no registró mediciones corporales.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col gap-0 divide-y divide-border/50 rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
                  {measurementRows.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col gap-1 px-4 py-3 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="text-sm font-medium">
                        {formatBodyMeasurementDate(m.recorded_at)}
                      </div>
                      <div className="text-foreground/90 text-sm">
                        <span className="font-medium">Peso:</span>{" "}
                        {m.weight ?? "—"} kg
                        <span className="text-muted-foreground mx-2">·</span>
                        <span className="font-medium">Grasa:</span>{" "}
                        {m.body_fat_pct ?? "—"}%
                      </div>
                      {m.weightDelta ? (
                        <div className="text-muted-foreground text-xs">
                          {m.weightDelta}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="photos"
          className="flex flex-col gap-8 focus-visible:outline-none pt-2"
        >
          <Tabs defaultValue="gallery" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
              <div>
                <h3 className="text-[17px] font-bold tracking-tight">Registro Visual</h3>
                <p className="text-sm font-medium text-muted-foreground">
                  Monitorea el progreso físico del asesorado.
                </p>
              </div>
              <TabsList className="grid grid-cols-2 w-full sm:w-[300px] h-12 p-1 bg-card/60 backdrop-blur-xl border border-border/50 shadow-sm rounded-[1rem]">
                <TabsTrigger
                  value="gallery"
                  className="rounded-lg gap-2 text-[13px] font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
                >
                  <LayoutGrid className="size-4" />
                  Galería
                </TabsTrigger>
                <TabsTrigger
                  value="compare"
                  className="rounded-lg gap-2 text-[13px] font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
                >
                  <Diff className="size-4" />
                  Comparador
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="gallery" className="focus-visible:outline-none">
              {(progressPhotos || []).length === 0 ? (
                <Empty className="border-2 border-dashed bg-muted/20 rounded-3xl py-16">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Camera className="text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>Sin fotos de progreso</EmptyTitle>
                    <EmptyDescription>
                      El asesorado aún no ha cargado imágenes de su evolución.
                      Puedes pedirle que suba fotos desde su perfil.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <PhotoGallery
                  photos={progressPhotos as ProgressPhoto[]}
                  showActions={false} // Admin can't delete for now, or we can enable if needed
                />
              )}
            </TabsContent>

            <TabsContent value="compare" className="focus-visible:outline-none">
              <PhotoCompare photos={progressPhotos as ProgressPhoto[]} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="notes" className="flex flex-col gap-4 pt-2">
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Notebook className="size-4" />
                Notas del coach
              </CardTitle>
              <CardDescription>
                Privadas: solo el equipo de asesoría las ve en esta ficha.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="coach-private-notes">
                    Observaciones
                  </FieldLabel>
                  <FieldDescription>
                    Lesiones, preferencias, límites, estilo de entreno o
                    acuerdos con el asesorado.
                  </FieldDescription>
                  <FieldContent>
                    <Textarea
                      id="coach-private-notes"
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Escribe notas útiles para seguimiento..."
                      className="min-h-36 resize-y"
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>

              {saveError ? (
                <div className="text-destructive text-sm" role="alert">
                  {saveError}
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t bg-muted/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-xs">
                Los cambios se guardan al pulsar guardar. Descartar restaura el
                texto que había al cargar la página.
              </p>
              <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setNotesDraft(client?.notes || "");
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  Descartar
                </Button>
                <Button type="button" onClick={saveNotes} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Spinner
                        data-icon="inline-start"
                        className="opacity-80"
                      />
                      Guardando…
                    </>
                  ) : (
                    "Guardar notas"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="flex flex-col gap-4 pt-2">
           <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
             <CardHeader className="pb-3 text-center sm:text-left">
               <CardTitle className="flex items-center justify-center sm:justify-start gap-2 text-base">
                 <Trophy className="size-4 text-primary" />
                 Logros y Títulos
               </CardTitle>
               <CardDescription>
                 Hitos desbloqueados por el atleta a través de su esfuerzo y consistencia.
               </CardDescription>
             </CardHeader>
             <CardContent className="p-6">
               {userAchievements.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                    <Trophy className="size-12 opacity-20 mb-4" />
                    <div className="text-sm font-bold uppercase tracking-widest opacity-60">Sin logros desbloqueados aún</div>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                   {userAchievements.map((ua) => (
                     <div key={ua.id} className="flex flex-col items-center gap-2">
                       <AchievementBadge
                         achievement={ua.achievements}
                         unlocked={true}
                         size="md"
                         showDetails={true}
                         showMilestoneBadge={true}
                       />
                     </div>
                   ))}
                 </div>
               )}
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
