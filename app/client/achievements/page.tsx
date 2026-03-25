import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  CalendarDays,
  Flame,
  Info,
  Medal,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { AchievementBadge } from '@/components/client/achievement-badge'
import { AchievementsCatalog } from '@/components/client/achievements-catalog'
import { getLevelName, calculateLevel } from '@/lib/types'
import { getUserAchievements } from '@/lib/gamification'
import { cn } from '@/lib/utils'
import { ClientStackPageHeader } from '@/components/client/client-app-page-parts'

export default async function ClientAchievementsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const [
    { data: profile },
    { unlocked: userAchievements, locked: lockedAchievements, progress },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('xp_points, level, full_name, avatar_url, streak_days')
      .eq('id', user.id)
      .single(),
    getUserAchievements(user.id),
  ])

  const { data: clientRow } = await supabase
    .from('clients')
    .select('total_sessions')
    .eq('user_id', user.id)
    .maybeSingle()

  const levelInfo = calculateLevel(profile?.xp_points || 0)
  const levelName = getLevelName(levelInfo.level)

  const uaAchievements = userAchievements
    .map((ua) => ua.achievements)
    .filter(Boolean) as NonNullable<(typeof userAchievements)[number]['achievements']>[]

  const unlockedAchievementIds = new Set(uaAchievements.map((a) => a.id))
  const allAchievements = [
    ...uaAchievements,
    ...lockedAchievements.filter((a) => !unlockedAchievementIds.has(a.id)),
  ]

  const unlockedCount = userAchievements.length
  const totalCount = allAchievements.length
  const unlockedPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  const { data: leaderboardData, error: leaderboardError } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(8)

  const leaderboard = leaderboardError ? [] : (leaderboardData ?? [])

  const recentlyUnlocked = [...userAchievements]
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 3)

  const totalSessions = clientRow?.total_sessions ?? 0
  const streakDays = profile?.streak_days ?? 0
  const progressById = Object.fromEntries(progress)

  const achievementsSubtitle = `${unlockedCount} de ${totalCount} hitos · ${totalSessions} sesiones · ${streakDays} días de racha`

  return (
    <>
      <ClientStackPageHeader title="Progreso y reconocimientos" subtitle={achievementsSubtitle} />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 pb-12">
      <section aria-label="Resumen de progreso" className="flex flex-col gap-4">
        <Card className="overflow-hidden border-muted/70 shadow-none">
          <CardHeader className="flex flex-col gap-1 pb-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Tu etapa actual</CardTitle>
              <CardDescription>
                {levelName} · nivel {levelInfo.level} · experiencia acumulada en la app
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit font-medium tabular-nums">
              {levelInfo.currentXP} XP
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Hasta el siguiente nivel</span>
                <span className="tabular-nums">
                  {levelInfo.currentXP} / {levelInfo.xpForNextLevel} XP
                </span>
              </div>
              <Progress value={levelInfo.progress} className="h-2 bg-muted" />
              <p className="text-xs text-muted-foreground">
                Faltan{' '}
                <span className="font-semibold text-foreground tabular-nums">
                  {Math.max(0, levelInfo.xpForNextLevel - levelInfo.currentXP)}
                </span>{' '}
                XP para el nivel {levelInfo.level + 1}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="border-muted/60 bg-muted/15 shadow-none">
                <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Trophy className="size-4 shrink-0" aria-hidden />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold tabular-nums tracking-tight">{unlockedPercentage}%</p>
                  <p className="text-xs font-medium text-muted-foreground">Hitos completados</p>
                  <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                    {unlockedCount} de {totalCount}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-muted/60 bg-muted/15 shadow-none">
                <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays className="size-4 shrink-0" aria-hidden />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold tabular-nums tracking-tight">{totalSessions}</p>
                  <p className="text-xs font-medium text-muted-foreground">Sesiones registradas</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Total histórico en tu perfil</p>
                </CardContent>
              </Card>

              <Card className="border-muted/60 bg-muted/15 shadow-none">
                <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Flame className="size-4 shrink-0" aria-hidden />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold tabular-nums tracking-tight">{streakDays}</p>
                  <p className="text-xs font-medium text-muted-foreground">Días de racha</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Entrenos consecutivos con registro</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {recentlyUnlocked.length > 0 && (
        <section className="flex flex-col gap-4" aria-label="Últimos hitos">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Target className="size-4 text-primary" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Últimos hitos</h2>
              <p className="text-xs text-muted-foreground">Los más recientes que completaste</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recentlyUnlocked.map((ua) => (
              <Card key={ua.id} className="border-muted/70 shadow-none transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <AchievementBadge achievement={ua.achievements!} unlocked size="lg" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold leading-snug">{ua.achievements!.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(ua.unlocked_at).toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4" aria-label="Catálogo de hitos">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Activity className="size-4 text-primary" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">Todos los hitos</h2>
            <p className="text-xs text-muted-foreground">Filtra por tipo y revisa el objetivo de cada uno</p>
          </div>
        </div>
        <AchievementsCatalog
          achievements={allAchievements}
          userAchievements={userAchievements}
          progressById={progressById}
        />
      </section>

      {leaderboard.length > 0 && (
        <section className="flex flex-col gap-4" aria-label="Actividad en el gym">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <TrendingUp className="size-4 text-primary" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Compañeros con más actividad</h2>
              <p className="text-xs text-muted-foreground">Ranking por XP y logros en la plataforma</p>
            </div>
          </div>
          <Card className="overflow-hidden border-muted/70 shadow-none">
            <CardContent className="p-0">
              <ul className="divide-y divide-border/80">
                {leaderboard.map((entry) => {
                  const displayRank = entry.rank ?? 0
                  const name = entry.full_name?.trim() || 'Sin nombre'
                  return (
                  <li
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 transition-colors',
                      entry.id === user.id ? 'bg-primary/5' : 'hover:bg-muted/40',
                    )}
                  >
                    <span className="flex size-8 items-center justify-center text-sm font-semibold tabular-nums text-muted-foreground">
                      {displayRank}
                    </span>
                    <div className="relative shrink-0">
                      <div className="size-10 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm">
                        {entry.avatar_url ? (
                          <Image
                            src={entry.avatar_url}
                            alt=""
                            width={40}
                            height={40}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                            {name[0]?.toUpperCase() ?? '?'}
                          </div>
                        )}
                      </div>
                      {displayRank === 1 && (
                        <Medal
                          className="absolute -right-1 -top-1 size-4 text-amber-600 dark:text-amber-400"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {name}
                        {entry.id === user.id && (
                          <Badge variant="secondary" className="ms-2 align-middle text-[10px] font-medium">
                            Tú
                          </Badge>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{getLevelName(entry.level)}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-semibold tabular-nums text-primary">{entry.xp_points} XP</p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {entry.achievements_count} hitos
                      </p>
                    </div>
                  </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      <Alert className="border-muted/70">
        <Info className="size-4" aria-hidden />
        <AlertTitle className="text-sm">¿Cómo ganas experiencia?</AlertTitle>
        <AlertDescription className="text-xs leading-relaxed text-pretty">
          Completar entrenos, mantener rachas y registrar marcas personales suman XP automáticamente. Cada hito
          desbloqueado añade su recompensa y refleja hábitos reales — no puntos artificiales por usar la app.
        </AlertDescription>
      </Alert>
      </div>
    </>
  )
}
