import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Debt, type Payment } from "@web-project/types/debts"
import { Check, AlertCircle, Calendar, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useQueryFetch } from "@/hooks/use-query-fetch"
import { transformPayment, transformPayments } from "@/lib/api-transformers"
import { useQueryClient } from "@tanstack/react-query"

interface PaymentsViewProps {
  debt: Debt
  onClose: () => void
}

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

export function PaymentsView({ debt, onClose }: PaymentsViewProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [savingPaymentId, setSavingPaymentId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = useQueryFetch<unknown[]>({
    url: `${API_ENDPOINTS.debts}/${debt.id}/payments`,
    queryKey: ['debt-payments', debt.id],
    staleTime: 0
  })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (Array.isArray(data)) {
      setPayments(transformPayments(data))
    }
  }, [data])

  const togglePayment = async (paymentId: string) => {
    if (savingPaymentId) return

    const originalPayment = payments.find(p => p.id === paymentId)
    if (!originalPayment) return

    const optimisticPayment: Payment = {
      ...originalPayment,
      isPaid: !originalPayment.isPaid,
      paidDate: !originalPayment.isPaid ? new Date().toISOString() : undefined
    }

    setSavingPaymentId(paymentId)
    setUpdateError(null)
    setPayments(prev =>
      prev.map(p => p.id === paymentId ? optimisticPayment : p)
    )

    try {
      const response = await fetch(`${API_ENDPOINTS.debts}/${debt.id}/payments/${paymentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPaid: optimisticPayment.isPaid,
          paidDate: optimisticPayment.paidDate
        })
      })

      if (!response.ok) {
        throw new Error('No se pudo actualizar el pago')
      }

      const saved = transformPayment(await response.json())
      setPayments(prev =>
        prev.map(p => p.id === paymentId ? saved : p)
      )
      refetch()
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
    } catch (updateErr) {
      console.error('Error updating payment:', updateErr)
      setPayments(prev =>
        prev.map(p => p.id === paymentId ? originalPayment : p)
      )
      setUpdateError('Hubo un error al actualizar el pago. Intente nuevamente.')
    } finally {
      setSavingPaymentId(null)
    }
  }

  const totalPaid = payments.filter(p => p.isPaid).length
  const totalInstallments = payments.length || debt.installments
  const completion = totalInstallments ? ((totalPaid / totalInstallments) * 100) : 0
  const totalInterest = payments.reduce((sum, p) => sum + p.interest, 0)
  const paidInterest = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.interest, 0)
  const totalToPay = payments.length
    ? payments.reduce((sum, p) => sum + p.amount, 0)
    : debt.amount + totalInterest

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

  const isInitialLoading = isLoading && payments.length === 0
  const loadError = isError && payments.length === 0

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="py-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Progreso</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1 text-sm">
            <div className="text-xl font-semibold">{totalPaid}/{totalInstallments}</div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              {completion.toFixed(0)}% completado
            </p>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Interés Total</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1 text-sm">
            <div className="text-xl font-semibold">${formatCurrency(totalInterest)}</div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              ${formatCurrency(paidInterest)} pagado
            </p>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total a Pagar</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1 text-sm">
            <div className="text-xl font-semibold">
              ${formatCurrency(totalToPay)}
            </div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
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
            {isInitialLoading && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando pagos...
              </div>
            )}

            {loadError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error instanceof Error ? error.message : 'No se pudieron cargar los pagos.'}
              </div>
            )}

            {!isInitialLoading && !loadError && payments.length === 0 && (
              <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                No hay pagos generados para esta deuda.
              </div>
            )}

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
                    dueSoon && !payment.isPaid && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900",
                    savingPaymentId === payment.id && "opacity-70 pointer-events-none"
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
                      <div className="font-bold">${formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        Cap: ${formatCurrency(payment.principal)} · Int: ${formatCurrency(payment.interest)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {updateError && (
            <p className="mt-4 text-sm text-destructive">{updateError}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  )
}
