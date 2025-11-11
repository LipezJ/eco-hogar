'use client'

import { useId, useMemo, useState } from 'react'

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

interface ComboboxWithSearchAndButtonItem {
  id?: string
  value: string
  label: string
  searchString: string
}

interface ComboboxWithSearchAndButtonProps {
  items: ComboboxWithSearchAndButtonItem[]
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  addLabel: string
  formValue?: string
  setFormValue: (value: string) => void
  setFormValueId?: (id: string) => void
  onAdd: () => void
}

function ComboboxWithSearchAndButton({ items, placeholder, searchPlaceholder, emptyMessage, addLabel, formValue, setFormValue, setFormValueId, onAdd }: ComboboxWithSearchAndButtonProps) {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)

  const valuesToSearchStrings = useMemo(() => {
    return items.reduce<Record<string, { id: string, value: string }>>((prev, curr) => {
      return {
        ...prev,
        [curr.searchString.trim()]: {
          id: curr.id ?? '',
          value: curr.value
        }
      }
    }, {})
  }, [ items ])

  return (
    <div className='w-full'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]'
          >
            <span className={cn('truncate', !formValue && 'text-muted-foreground')}>
              {formValue ? (
                items.find(item => item.value === formValue)?.label
              ) : (
                <span className='text-muted-foreground'>{placeholder}</span>
              )}
            </span>
            <ChevronsUpDownIcon size={16} className='text-muted-foreground/80 shrink-0' aria-hidden='true' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0' align='start'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {items.map(item => (
                  <CommandItem
                    key={item.value}
                    value={item.searchString}
                    onSelect={currentValue => {
                      const realValue = valuesToSearchStrings[(currentValue === formValue ? '' : currentValue).trim()]
                      setFormValue(realValue.value)
                      if (setFormValueId) setFormValueId(realValue.id)
                      setOpen(false)
                    }}
                  >
                    {item.label}
                    {formValue === item.value && <CheckIcon size={16} className='ml-auto' />}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <Button variant='ghost' className='w-full justify-start font-normal' onClick={onAdd}>
                  <PlusIcon size={16} className='-ms-2 opacity-60' aria-hidden='true' />
                  {addLabel}
                </Button>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export {
  ComboboxWithSearchAndButton,
  type ComboboxWithSearchAndButtonItem
}
