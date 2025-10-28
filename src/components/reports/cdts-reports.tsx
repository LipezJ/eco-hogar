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
import { Cdt, calculateInterestEarned } from "@/types/cdts"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  TrendingUp,
  Building2,
} from "lucide-react"

interface CdtsReportsProps {
  cdts: Cdt[]
}

// Colores para gráficos
const COLORS = {
  activo: "hsl(142, 71%, 45%)",
  vencido: "hsl(45, 93%, 47%)",
  cancelado: "hsl(0, 84%, 60%)",
}

// Paleta de colores determinista para gráficos de torta
const PIE_COLORS = [
  "hsl(200, 70%, 50%)",
  "hsl(150, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(30, 70%, 50%)",
  "hsl(340, 70%, 50%)",
  "hsl(60, 70%, 50%)",
  "hsl(180, 70%, 50%)",
  "hsl(240, 70%, 50%)",
]

const chartConfig = {
  activo: {
    label: "Activo",
    color: COLORS.activo,
  },
  vencido: {
    label: "Vencido",
    color: COLORS.vencido,
  },
  cancelado: {
    label: "Cancelado",
    color: COLORS.cancelado,
  },
  initialAmount: {
    label: "Capital Inicial",
    color: "hsl(217, 91%, 60%)",
  },
  interest: {
    label: "Interés",
    color: "hsl(142, 71%, 45%)",
  },
} satisfies ChartConfig

export function CdtsReports({ cdts }: CdtsReportsProps) {
  // Filtrar CDTs activos
  const activeCdts = cdts.filter(c => c.status === "activo")

  // Datos por institución
  const byInstitution = activeCdts.reduce((acc, cdt) => {
    if (!acc[cdt.institution]) {
      acc[cdt.institution] = {
        institution: cdt.institution,
        initialAmount: 0,
        interest: 0
      }
    }
    acc[cdt.institution].initialAmount += cdt.initialAmount
    acc[cdt.institution].interest += calculateInterestEarned(cdt.initialAmount, cdt.finalAmount)
    return acc
  }, {} as Record<string, { institution: string; initialAmount: number; interest: number }>)

  const institutionData = Object.values(byInstitution)

  // Datos de distribución por estado
  const statusData = [
    { name: "Activo", value: cdts.filter(c => c.status === "activo").length, fill: COLORS.activo },
    { name: "Vencido", value: cdts.filter(c => c.status === "vencido").length, fill: COLORS.vencido },
    { name: "Cancelado", value: cdts.filter(c => c.status === "cancelado").length, fill: COLORS.cancelado },
  ].filter(item => item.value > 0)

  // Distribución de capital por institución para torta
  const pieChartData = Object.entries(
    activeCdts.reduce((acc, cdt) => {
      acc[cdt.institution] = (acc[cdt.institution] || 0) + cdt.initialAmount
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value], index) => ({
    name,
    value,
    fill: PIE_COLORS[index % PIE_COLORS.length]
  }))

  // KPIs
  const totalInvested = activeCdts.reduce((sum, c) => sum + c.initialAmount, 0)
  const totalReturn = activeCdts.reduce((sum, c) => sum + c.finalAmount, 0)
  const avgRate = activeCdts.length > 0
    ? activeCdts.reduce((sum, c) => sum + c.interestRate, 0) / activeCdts.length
    : 0

  // Top CDTs por rentabilidad
  const topCdts = [...activeCdts]
    .sort((a, b) => {
      const interestA = calculateInterestEarned(a.initialAmount, a.finalAmount)
      const interestB = calculateInterestEarned(b.initialAmount, b.finalAmount)
      return interestB - interestA
    })
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Capital Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalInvested.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Invertido actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retorno Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalReturn.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Al vencimiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Anual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de capital e interés por institución */}
      {institutionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inversión por Institución</CardTitle>
            <CardDescription>Capital inicial vs Interés esperado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={institutionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="institution"
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
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="initialAmount" fill="var(--color-initialAmount)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interest" fill="var(--color-interest)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráficos lado a lado */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribución de capital */}
        {pieChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Capital</CardTitle>
              <CardDescription>Por institución financiera</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent
                      formatter={(value) => `$${Number(value).toLocaleString('es-ES')}`}
                    />}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Estado de CDTs */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de CDTs</CardTitle>
            <CardDescription>Cantidad por estado</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent
                    formatter={(value) => `${value} CDT${Number(value) !== 1 ? 's' : ''}`}
                  />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top CDTs por rentabilidad */}
      {topCdts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 CDTs por Rentabilidad
            </CardTitle>
            <CardDescription>Inversiones con mayor retorno esperado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCdts.map((cdt, index) => {
                const interest = calculateInterestEarned(cdt.initialAmount, cdt.finalAmount)
                const roi = (interest / cdt.initialAmount) * 100

                return (
                  <div key={cdt.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500 text-white">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{cdt.institution}</p>
                            <p className="text-xs text-muted-foreground">
                              {cdt.interestRate}% anual • {cdt.term} días
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +${interest.toLocaleString('es-ES')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ROI: {roi.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Capital: ${cdt.initialAmount.toLocaleString('es-ES')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Final: ${cdt.finalAmount.toLocaleString('es-ES')}
                        </Badge>
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
