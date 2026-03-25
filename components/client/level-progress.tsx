'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
    <Card className="overflow-hidden border-muted/70 bg-linear-to-br from-primary/5 via-background to-background shadow-none">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="relative">
            <CircularProgress
              value={levelInfo.progress}
              size={88}
              strokeWidth={5}
              showValue={false}
              className="text-primary"
            >
              {avatarUrl ? (
                <div className="size-[72px] overflow-hidden rounded-full border-4 border-background shadow-sm">
                  <Image
                    src={avatarUrl}
                    alt={username ? `Foto de ${username}` : 'Foto de perfil'}
                    width={72}
                    height={72}
                    className="size-full object-cover"
                    sizes="72px"
                  />
                </div>
              ) : (
                <div
                  className="flex size-[72px] items-center justify-center rounded-full border-4 border-background bg-primary text-2xl font-bold tracking-tight text-primary-foreground shadow-sm"
                  aria-hidden
                >
                  {username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </CircularProgress>

            <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-4 border-background bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {levelInfo.level}
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col gap-4 text-center sm:text-left">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="text-xl font-bold tracking-tight">{username || 'Tu progreso'}</h3>
              <Badge
                variant="outline"
                className="mx-auto w-fit border-primary/25 bg-primary/5 text-primary sm:mx-0"
              >
                {levelName}
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="size-3.5 shrink-0 text-primary" aria-hidden />
                  Experiencia
                </span>
                <span className="tabular-nums">
                  {levelInfo.currentXP} / {levelInfo.xpForNextLevel}
                </span>
              </div>
              <Progress value={levelInfo.progress} className="h-2.5 bg-muted" />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Te faltan{' '}
                  <span className="font-semibold text-foreground tabular-nums">{xpRemaining}</span> XP para el
                  nivel {levelInfo.level + 1}.
                </p>
                <Link
                  href="/client/achievements"
                  className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline sm:justify-end"
                >
                  Ver hitos
                  <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
