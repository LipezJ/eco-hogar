"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Movement } from "@/types/movements"
import { TableBadge } from "@/components/id-badge"
import { MovementsActions } from "./form"

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
          variant="text"
          className={type === "ingreso" ? "bg-green-500" : "bg-red-500"}
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
    id: "actions",
    cell: ({ row }) => <MovementsActions movement={row.original} />,
  },
]