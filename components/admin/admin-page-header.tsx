'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        'border-b bg-background',
        sticky && 'sticky top-0 z-40 safe-area-header-pt',
        className,
      )}
    >
      <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          {backHref ? (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="size-9 shrink-0 sm:hidden"
            >
              <Link href={backHref} aria-label={backLabel}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          ) : null}

          <div className="min-w-0">
            {kicker ? (
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                {kicker}
              </div>
            ) : null}
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
            {description ? (
              typeof description === 'string' ? (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {description}
                </p>
              ) : (
                <div className="mt-1">{description}</div>
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

