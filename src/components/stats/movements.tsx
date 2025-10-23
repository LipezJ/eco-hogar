"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Movement } from "@/types/movements"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Bus,
  Home,
  Coffee,
  Briefcase,
  MoreHorizontal
} from "lucide-react"

interface MovementsStatsProps {
  movements: Movement[]
}

// Mapeo de íconos por categoría
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  comida: ShoppingCart,
  transporte: Bus,
  servicios: Home,
  ocio: Coffee,
  otros: MoreHorizontal
}

// Mapeo de colores por categoría
const categoryColors: Record<string, string> = {
  comida: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  transporte: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  servicios: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  ocio: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  otros: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
}

export function MovementsStats({ movements }: MovementsStatsProps) {
  // Calcular estadísticas
  const totalIngresos = movements
    .filter(m => m.type === "ingreso")
    .reduce((sum, m) => sum + m.amount, 0)

  const totalEgresos = movements
    .filter(m => m.type === "egreso")
    .reduce((sum, m) => sum + m.amount, 0)

  const balance = totalIngresos - totalEgresos

  const countIngresos = movements.filter(m => m.type === "ingreso").length
  const countEgresos = movements.filter(m => m.type === "egreso").length

  // Análisis por categorías
  const categoriasPorGasto = movements
    .filter(m => m.type === "egreso")
    .reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + m.amount
      return acc
    }, {} as Record<string, number>)

  const categoriasOrdenadas = Object.entries(categoriasPorGasto)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalEgresos) * 100
    }))

  // Promedio por transacción
  const promedioEgreso = countEgresos > 0 ? totalEgresos / countEgresos : 0
  const promedioIngreso = countIngresos > 0 ? totalIngresos / countIngresos : 0

  // Movimientos recientes (últimos 5)
  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Tasa de ahorro
  const tasaAhorro = totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Resumen principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Balance Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}${Math.abs(balance).toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {balance >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3" />
                  Superávit
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3" />
                  Déficit
                </>
              )}
            </p>
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground">
              Tasa de ahorro: <span className="font-semibold">{tasaAhorro.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalIngresos.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {countIngresos} {countIngresos === 1 ? 'transacción' : 'transacciones'}
            </p>
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground">
              Promedio: ${promedioIngreso.toLocaleString('es-ES')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Egresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${totalEgresos.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {countEgresos} {countEgresos === 1 ? 'transacción' : 'transacciones'}
            </p>
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground">
              Promedio: ${promedioEgreso.toLocaleString('es-ES')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {movements.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total de movimientos</p>
            <Separator className="my-2" />
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                +{countIngresos}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                -{countEgresos}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribución por categorías */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Distribución de Gastos
            </CardTitle>
            <CardDescription>Egresos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            {categoriasOrdenadas.length > 0 ? (
              <div className="space-y-4">
                {categoriasOrdenadas.map(({ category, amount, percentage }) => {
                  const Icon = categoryIcons[category] || MoreHorizontal
                  const colorClass = categoryColors[category] || categoryColors.otros

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">{category}</p>
                            <p className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}% del total
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">${amount.toLocaleString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay egresos registrados
              </p>
            )}
          </CardContent>
        </Card>

        {/* Movimientos recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Movimientos Recientes
            </CardTitle>
            <CardDescription>Últimas transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {recentMovements.map((movement) => {
                  const Icon = categoryIcons[movement.category] || MoreHorizontal
                  const colorClass = categoryColors[movement.category] || categoryColors.otros
                  const isIncome = movement.type === "ingreso"

                  return (
                    <div key={movement.id} className="flex items-start gap-3">
                      <Avatar className={`${colorClass} h-10 w-10`}>
                        <AvatarFallback className={colorClass}>
                          <Icon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium leading-none">
                              {movement.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {movement.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                              {isIncome ? '+' : '-'}${movement.amount.toLocaleString('es-ES')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(movement.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                        {movement.tags && movement.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {movement.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
