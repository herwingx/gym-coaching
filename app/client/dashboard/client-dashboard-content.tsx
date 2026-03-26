'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LevelProgress } from '@/components/client/level-progress'
import { ClientDashboardCards } from '@/components/client/client-dashboard-cards'
import { Skeleton } from '@/components/ui/skeleton'

const ClientWorkoutChart = dynamic(
  () =>
    import('@/components/client/client-workout-chart').then((m) => ({
      default: m.ClientWorkoutChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[220px] w-full rounded-xl" />,
  },
)
import { NextWorkoutCard } from '@/components/client/next-workout-card'
import { AchievementBadge } from '@/components/client/achievement-badge'
import { Award, ChevronRight } from 'lucide-react'
import type { Profile, Routine, RoutineDay, LevelInfo, UserAchievement } from '@/lib/types'
import { ClientStackPageHeader, CLIENT_DATA_PAGE_SHELL } from '@/components/client/client-app-page-parts'

interface ClientDashboardContentProps {
  profile: Profile | null
  levelInfo: LevelInfo
  totalWorkouts: number
  totalVolume: number
  prsThisMonth: number
  assignedRoutine: Routine | null
  /** Mismo criterio que /client/workout/start (última sesión completada + orden day_number). */
  nextWorkoutRoutineDay: RoutineDay | null
  isRoutineCompleted?: boolean
  userAchievements: UserAchievement[]
  chartData: { date: string; sessions: number }[]
}

export function ClientDashboardContent({
  profile,
  levelInfo,
  totalWorkouts,
  totalVolume,
  prsThisMonth,
  assignedRoutine,
  nextWorkoutRoutineDay,
  isRoutineCompleted,
  userAchievements,
  chartData,
}: ClientDashboardContentProps) {
  const userLabel = profile?.full_name?.split(/\s+/).filter(Boolean)[0] || 'Asesorado'

  return (
    <>
    <ClientStackPageHeader
      title={`Hola, ${userLabel}`}
      subtitle="Tu resumen: nivel, entrenos, progreso y la próxima sesión."
      backHref={null}
    />
    <div
      className={`${CLIENT_DATA_PAGE_SHELL} grid gap-6 lg:grid-cols-12`}
    >
      <aside className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:self-start">
        <LevelProgress
          levelInfo={levelInfo}
          username={profile?.username || profile?.full_name}
          avatarUrl={profile?.avatar_url}
        />
        <ClientDashboardCards
          streakDays={profile?.streak_days || 0}
          totalWorkouts={totalWorkouts}
          totalVolume={totalVolume}
          prsThisMonth={prsThisMonth}
        />
      </aside>

      <section className="flex min-w-0 flex-col gap-6 lg:col-span-8">
        <ClientWorkoutChart data={chartData} />
        <NextWorkoutCard
          routineDay={nextWorkoutRoutineDay as any}
          routineName={assignedRoutine?.name}
          hasAssignedRoutine={!!assignedRoutine}
          isRoutineCompleted={isRoutineCompleted}
        />
        {userAchievements.length > 0 ? (
          <Card className="overflow-hidden border-muted/70 shadow-none bg-linear-to-br from-background to-muted/15">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <Award className="size-4 shrink-0 text-primary" aria-hidden />
                  Hitos recientes
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="h-8 shrink-0 px-2 text-xs font-semibold">
                  <Link href="/client/achievements" className="inline-flex items-center gap-1">
                    Ver progreso
                    <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {userAchievements.slice(0, 5).map((ua) => (
                  <div key={ua.id} className="flex min-w-[76px] flex-col items-center gap-2">
                    <AchievementBadge achievement={ua.achievements!} unlocked size="md" />
                    <span className="line-clamp-2 w-full text-center text-[10px] font-medium leading-tight text-foreground">
                      {ua.achievements!.name}
                    </span>
                  </div>
                ))}
                {userAchievements.length > 5 && (
                  <Link
                    href="/client/achievements"
                    className="group flex min-w-[76px] flex-col items-center justify-center gap-2"
                  >
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-muted-foreground/35 bg-muted/30 transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-primary tabular-nums">
                        +{userAchievements.length - 5}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary">
                      Más
                    </span>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
    </>
  )
}
