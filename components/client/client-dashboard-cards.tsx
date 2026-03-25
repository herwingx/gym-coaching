'use client'

import { TrendingUp, Flame, Dumbbell, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export type ClientDashboardMetrics = {
  streakDays: number
  totalWorkouts: number
  totalVolume: number
  prsThisMonth: number
}

export function ClientDashboardCards({
  streakDays,
  totalWorkouts,
  totalVolume,
  prsThisMonth,
}: ClientDashboardMetrics) {
  const volumeTons = (totalVolume / 1000).toFixed(1)

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card className="overflow-hidden border-muted/70 bg-linear-to-br from-primary/10 via-background to-background shadow-none transition-shadow hover:shadow-md">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flame className="size-4 text-primary" />
            </div>
            {streakDays >= 7 && (
              <Badge variant="outline" className="h-5 border-success/30 bg-success/10 text-[10px] font-semibold text-success">
                Racha {streakDays}d
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-3xl font-black tracking-tighter tabular-nums">{streakDays}d</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Racha</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-muted/70 bg-linear-to-br from-indigo-500/10 via-background to-background shadow-none transition-shadow hover:shadow-md">
        <CardHeader className="p-4 pb-2">
          <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Dumbbell className="size-4 text-indigo-500" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-3xl font-black tracking-tighter tabular-nums">{totalWorkouts}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sesiones</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-muted/70 bg-linear-to-br from-amber-500/10 via-background to-background shadow-none transition-shadow hover:shadow-md">
        <CardHeader className="p-4 pb-2">
          <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <TrendingUp className="size-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-3xl font-black tracking-tighter tabular-nums">{volumeTons}t</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Volumen</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-muted/70 bg-linear-to-br from-amber-500/10 via-background to-background shadow-none transition-shadow hover:shadow-md">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Trophy className="size-4 text-amber-500" />
            </div>
            {prsThisMonth > 0 && (
              <Badge variant="outline" className="h-5 border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary">
                Este mes
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-3xl font-black tracking-tighter tabular-nums">{prsThisMonth}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">PRs (mes)</p>
        </CardContent>
      </Card>
    </div>
  )
}
