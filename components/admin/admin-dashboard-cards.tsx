'use client'

import { TrendingDown, TrendingUp, Flame, AlertTriangle, Users, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type AdminDashboardMetrics = {
  totalTrainingsThisWeek: number
  prsThisMonth: number
  mostActiveClientName: string | null
  attentionClientName: string | null
  attentionReason?: string | null
  totalClients?: number
  trainingsLastWeek?: number
}

function computeTrend(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

export function AdminDashboardCards({
  totalTrainingsThisWeek,
  prsThisMonth,
  mostActiveClientName,
  attentionClientName,
  attentionReason,
  totalClients = 0,
  trainingsLastWeek = 0,
}: AdminDashboardMetrics) {
  const weekTrend = computeTrend(totalTrainingsThisWeek, trainingsLastWeek)

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:px-6">
      <Card className="overflow-hidden border-none shadow-sm bg-linear-to-br from-primary/10 via-background to-background group hover:scale-[1.02] transition-all duration-300">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="size-4 text-primary" />
            </div>
            {weekTrend != null && (
              <Badge variant="outline" className={cn(
                "h-5 text-[10px] font-black border-none px-1.5",
                weekTrend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {weekTrend >= 0 ? '+' : ''}{weekTrend}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1">
            <p className="text-3xl font-black tracking-tighter tabular-nums">{totalTrainingsThisWeek}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entrenos / Semana</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm bg-linear-to-br from-amber-500/10 via-background to-background group hover:scale-[1.02] transition-all duration-300">
        <CardHeader className="p-4 pb-2">
          <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Trophy className="size-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1">
            <p className="text-3xl font-black tracking-tighter tabular-nums">{prsThisMonth}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PRs / Mes</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm bg-linear-to-br from-indigo-500/10 via-background to-background group hover:scale-[1.02] transition-all duration-300">
        <CardHeader className="p-4 pb-2">
          <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Flame className="size-4 text-indigo-500" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tighter truncate leading-7">{mostActiveClientName || '-'}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Más Activo</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm bg-linear-to-br from-destructive/10 via-background to-background group hover:scale-[1.02] transition-all duration-300">
        <CardHeader className="p-4 pb-2">
          <div className="size-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="size-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tighter truncate leading-7">{attentionClientName || '-'}</p>
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest leading-tight">
              {attentionReason || 'Atención'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
