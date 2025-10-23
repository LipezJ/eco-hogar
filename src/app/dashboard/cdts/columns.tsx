"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Cdt, getDaysRemaining, calculateProgress, calculateAccruedInterest, isDueSoon } from "@/types/cdts"
import { TableBadge } from "@/components/id-badge"
import { CdtsActions } from "./form"
import { TrendingUp, Clock, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export const columns: ColumnDef<Cdt>[] = [
  {
    accessorKey: "institution",
    header: "Institución",
    meta: {
      filterVariant: "text",
      className: "w-2/12",
    }
  },
  {
    accessorKey: "openingDate",
    header: "Apertura",
    meta: {
      filterVariant: "date",
      className: "w-1/12",
    },
    cell(props) {
      const date = new Date(props.row.original.openingDate)
      return <span>{date.toLocaleDateString('es-ES')}</span>
    },
  },
  {
    accessorKey: "initialAmount",
    header: "Monto Inicial",
    meta: {
      filterVariant: "range",
      className: "w-1/12",
    },
    cell(props) {
      return <span className="font-medium">${props.row.original.initialAmount.toLocaleString('es-ES')}</span>
    },
  },
  {
    accessorKey: "interestRate",
    header: "Tasa",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      return (
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span className="font-medium">{props.row.original.interestRate}%</span>
        </div>
      )
    },
  },
  {
    id: "interestEarned",
    header: "Interés Acumulado",
    meta: {
      className: "w-2/12",
    },
    cell(props) {
      const cdt = props.row.original
      const accruedInterest = calculateAccruedInterest(
        cdt.initialAmount,
        cdt.interestRate,
        cdt.openingDate
      )
      const totalInterest = cdt.finalAmount - cdt.initialAmount

      return (
        <div className="flex flex-col">
          <span className="font-medium text-green-600">
            +${accruedInterest.toLocaleString('es-ES')}
          </span>
          <span className="text-xs text-muted-foreground">
            de ${totalInterest.toLocaleString('es-ES')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "finalAmount",
    header: "Monto Final",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      return (
        <span className="font-bold text-green-600">
          ${props.row.original.finalAmount.toLocaleString('es-ES')}
        </span>
      )
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
      const cdt = props.row.original
      const dueDate = new Date(cdt.dueDate)
      const daysRemaining = getDaysRemaining(cdt.dueDate)
      const dueSoon = isDueSoon(cdt, 30)

      return (
        <div className="flex flex-col">
          <span className="font-medium">{dueDate.toLocaleDateString('es-ES')}</span>
          {cdt.status === "activo" && (
            <span className={`text-xs flex items-center gap-1 ${
              daysRemaining < 0 ? 'text-red-600' : dueSoon ? 'text-yellow-600' : 'text-muted-foreground'
            }`}>
              {daysRemaining < 0 ? (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Vencido
                </>
              ) : dueSoon ? (
                <>
                  <Clock className="h-3 w-3" />
                  Faltan {daysRemaining} días
                </>
              ) : (
                <>
                  Faltan {daysRemaining} días
                </>
              )}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "progress",
    header: "Progreso",
    meta: {
      className: "w-2/12",
    },
    cell(props) {
      const cdt = props.row.original
      const progress = calculateProgress(cdt.openingDate, cdt.dueDate)

      return (
        <div className="flex flex-col gap-1">
          <Progress value={progress} className="h-2" />
          <span className="text-xs text-muted-foreground">
            {progress.toFixed(0)}% transcurrido
          </span>
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

      let className = ""
      if (status === "activo") {
        className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      } else if (status === "vencido") {
        className = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      } else {
        className = "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      }

      return (
        <TableBadge
          label={status}
          className={`${className} capitalize`}
        />
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CdtsActions cdt={row.original} />,
  },
]
