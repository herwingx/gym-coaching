'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Dumbbell, Flame, Target, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
}

const achievementIcons = {
  trophy: Trophy,
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
  award: Award,
}

export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((a) => a.unlockedAt).length

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-muted/70 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Award className="size-5 shrink-0 text-primary" aria-hidden />
            Hitos ({unlockedCount}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {achievements.map((achievement) => {
              const Icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy
              const isUnlocked = !!achievement.unlockedAt

              return (
                <div
                  key={achievement.id}
                  className={cn(
                    'relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
                    isUnlocked
                      ? 'border-primary/25 bg-primary/5'
                      : 'border-muted bg-muted/30 opacity-70',
                  )}
                >
                  <div
                    className={cn(
                      'flex size-12 items-center justify-center rounded-2xl',
                      isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="size-6 shrink-0" aria-hidden />
                  </div>
                  <h4 className="text-center text-sm font-semibold leading-snug">{achievement.name}</h4>
                  <p className="text-center text-xs text-muted-foreground">{achievement.description}</p>
                  {isUnlocked && achievement.unlockedAt && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
