'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  placeholder?: string
  className?: string
  id?: string
  name?: string
  required?: boolean
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Seleccionar fecha',
  className,
  id,
  name,
  required,
}: DatePickerProps) {
  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP', { locale: es }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear() + 10}
          />
        </PopoverContent>
      </Popover>
      <input 
        type="hidden" 
        name={name} 
        value={date ? format(date, 'yyyy-MM-dd') : ''} 
        required={required} 
      />
    </div>
  )
}
