'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminDashboardCards } from '@/components/admin/admin-dashboard-cards'
import { AdminWorkoutChart } from '@/components/admin/admin-workout-chart'
import { type CoachClientCard, type CoachOverviewMetrics } from './coach-overview'
import { ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatRelativeDays(days: number) {
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}

export function CoachOverviewClient({
  cards,
  metrics,
  planNames,
  routineNames,
}: {
  cards: CoachClientCard[]
  metrics: CoachOverviewMetrics
  planNames: string[]
  routineNames: string[]
}) {
  const [activeTab, setActiveTab] = useState('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [routineFilter, setRoutineFilter] = useState<string>('all')

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (activeTab === 'activeWeek') return c.status === 'active' && c.daysSinceLastSession !== null && c.daysSinceLastSession <= 6
      if (activeTab === 'inactive3') return c.status === 'active' && (c.daysSinceLastSession === null || c.daysSinceLastSession >= 3)
      if (activeTab === 'attention') return c.needsAttention
      if (activeTab === 'all') return true

      return true
    }).filter((c) => {
      if (planFilter === 'all') return true
      return (c.planName || '') === planFilter
    }).filter((c) => {
      if (routineFilter === 'all') return true
      return (c.assignedRoutineName || '') === routineFilter
    })
  }, [cards, activeTab, planFilter, routineFilter])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-4 px-4 lg:px-0">
        <AdminDashboardCards
          totalTrainingsThisWeek={metrics.totalTrainingsThisWeek}
          prsThisMonth={metrics.prsThisMonth}
          mostActiveClientName={metrics.mostActiveClientName}
          attentionClientName={metrics.attentionClientName}
          attentionReason={metrics.attentionReason}
          trainingsLastWeek={metrics.trainingsLastWeek}
        />

        <AdminWorkoutChart data={metrics.chartData} />
      </div>

      <div className="space-y-4 px-4 lg:px-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto flex-wrap gap-1 p-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm">Todos</TabsTrigger>
              <TabsTrigger value="activeWeek" className="text-xs sm:text-sm">Activos</TabsTrigger>
              <TabsTrigger value="inactive3" className="text-xs sm:text-sm">Inactivos</TabsTrigger>
              <TabsTrigger value="attention" className="text-xs sm:text-sm">Atención</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="h-9 w-full min-w-[140px] sm:w-auto">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los planes</SelectItem>
                {planNames.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={routineFilter} onValueChange={setRoutineFilter}>
              <SelectTrigger className="h-9 w-full min-w-[140px] sm:w-auto">
                <SelectValue placeholder="Rutina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {routineNames.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                setActiveTab('all')
                setPlanFilter('all')
                setRoutineFilter('all')
              }}
            >
              Limpiar
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-muted-foreground">
            {filteredCards.length} asesorado{filteredCards.length !== 1 ? 's' : ''}
          </p>
        </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredCards.map((c) => (
          <Card key={c.id} className={cn(
            "overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
            c.needsAttention && "border-l-4 border-l-destructive"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-xl">
                    {c.avatarUrl ? (
                      <AvatarImage src={c.avatarUrl} alt={c.fullName} className="object-cover" />
                    ) : null}
                    <AvatarFallback>{c.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{c.fullName}</CardTitle>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.planName ? `Plan: ${c.planName}` : 'Sin plan'}
                    </div>
                  </div>
                </div>

                {c.needsAttention ? (
                  <Badge variant="destructive" className="gap-1 shrink-0">
                    <AlertTriangle className="size-3.5" />
                    {c.attentionReason || 'Atención'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0">
                    {c.streakDays != null ? `${c.streakDays}d racha` : 'Sin racha'}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Última sesión</div>
                <div className="text-sm font-semibold">
                  {c.daysSinceLastSession != null ? formatRelativeDays(c.daysSinceLastSession) : '-'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Tendencia</div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {c.trend === 'up' ? (
                    <span className="text-primary flex items-center gap-1">
                      <ArrowUp className="size-4 text-primary" />
                      Subiendo
                    </span>
                  ) : c.trend === 'down' ? (
                    <span className="text-destructive flex items-center gap-1">
                      <ArrowDown className="size-4 text-destructive" />
                      Bajando
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Estancado</span>
                  )}
                </div>
              </div>

              {c.assignedRoutineName ? (
                <div className="text-xs text-muted-foreground truncate">
                  Rutina: {c.assignedRoutineName}
                </div>
              ) : null}

              <Button asChild variant="outline" className="w-full">
                <Link href={`/admin/clients/${c.id}`}>Ver perfil</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  )
}

