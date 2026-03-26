'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import { addMonths, workoutsMonthHref } from '@/lib/client-month-nav'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type WorkoutsHistoryMonthToolbarProps = {
  year: number
  monthIndex: number
  monthCaption: string
}

export function WorkoutsHistoryMonthToolbar({
  year,
  monthIndex,
  monthCaption,
}: WorkoutsHistoryMonthToolbarProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [displayMonth, setDisplayMonth] = React.useState(
    () => new Date(year, monthIndex, 1),
  )

  React.useEffect(() => {
    setDisplayMonth(new Date(year, monthIndex, 1))
  }, [year, monthIndex])

  const prev = addMonths(year, monthIndex, -1)
  const next = addMonths(year, monthIndex, 1)
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between">
      <Button asChild variant="outline" size="icon" aria-label="Mes anterior">
        <Link href={workoutsMonthHref(prev.year, prev.monthIndex)}>
          <ChevronLeft aria-hidden />
        </Link>
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 min-w-0 flex-1 sm:max-w-[min(100%,20rem)]"
          >
            <CalendarDays data-icon="inline-start" aria-hidden />
            <span className="truncate font-medium capitalize">{monthCaption}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            onSelect={(d) => {
              if (!d) return
              router.push(workoutsMonthHref(d.getFullYear(), d.getMonth()))
              setOpen(false)
            }}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={currentYear + 1}
          />
        </PopoverContent>
      </Popover>

      <Button asChild variant="outline" size="icon" aria-label="Mes siguiente">
        <Link href={workoutsMonthHref(next.year, next.monthIndex)}>
          <ChevronRight aria-hidden />
        </Link>
      </Button>
    </div>
  )
}
