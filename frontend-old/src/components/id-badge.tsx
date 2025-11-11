import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Fragment } from 'react'

interface IdBadgeProps {
  label: string
  variant?: "id" | "text"
  href?: string
  className?: string
}

export function TableBadge({ label, href, variant = "id", className }: IdBadgeProps) {
  const parts = label.split("-");
  const parsedLabel = variant == "id" && parts.length >= 4 ? label.split("-")[4] : label
  return (
    <Fragment>
      {variant == "id" ?
        href ? 
        <Link href={href}>
          <Badge className={cn(['px-3 py-1', className])}>
            {parsedLabel}
          </Badge>
        </Link>
        :
        <Badge className={cn(['px-3 py-1', className])}>
          {parsedLabel}
        </Badge>
        :
        href ? 
        <Link href={href} className='underline'>
            {parsedLabel}
        </Link>
        :
        <span>
          parsedLabel
        </span>
      }
    </Fragment>
  )
}
