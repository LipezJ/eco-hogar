"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Account, formatCurrency, convertToBase, getCurrencyName } from "@/types/accounts"
import { TableBadge } from "@/components/id-badge"
import { AccountsActions } from "./form"
import { Globe, MapPin, User } from "lucide-react"

export const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    meta: {
      filterVariant: "text",
      className: "w-3/12",
    },
    cell(props) {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{props.row.original.name}</span>
          <span className="text-xs text-muted-foreground">
            {props.row.original.institution}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "accountType",
    header: "Tipo",
    meta: {
      filterVariant: "select",
      className: "w-1/12",
    },
    cell(props) {
      return (
        <TableBadge
          label={props.row.original.accountType}
          className="capitalize"
        />
      )
    },
  },
  {
    accessorKey: "owner",
    header: "Titular",
    meta: {
      filterVariant: "select",
      className: "w-2/12",
    },
    cell(props) {
      return (
        <div className="flex items-center gap-1 text-sm">
          <User className="h-3 w-3 text-muted-foreground" />
          {props.row.original.owner}
        </div>
      )
    },
  },
  {
    accessorKey: "currency",
    header: "Moneda",
    meta: {
      filterVariant: "select",
      className: "w-1/12",
    },
    cell(props) {
      const currency = props.row.original.currency
      return (
        <div className="flex flex-col">
          <span className="font-medium">{currency}</span>
          <span className="text-xs text-muted-foreground">
            {getCurrencyName(currency)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "balance",
    header: "Saldo",
    meta: {
      filterVariant: "range",
      className: "w-2/12",
    },
    cell(props) {
      const account = props.row.original
      const formatted = formatCurrency(account.balance, account.currency)
      const inBase = convertToBase(account.balance, account.currency)

      return (
        <div className="flex flex-col">
          <span className="font-bold text-green-600">{formatted}</span>
          {account.currency !== "ARS" && (
            <span className="text-xs text-muted-foreground">
              ≈ ${inBase.toLocaleString('es-ES')} ARS
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "isNational",
    header: "Ubicación",
    meta: {
      filterVariant: "select",
      className: "w-1/12",
    },
    cell(props) {
      const isNational = props.row.original.isNational
      return (
        <div className="flex items-center gap-1">
          {isNational ? (
            <>
              <MapPin className="h-3 w-3 text-blue-600" />
              <span className="text-sm">Nacional</span>
            </>
          ) : (
            <>
              <Globe className="h-3 w-3 text-purple-600" />
              <span className="text-sm">Extranjera</span>
            </>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "accountNumber",
    header: "Número",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      const number = props.row.original.accountNumber
      if (!number) return <span className="text-muted-foreground text-sm">-</span>

      return <span className="text-sm font-mono">{number}</span>
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
      if (status === "activa") {
        className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      } else if (status === "inactiva") {
        className = "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      } else {
        className = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
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
    cell: ({ row }) => <AccountsActions account={row.original} />,
  },
]
