"use client"

import { StatCard } from "@/components/ui/stat-card"
import { Flame, Trophy, Dumbbell, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  streakDays: number
  totalWorkouts: number
  totalVolume: number
  prsThisMonth: number
}

export function StatsCards({ streakDays, totalWorkouts, totalVolume, prsThisMonth }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="Racha Actual"
        value={`${streakDays} dias`}
        icon={Flame}
        variant={streakDays >= 7 ? "primary" : "default"}
        subtitle={streakDays >= 7 ? "En fuego!" : "Sigue asi!"}
      />
      <StatCard
        title="Sesiones"
        value={totalWorkouts}
        icon={Dumbbell}
        subtitle="Total completadas"
      />
      <StatCard
        title="Volumen Semanal"
        value={`${(totalVolume / 1000).toFixed(1)}t`}
        icon={TrendingUp}
        subtitle="Peso levantado"
      />
      <StatCard
        title="PRs del Mes"
        value={prsThisMonth}
        icon={Trophy}
        variant={prsThisMonth > 0 ? "primary" : "default"}
        subtitle="Records personales"
      />
    </div>
  )
}
