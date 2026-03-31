'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

type AdminPageHeaderProps = {
  kicker?: React.ReactNode
  title: string
  description?: string | React.ReactNode
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  sticky?: boolean
  className?: string
}

export function AdminPageHeader({
  kicker,
  title,
  description,
  backHref,
  backLabel = 'Volver',
  actions,
  sticky = false,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        'border-b bg-background/80 backdrop-blur-md',
        sticky && 'sticky top-0 z-50 safe-area-header-pt',
        className,
      )}
    >
      <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {backHref ? (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0"
            >
              <Link href={backHref} aria-label={backLabel}>
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 size-9 shrink-0 sm:size-8" />
              <div className="flex items-center gap-2 lg:hidden">
                <div className="size-7 rounded-lg overflow-hidden ring-1 ring-border shadow-sm shrink-0">
                  <img src="/android-chrome-192x192.png" alt="Logo" className="size-full object-cover" />
                </div>
              </div>
            </div>
          )}

          <div className="min-w-0">
            {kicker ? (
              <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
                {kicker}
              </div>
            ) : null}
            <h1 className="text-xl font-bold tracking-tight text-pretty sm:text-2xl">
              {title}
            </h1>
            {description ? (
              typeof description === 'string' ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                  {description}
                </p>
              ) : (
                <div className="mt-0.5">{description}</div>
              )
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}

