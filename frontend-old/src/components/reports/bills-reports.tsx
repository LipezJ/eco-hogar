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
import { Bill, getTotalByCategory } from "@/types/bills"
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
  Zap,
  Droplet,
  Flame,
  Wifi,
  Home,
  Shield,
  FileText
} from "lucide-react"

interface BillsReportsProps {
  bills: Bill[]
}

// Mapeo de íconos
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
  otros: FileText
}

// Colores para gráficos
const COLORS = {
  electricidad: "hsl(45, 93%, 47%)",
  agua: "hsl(210, 100%, 56%)",
  gas: "hsl(25, 95%, 53%)",
  internet: "hsl(271, 81%, 56%)",
  telefono: "hsl(239, 84%, 67%)",
  cable: "hsl(330, 81%, 60%)",
  streaming: "hsl(0, 84%, 60%)",
  alquiler: "hsl(142, 71%, 45%)",
  condominio: "hsl(173, 80%, 40%)",
  seguro: "hsl(199, 89%, 48%)",
  otros: "hsl(215, 16%, 47%)",
  pagado: "hsl(142, 71%, 45%)",
  pendiente: "hsl(45, 93%, 47%)",
  vencido: "hsl(0, 84%, 60%)",
}

const chartConfig = {
  pagado: {
    label: "Pagado",
    color: COLORS.pagado,
  },
  pendiente: {
    label: "Pendiente",
    color: COLORS.pendiente,
  },
  vencido: {
    label: "Vencido",
    color: COLORS.vencido,
  },
  electricidad: {
    label: "Electricidad",
    color: COLORS.electricidad,
  },
  agua: {
    label: "Agua",
    color: COLORS.agua,
  },
  gas: {
    label: "Gas",
    color: COLORS.gas,
  },
  internet: {
    label: "Internet",
    color: COLORS.internet,
  },
  telefono: {
    label: "Teléfono",
    color: COLORS.telefono,
  },
  cable: {
    label: "Cable",
    color: COLORS.cable,
  },
  streaming: {
    label: "Streaming",
    color: COLORS.streaming,
  },
  alquiler: {
    label: "Alquiler",
    color: COLORS.alquiler,
  },
  condominio: {
    label: "Condominio",
    color: COLORS.condominio,
  },
  seguro: {
    label: "Seguro",
    color: COLORS.seguro,
  },
  otros: {
    label: "Otros",
    color: COLORS.otros,
  },
} satisfies ChartConfig

export function BillsReports({ bills }: BillsReportsProps) {
  // Agrupar por mes
  const monthlyData = bills.reduce((acc, bill) => {
    const date = new Date(bill.dueDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('es-ES', { month: 'short' })

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        pagado: 0,
        pendiente: 0,
        vencido: 0,
      }
    }

    if (bill.status === "pagado") {
      acc[monthKey].pagado += bill.amount
    } else if (bill.status === "pendiente") {
      acc[monthKey].pendiente += bill.amount
    } else if (bill.status === "vencido") {
      acc[monthKey].vencido += bill.amount
    }

    return acc
  }, {} as Record<string, { month: string; pagado: number; pendiente: number; vencido: number }>)

  const monthlyArray = Object.values(monthlyData).sort((a, b) =>
    a.month.localeCompare(b.month)
  )

  // Datos por categoría
  const categoryTotals = getTotalByCategory(bills)
  const pieChartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    fill: COLORS[name as keyof typeof COLORS] || COLORS.otros
  }))

  // Datos por estado
  const statusData = [
    { name: "Pagado", value: bills.filter(b => b.status === "pagado").length, fill: COLORS.pagado },
    { name: "Pendiente", value: bills.filter(b => b.status === "pendiente").length, fill: COLORS.pendiente },
    { name: "Vencido", value: bills.filter(b => b.status === "vencido").length, fill: COLORS.vencido },
  ].filter(item => item.value > 0)

  // KPIs
  const totalPaid = bills.filter(b => b.status === "pagado").reduce((sum, b) => sum + b.amount, 0)
  const totalPending = bills.filter(b => b.status === "pendiente").reduce((sum, b) => sum + b.amount, 0)
  const avgBillAmount = bills.length > 0 ? bills.reduce((sum, b) => sum + b.amount, 0) / bills.length : 0

  // Recibos más costosos
  const topBills = [...bills]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPaid.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En recibos pagados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${totalPending.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por pagar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Recibo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgBillAmount.toLocaleString('es-ES')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monto promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendencia mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Recibos Mensual</CardTitle>
          <CardDescription>Seguimiento de pagos, pendientes y vencidos</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={monthlyArray} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                width={40}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent payload={undefined} />} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="pagado" fill="var(--color-pagado)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendiente" fill="var(--color-pendiente)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vencido" fill="var(--color-vencido)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráficos lado a lado */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribución por categoría */}
        {pieChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
              <CardDescription>Distribución de recibos pagados</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center px-2 sm:px-6">
              <ChartContainer config={chartConfig} className="h-[250px] w-full max-w-[300px]">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const p = ((percent as number) * 100).toFixed(0);
                      return `${name} ${p}%`;
                    }}
                    outerRadius={60}
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

        {/* Estado de recibos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Recibos</CardTitle>
            <CardDescription>Cantidad por estado</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-2 sm:px-6">
            <ChartContainer config={chartConfig} className="h-[250px] w-full max-w-[300px]">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent
                    formatter={(value) => `${value} recibos`}
                  />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top recibos más costosos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Top 5 Recibos Más Costosos
          </CardTitle>
          <CardDescription>Servicios con mayor costo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topBills.map((bill, index) => {
              const Icon = categoryIcons[bill.category] || FileText

              return (
                <div key={bill.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500 text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{bill.provider}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {bill.category} • {bill.cycle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ${bill.amount.toLocaleString('es-ES')}
                        </p>
                        <Badge
                          variant={
                            bill.status === "pagado"
                              ? "default"
                              : bill.status === "vencido"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs mt-1"
                        >
                          {bill.status}
                        </Badge>
                      </div>
                    </div>
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
