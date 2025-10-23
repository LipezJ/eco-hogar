"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Bill, getUpcomingBills, getOverdueBills, getDaysUntilDue } from "@/types/bills"
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Droplet,
  Flame,
  Wifi,
  Home,
  Shield
} from "lucide-react"

interface BillsStatsProps {
  bills: Bill[]
}

// Mapeo de íconos por categoría
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  electricidad: Zap,
  agua: Droplet,
  gas: Flame,
  internet: Wifi,
  telefono: Wifi,
  cable: Wifi,
  streaming: Wifi,
  alquiler: Home,
  condominio: Home,
  seguro: Shield,
}

// Mapeo de colores por categoría
const categoryColors: Record<string, string> = {
  electricidad: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  agua: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  gas: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  internet: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  telefono: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  cable: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  streaming: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  alquiler: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  condominio: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  seguro: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  otros: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
}

export function BillsStats({ bills }: BillsStatsProps) {
  // Estadísticas generales
  const totalBills = bills.length
  const paidBills = bills.filter(b => b.status === "pagado").length
  const pendingBills = bills.filter(b => b.status === "pendiente").length
  const overdueBills = getOverdueBills(bills)
  const upcomingBills = getUpcomingBills(bills, 7)

  // Totales de dinero
  const totalPaid = bills
    .filter(b => b.status === "pagado")
    .reduce((sum, b) => sum + b.amount, 0)

  const totalPending = bills
    .filter(b => b.status === "pendiente")
    .reduce((sum, b) => sum + b.amount, 0)

  const totalOverdue = overdueBills.reduce((sum, b) => sum + b.amount, 0)

  // Porcentaje de pago
  const paymentRate = totalBills > 0 ? (paidBills / totalBills) * 100 : 0

  // Gastos por categoría
  const categoryTotals = bills
    .filter(b => b.status === "pagado")
    .reduce((acc, bill) => {
      acc[bill.category] = (acc[bill.category] || 0) + bill.amount
      return acc
    }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Recibos más próximos
  const nextBills = bills
    .filter(b => b.status === "pendiente")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total de Recibos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBills}</div>
            <p className="text-xs text-muted-foreground mt-1">Servicios registrados</p>
            <Separator className="my-2" />
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {paidBills} pagados
              </Badge>
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                {pendingBills} pendientes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Total Pagado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalPaid.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">En este período</p>
            <Separator className="my-2" />
            <div className="text-xs">
              Tasa de pago: <span className="font-semibold">{paymentRate.toFixed(0)}%</span>
            </div>
            <Progress value={paymentRate} className="mt-1 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              ${totalPending.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por pagar</p>
            <Separator className="my-2" />
            <Badge variant="outline" className="text-xs">
              {upcomingBills.length} próximos a vencer
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${totalOverdue.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
            <Separator className="my-2" />
            <Badge variant="destructive" className="text-xs">
              {overdueBills.length} {overdueBills.length === 1 ? 'recibo' : 'recibos'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Próximos vencimientos */}
      {nextBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximos Vencimientos
            </CardTitle>
            <CardDescription>Recibos pendientes ordenados por fecha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextBills.map((bill) => {
                const Icon = categoryIcons[bill.category] || FileText
                const colorClass = categoryColors[bill.category] || categoryColors.otros
                const daysUntil = getDaysUntilDue(bill.dueDate)
                const isUrgent = daysUntil <= 3 && daysUntil >= 0
                const isOverdue = daysUntil < 0

                return (
                  <div key={bill.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{bill.provider}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {bill.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">${bill.amount.toLocaleString('es-ES')}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bill.dueDate).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        {isOverdue ? (
                          <Badge variant="destructive" className="text-xs">
                            Vencido hace {Math.abs(daysUntil)} días
                          </Badge>
                        ) : isUrgent ? (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                            Vence en {daysUntil} {daysUntil === 1 ? 'día' : 'días'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Vence en {daysUntil} días
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
