"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Movement } from "@/types/movements"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  Award,
  ShoppingCart,
  Bus,
  Home,
  Coffee,
  MoreHorizontal
} from "lucide-react"

interface MovementsReportsProps {
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

// Colores para gráficos
const COLORS = {
  comida: "hsl(25, 95%, 53%)",
  transporte: "hsl(217, 91%, 60%)",
  servicios: "hsl(271, 81%, 56%)",
  ocio: "hsl(330, 81%, 60%)",
  salud: "hsl(150, 80%, 50%)",
  educación: "hsl(200, 70%, 50%)",
  vivienda: "hsl(45, 90%, 55%)",
  otros: "hsl(215, 16%, 47%)",
  ingresos: "hsl(142, 71%, 45%)",
  egresos: "hsl(0, 84%, 60%)",
}

const chartConfig = {
  ingresos: {
    label: "Ingresos",
    color: COLORS.ingresos,
  },
  egresos: {
    label: "Egresos",
    color: COLORS.egresos,
  },
  comida: {
    label: "Comida",
    color: COLORS.comida,
  },
  transporte: {
    label: "Transporte",
    color: COLORS.transporte,
  },
  servicios: {
    label: "Servicios",
    color: COLORS.servicios,
  },
  ocio: {
    label: "Ocio",
    color: COLORS.ocio,
  },
  salud: {
    label: "Salud",
    color: COLORS.salud,
  },
  educación: {
    label: "Educación",
    color: COLORS.educación,
  },
  vivienda: {
    label: "Vivienda",
    color: COLORS.vivienda,
  },
  otros: {
    label: "Otros",
    color: COLORS.otros,
  },
} satisfies ChartConfig

export function MovementsReports({ movements }: MovementsReportsProps) {
  // Tipo para datos mensuales
  type MonthlyDataItem = {
    month: string
    ingresos: number
    egresos: number
    comida: number
    transporte: number
    servicios: number
    ocio: number
    salud: number
    educación: number
    vivienda: number
    otros: number
  }

  // Agrupar por mes
  const monthlyData = movements.reduce((acc, movement) => {
    const date = new Date(movement.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('es-ES', { month: 'short' })

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        ingresos: 0,
        egresos: 0,
        comida: 0,
        transporte: 0,
        servicios: 0,
        ocio: 0,
        salud: 0,
        educación: 0,
        vivienda: 0,
        otros: 0
      }
    }

    if (movement.type === "ingreso") {
      acc[monthKey].ingresos += movement.amount
    } else {
      acc[monthKey].egresos += movement.amount
      acc[monthKey][movement.category] = (acc[monthKey][movement.category] || 0) + movement.amount
    }

    return acc
  }, {} as Record<string, MonthlyDataItem>)

  const monthlyArray = Object.values(monthlyData).sort((a, b) =>
    a.month.localeCompare(b.month)
  )

  // Top 5 gastos
  const top5Gastos = movements
    .filter(m => m.type === "egreso")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const totalEgresos = movements
    .filter(m => m.type === "egreso")
    .reduce((sum, m) => sum + m.amount, 0)

  return (
    <div className="space-y-4">
      {/* Gráfico de tendencia de flujo (Líneas) */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Flujo</CardTitle>
          <CardDescription>Comparación mensual de ingresos vs egresos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={monthlyArray}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent payload={undefined} />} />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="var(--color-ingresos)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="egresos"
                stroke="var(--color-egresos)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráficos lado a lado */}
      <div className="grid gap-4">
        {/* Gráfico de barras - Gastos mensuales por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
            <CardDescription>Desglose mensual</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={monthlyArray}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent payload={undefined} />} />
                <Bar dataKey="comida" stackId="a" fill="var(--color-comida)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="transporte" stackId="a" fill="var(--color-transporte)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="servicios" stackId="a" fill="var(--color-servicios)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ocio" stackId="a" fill="var(--color-ocio)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="salud" stackId="a" fill="var(--color-salud)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="educación" stackId="a" fill="var(--color-educación)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="vivienda" stackId="a" fill="var(--color-vivienda)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="otros" stackId="a" fill="var(--color-otros)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 gastos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top 5 Gastos
          </CardTitle>
          <CardDescription>Los gastos individuales más grandes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {top5Gastos.map((movement, index) => {
              const Icon = categoryIcons[movement.category] || MoreHorizontal

              return (
                <div key={movement.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500 text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{movement.description}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {movement.category} • {new Date(movement.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          ${movement.amount.toLocaleString('es-ES')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((movement.amount / totalEgresos) * 100).toFixed(1)}% del total
                        </p>
                      </div>
                    </div>
                    {movement.tags && movement.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {movement.tags.map((tag) => (
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
        </CardContent>
      </Card>
    </div>
  )
}
