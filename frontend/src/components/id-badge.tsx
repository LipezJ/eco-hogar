import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Link } from '@/lib/router';
import { Fragment } from 'react'

interface IdBadgeProps {
  label: string
  variant?: "id" | "text"
  href?: string
  className?: string
}

/**
 * Badge reutilizable para IDs o texto, con soporte de enlace.
 * @param label Texto completo (para IDs se recorta la 5ta parte).
 * @param variant Modo "id" o "text".
 * @param href URL opcional para envolver en Link.
 * @param className clases adicionales.
 */
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
          {parsedLabel}
        </span>
      }
    </Fragment>
  )
}
