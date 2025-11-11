"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Debt, Payment, calculateRemainingBalance, getUpcomingPayments } from "@/types/debts"
import { CreditCard, HandCoins, Calendar, Percent, Clock } from "lucide-react"

interface DebtsStatsProps {
  debts: Debt[]
  payments: Payment[]
}

export function DebtsStats({ debts, payments }: DebtsStatsProps) {
  // Separar deudas y préstamos
  const deudas = debts.filter(d => d.type === "deuda")
  const prestamos = debts.filter(d => d.type === "prestamo")

  // Calcular detalles de cada deuda
  const deudasWithDetails = deudas.map(debt => {
    const debtPayments = payments.filter(p => p.debtId === debt.id)
    const remaining = calculateRemainingBalance(debt, debtPayments)
    const paid = debt.amount - remaining
    const progress = (paid / debt.amount) * 100
    const paidInstallments = debtPayments.filter(p => p.isPaid).length

    return { ...debt, remaining, paid, progress, paidInstallments }
  })

  const prestamosWithDetails = prestamos.map(debt => {
    const debtPayments = payments.filter(p => p.debtId === debt.id)
    const remaining = calculateRemainingBalance(debt, debtPayments)
    const paid = debt.amount - remaining
    const progress = (paid / debt.amount) * 100
    const paidInstallments = debtPayments.filter(p => p.isPaid).length

    return { ...debt, remaining, paid, progress, paidInstallments }
  })

  // Calcular totales
  const totalDeudas = deudasWithDetails.reduce((sum, d) => sum + d.remaining, 0)
  const totalPrestamos = prestamosWithDetails.reduce((sum, d) => sum + d.remaining, 0)
  const balanceNeto = totalPrestamos - totalDeudas

  // Pagos próximos
  const upcomingPayments = getUpcomingPayments(payments, 7)
  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0)

  // Promedio de tasa de interés
  const avgInterestRate = debts.length > 0
    ? debts.reduce((sum, d) => sum + d.interestRate, 0) / debts.length
    : 0

  return (
    <div className="space-y-4">
      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Balance de Deudas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${balanceNeto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balanceNeto >= 0 ? '+' : ''}${Math.abs(balanceNeto).toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balanceNeto >= 0 ? 'A tu favor' : 'En tu contra'}
            </p>
            <Separator className="my-2" />
            <div className="flex justify-between text-xs">
              <span className="text-green-600">Préstamos: ${totalPrestamos.toLocaleString('es-ES')}</span>
              <span className="text-red-600">Deudas: ${totalDeudas.toLocaleString('es-ES')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Próximos Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length > 0 ? (
              <>
                <div className="text-3xl font-bold text-orange-600">
                  ${totalUpcoming.toLocaleString('es-ES')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  En los próximos 7 días
                </p>
                <Separator className="my-2" />
                <Badge variant="secondary" className="text-xs">
                  {upcomingPayments.length} {upcomingPayments.length === 1 ? 'cuota' : 'cuotas'}
                </Badge>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-muted-foreground">-</div>
                <p className="text-xs text-muted-foreground mt-1">Sin pagos próximos</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Tasa Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {avgInterestRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Interés anual promedio</p>
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground">
              {debts.length} {debts.length === 1 ? 'cuenta activa' : 'cuentas activas'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Distribución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="text-xs">Deudas</Badge>
                <span className="text-sm font-semibold">{deudas.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="default" className="text-xs bg-green-600">Préstamos</Badge>
                <span className="text-sm font-semibold">{prestamos.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalles de deudas */}
      {deudasWithDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              Deudas Activas
            </CardTitle>
            <CardDescription>Progreso de pago de tus deudas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deudasWithDetails.map((debt) => (
              <div key={debt.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{debt.origin}</p>
                    <p className="text-xs text-muted-foreground">{debt.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {debt.interestRate}% anual
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pagado: ${debt.paid.toLocaleString('es-ES')}</span>
                    <span>Restante: ${debt.remaining.toLocaleString('es-ES')}</span>
                  </div>
                  <Progress value={debt.progress} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {debt.paidInstallments} de {debt.installments} cuotas
                    </span>
                    <span className="font-medium">{debt.progress.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detalles de préstamos */}
      {prestamosWithDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-green-600" />
              Préstamos Otorgados
            </CardTitle>
            <CardDescription>Dinero que te deben</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prestamosWithDetails.map((debt) => (
              <div key={debt.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{debt.origin}</p>
                    <p className="text-xs text-muted-foreground">{debt.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2 border-green-600 text-green-600">
                    {debt.interestRate}% anual
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Recibido: ${debt.paid.toLocaleString('es-ES')}</span>
                    <span>Por cobrar: ${debt.remaining.toLocaleString('es-ES')}</span>
                  </div>
                  <Progress value={debt.progress} className="h-2 [&>div]:bg-green-600" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {debt.paidInstallments} de {debt.installments} cuotas
                    </span>
                    <span className="font-medium">{debt.progress.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
