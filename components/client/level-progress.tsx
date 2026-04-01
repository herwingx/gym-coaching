'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CircularProgress } from '@/components/ui/circular-progress'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Activity } from 'lucide-react'
import type { LevelInfo } from '@/lib/types'
import { getLevelName } from '@/lib/types'

interface LevelProgressProps {
  levelInfo: LevelInfo
  username?: string
  avatarUrl?: string
}

export function LevelProgress({ levelInfo, username, avatarUrl }: LevelProgressProps) {
  const xpRemaining = levelInfo.xpForNextLevel - levelInfo.currentXP
  const levelName = getLevelName(levelInfo.level)

  return (
    <Card className="overflow-hidden border-border/80 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm transition-all hover:bg-card">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="relative group">
            <div className="absolute inset-x-0 bottom-0 top-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-125 transition-transform duration-500" />
            <CircularProgress
              value={levelInfo.progress}
              size={110}
              strokeWidth={6}
              showValue={false}
              className="text-primary relative z-10"
            >
              <div className="relative size-[90px] overflow-hidden rounded-full border-4 border-background shadow-xl">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={username ? `Foto de ${username}` : 'Foto de perfil'}
                    width={90}
                    height={90}
                    className="size-full object-cover transition-transform group-hover:scale-110 duration-500"
                    sizes="90px"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center bg-primary text-3xl font-black text-primary-foreground"
                    aria-hidden
                  >
                    {username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            </CircularProgress>

            <div className="absolute -bottom-1 -right-1 flex size-10 items-center justify-center rounded-2xl border-4 border-background bg-primary text-sm font-black text-primary-foreground shadow-lg z-20">
              {levelInfo.level}
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col gap-6 text-center sm:text-left">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Atleta de Élite</span>
                <h3 className="text-2xl font-black tracking-tight text-foreground">{username || 'Tu progreso'}</h3>
              </div>
              <Badge className="mx-auto w-fit font-black text-[10px] uppercase tracking-widest px-3 py-1.5 bg-primary/10 text-primary border-none rounded-xl sm:mx-0">
                {levelName}
              </Badge>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                <span className="inline-flex items-center gap-2">
                  <Activity className="size-4 text-primary" aria-hidden />
                  Experiencia Acumulada
                </span>
                <span className="tabular-nums text-foreground">
                  {levelInfo.currentXP.toLocaleString()} <span className="text-muted-foreground/40 font-bold mx-1">/</span> {levelInfo.xpForNextLevel.toLocaleString()}
                </span>
              </div>
              <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <Progress value={levelInfo.progress} className="size-full bg-primary" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
                <p className="text-xs font-medium text-muted-foreground italic">
                  Próximo objetivo: <span className="text-foreground font-black tabular-nums">{xpRemaining.toLocaleString()} XP</span>
                </p>
                <Button variant="ghost" size="sm" asChild className="h-9 px-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all">
                  <Link href="/client/achievements" className="flex items-center gap-2">
                    Ver mis hitos
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
