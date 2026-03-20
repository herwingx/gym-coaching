"use client"

import { cn } from "@/lib/utils"
import { Trophy, Flame, Target, Dumbbell, Award, Star, Medal, Crown } from "lucide-react"
import type { Achievement } from "@/lib/types"

import { cn } from "@/lib/utils"
import { Trophy, Flame, Target, Dumbbell, Award, Star, Medal, Crown, Lock } from "lucide-react"
import type { Achievement } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  showDetails?: boolean
  progress?: number // Current value
  showProgress?: boolean
}

export function AchievementBadge({ 
  achievement, 
  unlocked = false,
  size = "md",
  showDetails = false,
  progress = 0,
  showProgress = false
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "size-10",
    md: "size-14",
    lg: "size-20",
    xl: "size-28",
  }
  
  const iconSizes = {
    sm: "size-5",
    md: "size-7",
    lg: "size-10",
    xl: "size-14",
  }

  const rarityColors = {
    common: "from-slate-400 to-slate-500",
    rare: "from-blue-400 to-blue-600",
    epic: "from-purple-500 to-purple-700",
    legendary: "from-amber-400 to-amber-600",
  }

  const percent = Math.min(Math.round((progress / (achievement.requirement_value || 1)) * 100), 100)

  return (
    <div className={cn(
      "flex flex-col items-center gap-3 transition-all duration-300",
      !unlocked && "opacity-60 grayscale-[0.5]"
    )}>
      <div className="relative group">
        {/* Glow effect for unlocked high rarity */}
        {unlocked && (achievement.rarity === 'legendary' || achievement.rarity === 'epic') && (
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity",
            rarityColors[achievement.rarity as keyof typeof rarityColors]
          )} />
        )}

        <div className={cn(
          "relative rounded-full flex items-center justify-center transition-all duration-500 transform group-hover:scale-110",
          sizeClasses[size],
          unlocked 
            ? cn("bg-gradient-to-br shadow-lg", rarityColors[achievement.rarity as keyof typeof rarityColors] || "bg-primary") 
            : "bg-muted border-2 border-dashed border-muted-foreground/30"
        )}>
          {!unlocked && <Lock className="absolute -top-1 -right-1 size-4 text-muted-foreground" />}
          
          <span className={cn(
            "select-none drop-shadow-md",
            size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : size === "lg" ? "text-4xl" : "text-5xl"
          )}>
            {achievement.icon || '🏆'}
          </span>
        </div>

        {/* Progress Ring or Indicator could go here if we wanted something more fancy */}
      </div>

      {showDetails && (
        <div className="text-center max-w-[120px]">
          <p className={cn(
            "font-bold leading-tight line-clamp-2",
            size === "sm" ? "text-[10px]" : "text-sm"
          )}>
            {achievement.name}
          </p>
          
          {showProgress && !unlocked && (
            <div className="mt-2 space-y-1">
              <Progress value={percent} className="h-1.5 w-full bg-muted" />
              <p className="text-[10px] text-muted-foreground font-medium">
                {percent}%
              </p>
            </div>
          )}

          {unlocked && (
            <div className="mt-1 flex items-center justify-center gap-1">
              <Star className="size-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-bold text-primary">+{achievement.xp_reward} XP</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Grid of achievements
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
