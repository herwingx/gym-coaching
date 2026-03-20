"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CircularProgress } from "@/components/ui/circular-progress"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight } from "lucide-react"
import type { LevelInfo } from "@/lib/types"
import { getLevelName } from "@/lib/types"

interface LevelProgressProps {
  levelInfo: LevelInfo
  username?: string
  avatarUrl?: string
}

export function LevelProgress({ levelInfo, username, avatarUrl }: LevelProgressProps) {
  const xpRemaining = levelInfo.xpForNextLevel - levelInfo.currentXP
  const levelName = getLevelName(levelInfo.level)
  
  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
          {/* Avatar with level ring */}
          <div className="relative group">
            {/* Animated outer ring */}
            <div className="absolute inset-0 rounded-full bg-primary/20 scale-110 blur-md group-hover:scale-125 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
            
            <div className="relative">
              <CircularProgress 
                value={levelInfo.progress} 
                size={88} 
                strokeWidth={5}
                showValue={false}
                className="text-primary transition-all duration-1000 ease-out"
              >
                {avatarUrl ? (
                  <div className="size-[72px] rounded-full overflow-hidden border-4 border-background shadow-md">
                    <Image
                      src={avatarUrl}
                      alt={`Foto de perfil de ${username || 'usuario'}`}
                      width={72}
                      height={72}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="72px"
                    />
                  </div>
                ) : (
                  <div className="size-[72px] rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-md" aria-hidden="true">
                    <span className="text-2xl font-black text-primary-foreground tracking-tighter transition-transform duration-500 group-hover:scale-110">
                      {username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </CircularProgress>
              
              {/* Level badge floating */}
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full h-8 w-8 border-4 border-background shadow-lg flex items-center justify-center font-black text-xs">
                {levelInfo.level}
              </div>
            </div>
          </div>
          
          {/* Level info */}
          <div className="flex-1 space-y-4 w-full text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                <h3 className="text-xl font-black tracking-tight">{username || 'Atleta'}</h3>
                <Badge variant="outline" className="w-fit mx-auto sm:mx-0 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                  {levelName}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Star className="size-3 text-amber-500 fill-amber-500" />
                  <span>XP: {levelInfo.currentXP}</span>
                </div>
                <span>Siguiente: {levelInfo.xpForNextLevel} XP</span>
              </div>
              
              <div className="relative group/progress">
                <Progress value={levelInfo.progress} className="h-3 bg-primary/10 transition-all group-hover/progress:h-3.5" />
                {/* Sparkle effect on progress tip could be added here */}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground italic">
                  Te faltan <span className="text-primary font-bold not-italic">{xpRemaining} XP</span> para alcanzar el rango {levelInfo.level + 1}
                </p>
                <Link href="/client/achievements" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1">
                  Ver Logros
                  <ChevronRight className="size-2.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
