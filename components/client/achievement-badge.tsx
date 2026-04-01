'use client'

import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'
import type { Achievement } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  achievementLucideIcon,
  achievementMilestoneBadgeLabel,
  formatAchievementProgress,
} from '@/lib/achievements-ui'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showDetails?: boolean
  progress?: number
  showProgress?: boolean
  showMilestoneBadge?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'size-10',
  md: 'size-14',
  lg: 'size-20',
  xl: 'size-28',
}

const iconGlyphSize = {
  sm: 'size-5',
  md: 'size-7',
  lg: 'size-10',
  xl: 'size-14',
}

export function AchievementBadge({
  achievement,
  unlocked = false,
  size = 'md',
  showDetails = false,
  progress = 0,
  showProgress = false,
  showMilestoneBadge = false,
  className,
}: AchievementBadgeProps) {
  const Icon = achievementLucideIcon(achievement)
  const { percent } = formatAchievementProgress(achievement, progress, unlocked)
  const tierLabel = achievementMilestoneBadgeLabel(achievement.rarity)

  return (
    <div
      className={cn(
        'flex flex-col items-center transition-colors duration-200',
        !unlocked && 'opacity-70',
        className,
      )}
    >
      <div className="relative flex flex-col items-center gap-2">
        {showMilestoneBadge && unlocked && (
          <Badge
            variant="outline"
            className="absolute -top-2 z-10 max-w-28 truncate border-muted-foreground/25 bg-background/95 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {tierLabel}
          </Badge>
        )}

        <div
          className={cn(
            'relative flex items-center justify-center rounded-2xl border shadow-sm transition-transform duration-200',
            sizeClasses[size],
            unlocked
              ? 'border-primary/25 bg-primary/10 text-primary'
              : 'border-dashed border-muted-foreground/35 bg-muted/40 text-muted-foreground',
          )}
          aria-hidden={!showDetails}
        >
          {!unlocked && (
            <Lock
              className="absolute -right-1 -top-1 size-3.5 rounded-full bg-background text-muted-foreground ring-1 ring-border"
              aria-hidden
            />
          )}
          <Icon className={cn('shrink-0', iconGlyphSize[size])} />
        </div>
      </div>

      {showDetails && (
        <div className="mt-2 flex max-w-[140px] flex-col items-center gap-1.5 text-center">
          <p
            className={cn(
              'line-clamp-2 font-semibold leading-snug',
              size === 'sm' ? 'text-[10px]' : 'text-xs',
            )}
          >
            {achievement.name}
          </p>

          {showProgress && !unlocked && (
            <div className="flex w-full flex-col gap-1">
              <Progress value={percent} className="h-1.5 bg-muted" />
              <p className="text-[10px] font-medium tabular-nums text-muted-foreground">{percent}%</p>
            </div>
          )}

          {unlocked && (
            <p className="text-[10px] font-semibold text-primary tabular-nums">
              +{achievement.xp_reward} XP
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface AchievementsGridProps {
  achievements: Achievement[]
  unlockedIds: Set<string>
}

export function AchievementsGrid({ achievements, unlockedIds }: AchievementsGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          unlocked={unlockedIds.has(achievement.id)}
          size="md"
          showDetails
        />
      ))}
    </div>
  )
}
