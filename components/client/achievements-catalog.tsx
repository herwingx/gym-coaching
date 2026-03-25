'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AchievementBadge } from '@/components/client/achievement-badge'
import type { Achievement, UserAchievement } from '@/lib/types'
import {
  achievementCategoryLabel,
  achievementLucideIcon,
  formatAchievementProgress,
  sortAchievementsForDisplay,
} from '@/lib/achievements-ui'
import { cn } from '@/lib/utils'

const TAB_DEFS: { id: 'all' | Achievement['category']; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'milestone', label: achievementCategoryLabel('milestone') },
  { id: 'consistency', label: achievementCategoryLabel('consistency') },
  { id: 'strength', label: achievementCategoryLabel('strength') },
  { id: 'volume', label: achievementCategoryLabel('volume') },
  { id: 'special', label: achievementCategoryLabel('special') },
]

type ProgressRecord = Record<string, number>

export function AchievementsCatalog({
  achievements,
  userAchievements,
  progressById,
}: {
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  progressById: ProgressRecord
}) {
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id))
  const sorted = sortAchievementsForDisplay(achievements, unlockedIds)

  return (
    <Tabs defaultValue="all" className="flex w-full flex-col gap-6">
      <div className="min-w-0 overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsList className="inline-flex h-auto w-max min-w-full flex-wrap justify-start gap-1 bg-transparent p-0 sm:w-full sm:flex-nowrap">
          {TAB_DEFS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {TAB_DEFS.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted
              .filter((a) => tab.id === 'all' || a.category === tab.id)
              .map((achievement) => {
                const unlocked = unlockedIds.has(achievement.id)
                const current = progressById[achievement.id] ?? 0
                const { line, percent } = formatAchievementProgress(achievement, current, unlocked)
                const CategoryIcon = achievementLucideIcon(achievement)

                return (
                  <Card
                    key={achievement.id}
                    className={cn(
                      'border-muted/70 shadow-none transition-shadow hover:shadow-md',
                      unlocked && 'border-primary/20 bg-primary/3',
                    )}
                  >
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                      <AchievementBadge
                        achievement={achievement}
                        unlocked={unlocked}
                        size="md"
                        showProgress={false}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            {achievementCategoryLabel(achievement.category)}
                          </Badge>
                          {unlocked ? (
                            <Badge variant="outline" className="border-success/30 bg-success/10 text-[10px] text-success">
                              Hecho
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              {percent}%
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base font-semibold leading-tight">{achievement.name}</CardTitle>
                        {achievement.description ? (
                          <CardDescription className="mt-1.5 text-pretty text-xs leading-relaxed">
                            {achievement.description}
                          </CardDescription>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 pt-0">
                      <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                        <CategoryIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <p className="text-xs leading-snug text-muted-foreground">
                          <span className="font-medium text-foreground">Objetivo: </span>
                          {line}
                        </p>
                      </div>
                      {!unlocked && (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            <span>Avance</span>
                            <span className="tabular-nums">{percent}%</span>
                          </div>
                          <Progress value={percent} className="h-1.5 bg-muted" />
                        </div>
                      )}
                      <p className="text-xs font-semibold tabular-nums text-primary">
                        Recompensa: +{achievement.xp_reward} XP · progreso general
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
