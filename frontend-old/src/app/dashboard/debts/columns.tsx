"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Debt, calculateMonthlyPayment, calculateRemainingBalance, generateAmortizationTable } from "@/types/debts"
import { TableBadge } from "@/components/id-badge"
import { DebtsActions } from "./form"

export const createColumns = (onViewPayments: (debt: Debt) => void): ColumnDef<Debt>[] => [
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
          label={type === "deuda" ? "Deuda" : "Préstamo"}
          className={type === "deuda" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}
        />
      )
    },
  },
  {
    accessorKey: "origin",
    header: "Origen/Destino",
    meta: {
      filterVariant: "text",
      className: "w-2/12",
    }
  },
  {
    accessorKey: "amount",
    header: "Monto Total",
    meta: {
      filterVariant: "range",
      className: "w-1/12",
    },
    cell(props) {
      return <span>${props.row.original.amount.toLocaleString('es-ES')}</span>
    },
  },
  {
    accessorKey: "interestRate",
    header: "Tasa",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      return <span>{props.row.original.interestRate}%</span>
    },
  },
  {
    id: "monthlyPayment",
    header: "Cuota Mensual",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      const debt = props.row.original
      const monthlyPayment = calculateMonthlyPayment(
        debt.amount,
        debt.interestRate,
        debt.installments
      )
      return <span className="font-medium">${monthlyPayment.toLocaleString('es-ES')}</span>
    },
  },
  {
    accessorKey: "installments",
    header: "Cuotas",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      const debt = props.row.original
      const payments = generateAmortizationTable(debt)
      const paidCount = payments.filter(p => p.isPaid).length
      return (
        <span className="text-sm">
          {paidCount}/{debt.installments}
        </span>
      )
    },
  },
  {
    id: "remainingBalance",
    header: "Saldo Restante",
    meta: {
      className: "w-2/12",
    },
    cell(props) {
      const debt = props.row.original
      const payments = generateAmortizationTable(debt)
      const remaining = calculateRemainingBalance(debt, payments)
      const percentage = ((remaining / debt.amount) * 100).toFixed(0)

      return (
        <div className="flex flex-col">
          <span className="font-medium">${remaining.toLocaleString('es-ES')}</span>
          <span className="text-xs text-muted-foreground">{percentage}% restante</span>
        </div>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: "Inicio",
    meta: {
      filterVariant: "date",
      className: "w-1/12",
    },
    cell(props) {
      const date = new Date(props.row.original.startDate)
      return <span>{date.toLocaleDateString('es-ES')}</span>
    },
  },
  {
    accessorKey: "paymentDay",
    header: "Día Pago",
    meta: {
      className: "w-1/12",
    },
    cell(props) {
      return <span>{props.row.original.paymentDay}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DebtsActions debt={row.original} onViewPayments={onViewPayments} />,
  },
]
