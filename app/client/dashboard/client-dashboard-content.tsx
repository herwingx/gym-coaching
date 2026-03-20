"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { LevelProgress } from '@/components/client/level-progress'
import { ClientDashboardCards } from '@/components/client/client-dashboard-cards'
import { ClientWorkoutChart } from '@/components/client/client-workout-chart'
import { NextWorkoutCard } from '@/components/client/next-workout-card'
import { AchievementBadge } from '@/components/client/achievement-badge'
import { 
  Activity, 
  TrendingUp, 
  User, 
  Trophy,
  CalendarDays,
  Ruler,
  ImageIcon,
  MessageCircle,
  ChevronRight,
  LogOut
} from 'lucide-react'
import type { Profile, Client, Routine, LevelInfo, UserAchievement } from '@/lib/types'

interface ClientDashboardContentProps {
  profile: Profile | null
  client: Client | null
  levelInfo: LevelInfo
  totalWorkouts: number
  totalVolume: number
  prsThisMonth: number
  assignedRoutine: Routine | null
  userAchievements: UserAchievement[]
  chartData: { date: string; sessions: number }[]
}

export function ClientDashboardContent({
  profile,
  client,
  levelInfo,
  totalWorkouts,
  totalVolume,
  prsThisMonth,
  assignedRoutine,
  userAchievements,
  chartData,
}: ClientDashboardContentProps) {
  // Get first routine day for next workout
  const nextWorkoutDay = assignedRoutine?.routine_days?.[0]

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm safe-area-header-pt">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pb-3 sm:px-6 lg:px-8">
          <Link href="/client/dashboard" className="flex items-center gap-3 min-h-[44px] -m-2 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200" aria-label="GymCoach - Inicio">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">GC</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg leading-tight">GymCoach</h1>
              <p className="text-xs text-muted-foreground truncate">Tu entrenador digital</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <Button variant="ghost" size="icon" type="submit" className="size-11 min-w-11" aria-label="Cerrar sesión">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 space-y-6 sm:px-6 lg:px-8" tabIndex={-1}>
        {/* Level Progress */}
        <LevelProgress 
          levelInfo={levelInfo}
          username={profile?.username || profile?.full_name}
          avatarUrl={profile?.avatar_url}
        />

        {/* Stats Cards */}
        <ClientDashboardCards
            streakDays={profile?.streak_days || 0}
            totalWorkouts={totalWorkouts}
            totalVolume={totalVolume}
            prsThisMonth={prsThisMonth}
          />

        {/* Workout Chart */}
        <ClientWorkoutChart data={chartData} />

        {/* Next Workout */}
        <NextWorkoutCard 
          routineDay={nextWorkoutDay as any}
          routineName={assignedRoutine?.name}
        />

        {/* Recent Achievements */}
        {userAchievements.length > 0 && (
          <Card className="overflow-hidden border-none shadow-sm bg-linear-to-br from-background to-muted/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Logros Recientes
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-colors">
                  <Link href="/client/achievements" className="text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                    Ver todos
                    <ChevronRight className="size-3 shrink-0" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 overflow-x-auto pb-4 pt-2 -mx-1 px-1 scrollbar-none">
                {userAchievements.slice(0, 5).map((ua) => (
                  <div key={ua.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                    <AchievementBadge
                      achievement={ua.achievements!}
                      unlocked
                      size="md"
                    />
                    <span className="text-[10px] font-bold text-center line-clamp-1 w-full">{ua.achievements!.name}</span>
                  </div>
                ))}
                {userAchievements.length > 5 && (
                  <Link href="/client/achievements" className="flex flex-col items-center justify-center min-w-[70px] gap-2 group">
                    <div className="size-14 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">+{userAchievements.length - 5}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary">Más</span>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/client/workouts', icon: Activity, label: 'Historial' },
            { href: '/client/progress', icon: TrendingUp, label: 'Progreso' },
            { href: '/client/measurements', icon: Ruler, label: 'Medidas' },
            { href: '/client/calendar', icon: CalendarDays, label: 'Calendario' },
            { href: '/client/photos', icon: ImageIcon, label: 'Fotos' },
            { href: '/client/messages', icon: MessageCircle, label: 'Mensajes' },
            { href: '/client/profile', icon: User, label: 'Perfil' },
          ].map(({ href, icon: Icon, label }) => (
            <Button
              key={href}
              asChild
              variant="outline"
              className="min-h-11 h-auto py-3 flex-col gap-1.5 rounded-xl hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200 active:scale-[0.98]"
            >
              <Link href={href}>
                <Icon className="size-4" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </main>
    </div>
  )
}
