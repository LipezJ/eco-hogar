"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Movement } from "@/types/movements"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface MovementsStatsProps {
  movements: Movement[]
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

  // Categoría con más gastos
  const categoriasPorGasto = movements
    .filter(m => m.type === "egreso")
    .reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + m.amount
      return acc
    }, {} as Record<string, number>)

  const topCategoria = Object.entries(categoriasPorGasto)
    .sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Ingresos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">
            Total Ingresos
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl text-green-600">
            ${totalIngresos.toLocaleString('es-ES')}
          </div>
          <p className="text-xs text-muted-foreground">
            {countIngresos} {countIngresos === 1 ? 'ingreso' : 'ingresos'}
          </p>
        </CardContent>
      </Card>

      {/* Total Egresos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">
            Total Egresos
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl text-red-600">
            ${totalEgresos.toLocaleString('es-ES')}
          </div>
          <p className="text-xs text-muted-foreground">
            {countEgresos} {countEgresos === 1 ? 'egreso' : 'egresos'}
          </p>
        </CardContent>
      </Card>

      {/* Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">
            Balance
          </CardTitle>
          <Wallet className={`h-4 w-4 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}${balance.toLocaleString('es-ES')}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
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
        </CardContent>
      </Card>

      {/* Categoría con más gastos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">
            Mayor Gasto
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {topCategoria ? (
            <>
              <div className="text-2xl capitalize">
                {topCategoria[0]}
              </div>
              <p className="text-xs text-muted-foreground">
                ${topCategoria[1].toLocaleString('es-ES')} gastados
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl text-muted-foreground">
                -
              </div>
              <p className="text-xs text-muted-foreground">
                Sin egresos aún
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
