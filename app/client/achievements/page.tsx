import { getAuthUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CalendarDays,
  Flame,
  Info,
  Medal,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { AchievementBadge } from "@/components/client/achievement-badge";
import { AchievementsCatalog } from "@/components/client/achievements-catalog";
import { getLevelName, calculateLevel } from "@/lib/types";
import {
  checkAchievements,
  getUserAchievements,
  resolveClientTotalSessions,
} from "@/lib/gamification";
import { cn } from "@/lib/utils";
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientStackPageHeader,
} from "@/components/client/client-app-page-parts";

export default async function ClientAchievementsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();

  await checkAchievements(user.id);

  const [
    { data: profile },
    { unlocked: userAchievements, locked: lockedAchievements, progress },
    totalSessions,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("xp_points, level, full_name, avatar_url, streak_days")
      .eq("id", user.id)
      .single(),
    getUserAchievements(user.id),
    resolveClientTotalSessions(user.id),
  ]);

  const levelInfo = calculateLevel(profile?.xp_points || 0);
  const levelName = getLevelName(levelInfo.level);

  const uaAchievements = userAchievements
    .map((ua) => ua.achievements)
    .filter(Boolean) as NonNullable<
    (typeof userAchievements)[number]["achievements"]
  >[];

  const unlockedAchievementIds = new Set(uaAchievements.map((a) => a.id));
  const allAchievements = [
    ...uaAchievements,
    ...lockedAchievements.filter((a) => !unlockedAchievementIds.has(a.id)),
  ];

  const unlockedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const unlockedPercentage =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const { data: leaderboardData, error: leaderboardError } = await supabase
    .from("leaderboard")
    .select("*")
    .order("rank", { ascending: true })
    .limit(8);

  const leaderboard = leaderboardError ? [] : (leaderboardData ?? []);

  const recentlyUnlocked = [...userAchievements]
    .sort(
      (a, b) =>
        new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime(),
    )
    .slice(0, 3);

  const streakDays = profile?.streak_days ?? 0;
  const progressById = Object.fromEntries(progress);

  const achievementsSubtitle = `${unlockedCount} de ${totalCount} hitos · ${totalSessions} sesiones · ${streakDays} días de racha`;

  return (
    <>
      <ClientStackPageHeader
        title="Progreso y reconocimientos"
        subtitle={achievementsSubtitle}
      />
      <div className={`${CLIENT_DATA_PAGE_SHELL} flex flex-col gap-8`}>
        <section aria-label="Resumen de progreso" className="flex flex-col gap-6">
          {/* XP Hub Header Card */}
          <Card className="overflow-hidden border-border/80 shadow-md ring-1 ring-primary/5 rounded-[2rem] bg-gradient-to-br from-primary/10 via-background to-background relative">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Medal className="size-32 text-primary" />
             </div>
             
             <CardHeader className="pb-8 pt-10 px-8">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Progreso de Temporada</span>
                    </div>
                    <CardTitle className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">
                      Nivel {levelInfo.level}
                    </CardTitle>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-none">
                      {levelName}
                    </p>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                   <Badge variant="secondary" className="font-black text-xs px-3 py-1.5 bg-primary text-primary-foreground border-none rounded-xl">
                     {levelInfo.currentXP.toLocaleString()} XP
                   </Badge>
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Acumulado Total</span>
                 </div>
               </div>
             </CardHeader>
             
             <CardContent className="px-8 pb-10">
               <div className="flex flex-col gap-6">
                 {/* Thick Stylized Progress Bar */}
                 <div className="space-y-4 relative">
                   <div className="flex items-end justify-between gap-4 h-5 px-1 font-black text-[10px] uppercase tracking-widest">
                     <span className="text-primary/60">Actual</span>
                     <span className="text-muted-foreground/40">Siguiente Nivel</span>
                   </div>
                   <div className="relative h-6 w-full bg-muted/20 rounded-full overflow-hidden border border-muted/30 p-1">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        style={{ width: `${levelInfo.progress}%` }}
                      >
                         <div className="size-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
                      </div>
                   </div>
                   <div className="flex items-center justify-between gap-2 px-2">
                     <p className="text-[11px] font-bold text-muted-foreground">
                       <span className="text-foreground font-black tabular-nums">{levelInfo.currentXP}</span> / {levelInfo.xpForNextLevel} XP
                     </p>
                     <p className="text-[11px] font-medium text-muted-foreground italic">
                       Faltan <span className="text-primary font-black tabular-nums">{(levelInfo.xpForNextLevel - levelInfo.currentXP).toLocaleString()} XP</span> para Nivel {levelInfo.level + 1}
                     </p>
                   </div>
                 </div>

                 {/* High Density Stats Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="group flex flex-col gap-4 rounded-3xl border border-border/40 p-6 bg-card/40 backdrop-blur-sm transition-all hover:bg-card">
                       <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/10 text-primary group-hover:scale-110 transition-transform">
                         <Trophy className="size-5" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-3xl font-black tabular-nums tracking-tighter">{unlockedPercentage}%</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Completado</span>
                       </div>
                    </div>

                    <div className="group flex flex-col gap-4 rounded-3xl border border-border/40 p-6 bg-card/40 backdrop-blur-sm transition-all hover:bg-card">
                       <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/10 text-primary group-hover:scale-110 transition-transform">
                         <CalendarDays className="size-5" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-3xl font-black tabular-nums tracking-tighter">{totalSessions}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Sesiones</span>
                       </div>
                    </div>

                    <div className="group flex flex-col gap-4 rounded-3xl border border-border/40 p-6 bg-card/40 backdrop-blur-sm transition-all hover:bg-card">
                       <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/10 text-primary group-hover:scale-110 transition-transform">
                         <Flame className="size-5" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-3xl font-black tabular-nums tracking-tighter">{streakDays}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Días Racha</span>
                       </div>
                    </div>
                 </div>
               </div>
             </CardContent>
          </Card>
        </section>

        {recentlyUnlocked.length > 0 && (
          <section className="flex flex-col gap-6" aria-label="Últimos hitos">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Target className="size-5 text-primary" aria-hidden />
                Muro de Títulos
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">
                Tus logros más recientes
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {recentlyUnlocked.map((ua) => (
                <Card
                  key={ua.id}
                  className="border-border/80 shadow-md ring-1 ring-primary/5 rounded-3xl overflow-hidden bg-card/50 transition-all hover:bg-card hover:translate-y-[-2px]"
                >
                  <CardContent className="flex flex-col items-center gap-6 p-8 text-center bg-gradient-to-t from-primary/5 to-transparent">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                      <AchievementBadge
                        achievement={ua.achievements!}
                        unlocked
                        size="xl"
                        className="relative z-10"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-base font-black leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {ua.achievements!.name}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {new Date(ua.unlocked_at).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-6" aria-label="Catálogo de hitos">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Activity className="size-5 text-primary" aria-hidden />
              Biblioteca de Logros
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">
              Explora y planifica tus próximos objetivos
            </p>
          </div>
          <Card className="overflow-hidden border-border/80 shadow-md ring-1 ring-primary/5 rounded-[2rem] bg-card/60 backdrop-blur-sm">
             <CardContent className="p-1 sm:p-2">
                <AchievementsCatalog
                  achievements={allAchievements}
                  userAchievements={userAchievements}
                  progressById={progressById}
                />
             </CardContent>
          </Card>
        </section>

        {leaderboard.length > 0 && (
          <section className="flex flex-col gap-6" aria-label="Actividad en el gym">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" aria-hidden />
                Hall of Fame
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">
                Compañeros con más actividad de esta temporada
              </p>
            </div>
            <Card className="overflow-hidden border-border/80 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/50">
              <CardContent className="p-0">
                <ul className="divide-y divide-border/40">
                  {leaderboard.map((entry) => {
                    const displayRank = entry.rank ?? 0;
                    const name = entry.full_name?.trim() || "Sin nombre";
                    const isTopThree = displayRank <= 3;
                    return (
                      <li
                        key={entry.id}
                        className={cn(
                          "flex items-center gap-4 px-6 py-4 transition-all",
                          entry.id === user.id
                            ? "bg-primary/10 ring-inset ring-1 ring-primary/20"
                            : "hover:bg-muted/40",
                        )}
                      >
                        <span className={cn(
                          "flex size-9 items-center justify-center text-sm font-black tabular-nums rounded-xl shrink-0",
                          displayRank === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                          displayRank === 2 ? "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400" :
                          displayRank === 3 ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" :
                          "text-muted-foreground/40 bg-muted/10 font-bold"
                        )}>
                          #{displayRank}
                        </span>
                        <div className="relative shrink-0">
                          <div className={cn(
                            "size-11 overflow-hidden rounded-2xl border-2 bg-background shadow-sm",
                            isTopThree ? "border-primary/40 ring-4 ring-primary/5 scale-110" : "border-border"
                          )}>
                            {entry.avatar_url ? (
                              <Image
                                src={entry.avatar_url}
                                alt=""
                                width={44}
                                height={44}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center bg-primary text-xs font-black text-primary-foreground">
                                {name[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                          </div>
                          {isTopThree && (
                            <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-background ring-1 ring-border shadow-sm">
                              <Medal className={cn(
                                "size-4",
                                displayRank === 1 ? "text-amber-500" :
                                displayRank === 2 ? "text-slate-400" :
                                "text-orange-400"
                              )} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 ml-1">
                          <p className="truncate text-sm font-black tracking-tight leading-none">
                            {name}
                            {entry.id === user.id && (
                              <Badge className="ms-2 align-middle text-[9px] font-black uppercase tracking-widest h-4 px-1.5 bg-primary text-primary-foreground border-none">
                                Tú
                              </Badge>
                            )}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 mt-1.5">
                            {getLevelName(entry.level)}
                          </p>
                        </div>
                        <div className="text-end shrink-0">
                          <p className="text-sm font-black tabular-nums text-primary leading-none tracking-tighter">
                            {entry.xp_points.toLocaleString()} XP
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1.5">
                            {entry.achievements_count} Hitos
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}

        <Alert className="border-border/40 shadow-sm rounded-2xl bg-muted/5">
          <Info className="size-4 text-primary" aria-hidden />
          <AlertTitle className="text-xs font-black uppercase tracking-widest text-foreground">Sistema de Entrenamiento</AlertTitle>
          <AlertDescription className="text-[10px] font-medium leading-relaxed text-muted-foreground/80 mt-1">
            Tu XP se calcula dinámicamente según la intensidad de tus sesiones, volumen de racha y hitos desbloqueados. 
            Este sistema premia la consistencia real, no solo el uso de la aplicación.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
