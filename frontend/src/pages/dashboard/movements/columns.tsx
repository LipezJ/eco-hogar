import { type ColumnDef } from "@tanstack/react-table"
import { type Movement } from "@web-project/types/movements"
import { TableBadge } from "@/components/id-badge"
import { MovementsActions } from "./form"
import { API_BASE_URL } from "@/lib/api-config"
import { Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<Movement>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
    meta: {
      filterVariant: "date",
      className: "w-2/12",
    },
    cell(props) {
      const date = new Date(props.row.original.date)
      return <span>{date.toLocaleDateString('es-ES')}</span>
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    meta: {
      filterVariant: "select",
      className: "w-1/12",
    },
    cell(props) {
      const type = props.row.original.type
      return (
        <TableBadge
          label={type}
          className={type === "ingreso" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}
        />
      )
    },
  },
  {
    accessorKey: "category",
    header: "Categoría",
    meta: {
      filterVariant: "select",
      className: "w-2/12",
    },
    cell(props) {
      return <TableBadge label={props.row.original.category} />
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    meta: {
      filterVariant: "text",
      className: "w-3/12",
    }
  },
  {
    accessorKey: "amount",
    header: "Monto",
    meta: {
      filterVariant: "range",
      className: "w-2/12",
    },
    cell(props) {
      return <span>${props.row.original.amount.toLocaleString('es-ES')}</span>
    },
  },
  {
    accessorKey: "tags",
    header: "Etiquetas",
    meta: {
      className: "w-2/12",
    },
    cell(props) {
      const tags = props.row.original.tags || []
      if (tags.length === 0) return <span className="text-muted-foreground">-</span>
      return (
        <div className="flex gap-1 flex-wrap">
          {tags.map((tag, idx) => (
            <TableBadge 
              key={idx} 
              label={tag} 
              variant="text"
            />
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "attachment",
    header: "Adjunto",
    meta: {
      className: "w-1/12 text-center",
    },
    cell({ row }) {
      const attachment = row.original.attachment
      if (!attachment) {
        return <span className="text-muted-foreground text-xs">-</span>
      }
      const href = attachment.startsWith("http")
        ? attachment
        : `${API_BASE_URL}${attachment}`
      return (
        <Button asChild size="icon" variant="ghost" className="h-8 w-8" title="Ver adjunto">
          <a href={href} target="_blank" rel="noreferrer">
            <Paperclip className="h-4 w-4" />
          </a>
        </Button>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <MovementsActions movement={row.original} />,
  },
]
