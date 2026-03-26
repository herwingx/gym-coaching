'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AchievementBadge } from '@/components/client/achievement-badge'
import type { Achievement, UserAchievement } from '@/lib/types'
import {
  achievementCategoryLabel,
  achievementLucideIcon,
  achievementRarityColor,
  formatAchievementProgress,
  sortAchievementsForDisplay,
} from '@/lib/achievements-ui'
import { cn } from '@/lib/utils'

import { 
  Trophy, 
  Star, 
  Flame, 
  Zap, 
  TrendingUp, 
  Award,
  LayoutGrid,
  Calendar,
  Users
} from 'lucide-react'

const TAB_DEFS: { id: 'all' | Achievement['category'] | 'seasonal' | 'community'; label: string; icon: any }[] = [
  { id: 'all', label: 'Todos', icon: LayoutGrid },
  { id: 'milestone', label: achievementCategoryLabel('milestone'), icon: Trophy },
  { id: 'consistency', label: achievementCategoryLabel('consistency'), icon: Flame },
  { id: 'strength', label: achievementCategoryLabel('strength'), icon: TrendingUp },
  { id: 'volume', label: achievementCategoryLabel('volume'), icon: Zap },
  { id: 'special', label: achievementCategoryLabel('special'), icon: Award },
  { id: 'seasonal', label: 'Temporada', icon: Calendar },
  { id: 'community', label: 'Comunidad', icon: Users },
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
      <ScrollArea className="w-full whitespace-nowrap">
        <TabsList className="inline-flex w-auto bg-muted/50 p-1 h-11 rounded-xl border border-border/40 shadow-sm">
          {TAB_DEFS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-lg px-3 py-1.5 data-[state=active]:shadow-sm gap-2 text-xs font-semibold"
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {TAB_DEFS.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
          {tab.id === 'seasonal' || tab.id === 'community' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <tab.icon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Próximamente</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {tab.id === 'seasonal' 
                  ? 'Eventos especiales y desafíos de tiempo limitado llegarán pronto.' 
                  : 'Logros basados en retos grupales y ranking del gimnasio.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted
                .filter((a) => tab.id === 'all' || a.category === tab.id)
                .map((achievement) => {
                  const unlocked = unlockedIds.has(achievement.id)
                  const current = progressById[achievement.id] ?? 0
                  const { line, percent } = formatAchievementProgress(achievement, current, unlocked)
                  const CategoryIcon = achievementLucideIcon(achievement)
                  const rarityColor = achievementRarityColor(achievement.rarity)

                  return (
                    <Card
                      key={achievement.id}
                      className={cn(
                        'relative overflow-hidden border-muted/70 shadow-none transition-all hover:shadow-md',
                        unlocked && 'border-primary/20 bg-primary/[0.03]',
                      )}
                    >
                      {unlocked && (
                        <div className={cn(
                          "absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 blur-3xl opacity-20 bg-gradient-to-br",
                          rarityColor
                        )} />
                      )}
                      
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
                              <Badge className={cn("text-[10px] text-white border-none bg-gradient-to-r shadow-sm", rarityColor)}>
                                Completado
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
                        <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-2">
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
                          Recompensa: +{achievement.xp_reward} XP
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
