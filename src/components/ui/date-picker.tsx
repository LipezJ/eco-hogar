"use client"

import * as React from "react"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ value, setValue }: { value?: string; setValue: (date: string) => void }) {
  const [open, setOpen] = React.useState(false)

  // Guard against empty or invalid values
  const date = value ? new Date(value) : undefined
  const isValidDate = date && !isNaN(date.getTime())

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal border-input"
          >
            {isValidDate ? date!.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            locale={es}
            mode="single"
            selected={isValidDate ? date : undefined}
            captionLayout="dropdown"
            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
            onSelect={(d) => {
              setValue(d?.toISOString() || "")
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DatePickerRange({ value, setValue }: { value?: string[]; setValue: (date: string[]) => void }) {
  "use client"

  const range = {
    from: value && value[0] !== "" ? new Date(value[0]) : undefined,
    to: value && value[1] !== "" ? new Date(value[1]) : undefined
  }

  return (
    <div className='w-full max-w-xs space-y-2'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' id='dates' className='w-full justify-between font-normal border-input'>
            <CalendarIcon />
            {range?.from && range?.to
              ? `${range.from.toLocaleDateString()}-${range.to.toLocaleDateString()}`
              : 'Pick a date'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            locale={es}
            mode='range'
            selected={range}
            onSelect={range => {
              setValue([range?.from?.toISOString() || "", range?.to?.toISOString() || ""])
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
