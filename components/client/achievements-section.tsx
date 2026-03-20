'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Zap, Flame, Target, Award } from 'lucide-react'

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
  zap: Zap,
  flame: Flame,
  target: Target,
  award: Award,
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800',
  uncommon: 'bg-success/20 text-success',
  rare: 'bg-primary/20 text-primary',
  epic: 'bg-accent/50 text-accent-foreground',
  legendary: 'bg-warning/20 text-warning',
}

export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((a) => a.unlockedAt).length

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Logros ({unlockedCount}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy
              const isUnlocked = !!achievement.unlockedAt
              
              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isUnlocked
                      ? `border-primary bg-accent/50 ${rarityColors[achievement.rarity]}`
                      : 'border-muted bg-muted/50 opacity-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-full ${isUnlocked ? 'bg-primary/20' : 'bg-muted'}`}>
                      <Icon className={`w-6 h-6 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <h4 className="text-sm font-bold text-center">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground text-center">{achievement.description}</p>
                    {isUnlocked && achievement.unlockedAt && (
                      <Badge variant="secondary" className="text-xs">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
