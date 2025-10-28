"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Debt, Payment, generateAmortizationTable } from "@/types/debts"
import { Check, AlertCircle, Calendar } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface PaymentsViewProps {
  debt: Debt
  onClose: () => void
}

export function PaymentsView({ debt, onClose }: PaymentsViewProps) {
  const [payments, setPayments] = useState<Payment[]>(() => generateAmortizationTable(debt))

  const togglePayment = (paymentId: string) => {
    setPayments(prev => prev.map(p =>
      p.id === paymentId
        ? { ...p, isPaid: !p.isPaid, paidDate: !p.isPaid ? new Date().toISOString() : undefined }
        : p
    ))
  }

  const totalPaid = payments.filter(p => p.isPaid).length
  const totalInterest = payments.reduce((sum, p) => sum + p.interest, 0)
  const paidInterest = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.interest, 0)

  const isOverdue = (payment: Payment) => {
    if (payment.isPaid) return false
    return new Date(payment.dueDate) < new Date()
  }

  const isDueSoon = (payment: Payment) => {
    if (payment.isPaid) return false
    const dueDate = new Date(payment.dueDate)
    const now = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPaid}/{debt.installments}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPaid / debt.installments) * 100).toFixed(0)}% completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Interés Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInterest.toLocaleString('es-ES')}</div>
            <p className="text-xs text-muted-foreground">
              ${paidInterest.toLocaleString('es-ES')} pagado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(debt.amount + totalInterest).toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground">
              Capital + intereses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Pagos</CardTitle>
          <CardDescription>
            Haga clic en cada pago para marcarlo como pagado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {payments.map((payment) => {
              const dueDate = new Date(payment.dueDate)
              const overdue = isOverdue(payment)
              const dueSoon = isDueSoon(payment)

              return (
                <div
                  key={payment.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent",
                    payment.isPaid && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                    overdue && !payment.isPaid && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
                    dueSoon && !payment.isPaid && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
                  )}
                  onClick={() => togglePayment(payment.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full",
                      payment.isPaid ? "bg-green-600 text-white" : "bg-muted"
                    )}>
                      {payment.isPaid ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{payment.installmentNumber}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Cuota #{payment.installmentNumber}
                        </span>
                        {overdue && !payment.isPaid && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        {dueSoon && !payment.isPaid && (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dueDate.toLocaleDateString('es-ES')}
                        {payment.isPaid && payment.paidDate && (
                          <span className="text-green-600">
                            · Pagado {new Date(payment.paidDate).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">${payment.amount.toLocaleString('es-ES')}</div>
                      <div className="text-xs text-muted-foreground">
                        Cap: ${payment.principal.toLocaleString('es-ES')} · Int: ${payment.interest.toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  )
}
