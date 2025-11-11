"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Bill, getDaysUntilDue, isDueSoon, isOverdue } from "@/types/bills"
import { TableBadge } from "@/components/id-badge"
import { BillsActions } from "./form"
import { AlertCircle, Clock, CheckCircle } from "lucide-react"

export const columns: ColumnDef<Bill>[] = [
  {
    accessorKey: "provider",
    header: "Proveedor",
    meta: {
      filterVariant: "text",
      className: "w-2/12",
    }
  },
  {
    accessorKey: "category",
    header: "Categoría",
    meta: {
      filterVariant: "select",
      className: "w-1/12",
    },
    cell(props) {
      return (
        <TableBadge
          label={props.row.original.category}
          className="capitalize"
        />
      )
    },
  },
  {
    accessorKey: "cycle",
    header: "Ciclo",
    meta: {
      filterVariant: "select",
      className: "w-1/12",
    },
    cell(props) {
      return (
        <span className="text-sm capitalize">{props.row.original.cycle}</span>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    meta: {
      filterVariant: "range",
      className: "w-2/12",
    },
    cell(props) {
      return <span className="font-medium">${props.row.original.amount.toLocaleString('es-ES')}</span>
    },
  },
  {
    accessorKey: "dueDate",
    header: "Vencimiento",
    meta: {
      filterVariant: "date",
      className: "w-2/12",
    },
    cell(props) {
      const bill = props.row.original
      const dueDate = new Date(bill.dueDate)
      const daysUntil = getDaysUntilDue(bill.dueDate)
      const overdue = isOverdue(bill)
      const dueSoon = isDueSoon(bill)

      return (
        <div className="flex flex-col">
          <span className="font-medium">{dueDate.toLocaleDateString('es-ES')}</span>
          {bill.status === "pendiente" && (
            <span className={`text-xs flex items-center gap-1 ${
              overdue ? 'text-red-600' : dueSoon ? 'text-yellow-600' : 'text-muted-foreground'
            }`}>
              {overdue ? (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Vencido hace {Math.abs(daysUntil)} días
                </>
              ) : dueSoon ? (
                <>
                  <Clock className="h-3 w-3" />
                  Vence en {daysUntil} días
                </>
              ) : (
                <>
                  En {daysUntil} días
                </>
              )}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    meta: {
      filterVariant: "select",
      className: "w-1/12",
    },
    cell(props) {
      const status = props.row.original.status
      const overdue = isOverdue(props.row.original)

      let className = ""
      let displayStatus = status

      if (status === "pagado") {
        className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      } else if (overdue) {
        className = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        displayStatus = "vencido"
      } else {
        className = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      }

      return (
        <TableBadge
          label={displayStatus}
          className={`${className} capitalize`}
        />
      )
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Fecha Pago",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      const paymentDate = props.row.original.paymentDate
      if (!paymentDate) return <span className="text-muted-foreground text-sm">-</span>

      const date = new Date(paymentDate)
      return (
        <div className="flex items-center gap-1 text-sm">
          <CheckCircle className="h-3 w-3 text-green-600" />
          {date.toLocaleDateString('es-ES')}
        </div>
      )
    },
  },
  {
    id: "alerts",
    header: "Alertas",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      const bill = props.row.original
      const overdue = isOverdue(bill)
      const dueSoon = isDueSoon(bill, 3) // Alerta crítica 3 días antes

      if (bill.status === "pagado") return null

      return (
        <div className="flex gap-1">
          {overdue && (
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">
              <AlertCircle className="h-3 w-3" />
              Vencido
            </div>
          )}
          {!overdue && dueSoon && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              Urgente
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <BillsActions bill={row.original} />,
  },
]
