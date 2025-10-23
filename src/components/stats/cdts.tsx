"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Cdt,
  getTotalInvested,
  getTotalExpectedReturn,
  getTotalExpectedInterest,
  getUpcomingCdts,
  calculateProgress,
  getDaysRemaining,
  calculateAccruedInterest
} from "@/types/cdts"
import {
  TrendingUp,
  Wallet,
  Clock,
  Percent,
  Building2,
  Calendar
} from "lucide-react"

interface CdtsStatsProps {
  cdts: Cdt[]
}

export function CdtsStats({ cdts }: CdtsStatsProps) {
  // Estadísticas generales
  const activeCdts = cdts.filter(c => c.status === "activo")
  const totalInvested = getTotalInvested(cdts)
  const totalExpectedReturn = getTotalExpectedReturn(cdts)
  const totalExpectedInterest = getTotalExpectedInterest(cdts)

  // Interés acumulado hasta la fecha
  const totalAccruedInterest = activeCdts.reduce((sum, cdt) =>
    sum + calculateAccruedInterest(cdt.initialAmount, cdt.interestRate, cdt.openingDate), 0
  )

  // CDTs próximos a vencer (30 días)
  const upcomingCdts = getUpcomingCdts(cdts, 30)

  // Tasa promedio
  const avgRate = activeCdts.length > 0
    ? activeCdts.reduce((sum, c) => sum + c.interestRate, 0) / activeCdts.length
    : 0

  // ROI (Return on Investment)
  const roi = totalInvested > 0 ? (totalExpectedInterest / totalInvested) * 100 : 0

  // Agrupar por institución
  const byInstitution = activeCdts.reduce((acc, cdt) => {
    acc[cdt.institution] = (acc[cdt.institution] || 0) + cdt.initialAmount
    return acc
  }, {} as Record<string, number>)

  const topInstitutions = Object.entries(byInstitution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Invertido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${totalInvested.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En {activeCdts.length} CDT{activeCdts.length !== 1 ? 's' : ''} activo{activeCdts.length !== 1 ? 's' : ''}
            </p>
            <Separator className="my-2" />
            <div className="flex items-center gap-2">
              <Percent className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Tasa promedio: <span className="font-semibold">{avgRate.toFixed(2)}%</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Retorno Esperado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalExpectedReturn.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Al vencimiento</p>
            <Separator className="my-2" />
            <div className="text-xs">
              ROI: <span className="font-semibold text-green-600">+{roi.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Interés Esperado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              ${totalExpectedInterest.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ganancia total</p>
            <Separator className="my-2" />
            <div className="text-xs">
              Acumulado: <span className="font-semibold">${totalAccruedInterest.toLocaleString('es-ES')}</span>
            </div>
            <Progress
              value={totalExpectedInterest > 0 ? (totalAccruedInterest / totalExpectedInterest) * 100 : 0}
              className="mt-1 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Próximos Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {upcomingCdts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">En los próximos 30 días</p>
            <Separator className="my-2" />
            <Badge variant="secondary" className="text-xs">
              ${upcomingCdts.reduce((sum, c) => sum + c.finalAmount, 0).toLocaleString('es-ES')}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Inversiones por institución */}
      {topInstitutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Inversiones por Institución
            </CardTitle>
            <CardDescription>Distribución del capital invertido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInstitutions.map(([institution, amount]) => {
                const percentage = totalInvested > 0 ? (amount / totalInvested) * 100 : 0

                return (
                  <div key={institution} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{institution}</p>
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% del total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${amount.toLocaleString('es-ES')}</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CDTs Activos con progreso */}
      {activeCdts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              CDTs Activos
            </CardTitle>
            <CardDescription>Progreso de maduración de inversiones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCdts.map((cdt) => {
                const progress = calculateProgress(cdt.openingDate, cdt.dueDate)
                const daysRemaining = getDaysRemaining(cdt.dueDate)
                const accruedInterest = calculateAccruedInterest(
                  cdt.initialAmount,
                  cdt.interestRate,
                  cdt.openingDate
                )
                const expectedInterest = cdt.finalAmount - cdt.initialAmount
                const isNearDue = daysRemaining <= 30 && daysRemaining > 0

                return (
                  <div key={cdt.id} className="space-y-2 p-3 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{cdt.institution}</p>
                        <p className="text-xs text-muted-foreground">
                          {cdt.interestRate}% anual • {cdt.term} días
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${cdt.finalAmount.toLocaleString('es-ES')}</p>
                        <p className="text-xs text-green-600">
                          +${expectedInterest.toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Capital: ${cdt.initialAmount.toLocaleString('es-ES')}</span>
                        <span>Acumulado: ${accruedInterest.toLocaleString('es-ES')}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{progress.toFixed(1)}% completado</span>
                        {isNearDue ? (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                            Vence en {daysRemaining} días
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {daysRemaining} días restantes
                          </span>
                        )}
                      </div>
                    </div>

                    {cdt.description && (
                      <p className="text-xs text-muted-foreground mt-2">{cdt.description}</p>
                    )}
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
