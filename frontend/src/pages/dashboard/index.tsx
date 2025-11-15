import { SiteHeader } from "@/components/site-header";
import { MovementsStats } from "@/components/stats/movements";
import { MovementsReports } from "@/components/reports/movements-reports";
import { DebtsStats } from "@/components/stats/debts";
import { BillsStats } from "@/components/stats/bills";
import { BillsReports } from "@/components/reports/bills-reports";
import { CdtsStats } from "@/components/stats/cdts";
import { CdtsReports } from "@/components/reports/cdts-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Payment } from "@web-project/types/debts";
import { Wallet, CreditCard, FileText, PiggyBank, TrendingUp, TrendingDown } from "lucide-react";
import DashboardLayout from "@/layouts/dashboard";
import { useSuspenseQueryFetch } from "@/hooks/user-query-fetch";
import { API_ENDPOINTS } from "@/lib/api-config";
import { transformMovements, transformDebts, transformBills, transformCdts, transformPayments } from "@/lib/api-transformers";
import { Suspense } from "react";
import { StatsLoadingSkeleton, ReportsLoadingSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { BudgetSummaryResponse } from "@web-project/types/budget";
import { formatCurrency } from "@web-project/types/accounts";

// Componentes con datos que usan Suspense
function MovementsContent() {
  const { data: movementsData } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.movements,
    queryKey: ['movements']
  })

  const movements = transformMovements(movementsData);

  return (
    <>
      <MovementsStats movements={movements} />
      <MovementsReports movements={movements} />
    </>
  )
}

function DebtsContent() {
  const { data: debtsData } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.debts,
    queryKey: ['debts']
  })

  const { data: paymentsData } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.payments,
    queryKey: ['payments']
  })

  const debts = transformDebts(debtsData);
  const allPayments: Payment[] = transformPayments(paymentsData);

  return <DebtsStats debts={debts} payments={allPayments} />
}

function BillsContent() {
  const { data: billsData } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.bills,
    queryKey: ['bills']
  })

  const bills = transformBills(billsData);

  return (
    <>
      <BillsStats bills={bills} />
      <BillsReports bills={bills} />
    </>
  )
}

function CdtsContent() {
  const { data: cdtsData } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.cdts,
    queryKey: ['cdts']
  })

  const cdts = transformCdts(cdtsData);

  return (
    <>
      <CdtsStats cdts={cdts} />
      <CdtsReports cdts={cdts} />
    </>
  )
}

function DashboardOverview() {
  const now = new Date();
  const month = String(now.getMonth() + 1);
  const year = String(now.getFullYear());

  const { data: movementsData } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.movements,
    queryKey: ['movements'],
  });
  const { data: budgetData } = useSuspenseQueryFetch<BudgetSummaryResponse>({
    url: API_ENDPOINTS.budget,
    queryKey: ['budget', year, month],
    params: { year, month },
  });

  const movements = transformMovements(movementsData);

  const totalIncome = movements.reduce((sum, movement) => movement.type === "ingreso" ? sum + movement.amount : sum, 0);
  const totalExpenses = movements.reduce((sum, movement) => movement.type === "egreso" ? sum + movement.amount : sum, 0);

  const budgetCurrency = budgetData.config?.currency ?? "COP";
  const budgetUsage = Math.min(budgetData.summary.overall.usagePercentage, 100);

  return (
    <section className="space-y-3">
      <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
        <Card className="col-span-1 md:col-span-1 h-full p-4 gap-1 md:gap-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-0">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Ingresos
            </CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-0 py-0 space-y-0.5">
            <div className="text-base font-semibold leading-tight">{formatCurrency(totalIncome, budgetCurrency)}</div>
            <p className="text-[10px] text-muted-foreground">{movements.length} movimientos</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-1 h-full p-4 gap-1 md:gap-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-0">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Egresos
            </CardTitle>
            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
          </CardHeader>
          <CardContent className="px-0 py-0 space-y-0.5">
            <div className="text-base font-semibold leading-tight">{formatCurrency(totalExpenses, budgetCurrency)}</div>
            <p className="text-[10px] text-muted-foreground">{movements.filter(m => m.type === "egreso").length} movimientos</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-3 h-full flex flex-col gap-1 py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Presupuesto
            </CardTitle>
            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-semibold">{formatCurrency(budgetData.summary.overall.used, budgetCurrency)}</span>
              <span className="text-[11px] text-muted-foreground">
                de {formatCurrency(budgetData.summary.overall.limit, budgetCurrency)} configurados
              </span>
            </div>
            <Progress value={budgetUsage} className="h-1" />
            <div className="grid gap-2 grid-cols-3 text-[11px]">
              <div>
                <p className="text-muted-foreground">Restante</p>
                <p className={`font-semibold ${budgetData.summary.overall.remaining < 0 ? "text-destructive" : ""}`}>
                  {formatCurrency(budgetData.summary.overall.remaining, budgetCurrency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Uso</p>
                <p className="font-semibold">{budgetUsage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Impacto CDTs</p>
                <p className="font-semibold">{formatCurrency(budgetData.summary.totals.cdts.invested, budgetCurrency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function Home() {

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Dashboard" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          <Suspense fallback={<StatsLoadingSkeleton />}>
            <DashboardOverview />
          </Suspense>
          <Tabs defaultValue="movements" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
              <TabsTrigger value="movements" className="flex items-center gap-2 text-xs sm:text-sm">
                <Wallet className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Movimientos</span>
                <span className="sm:hidden">Movim.</span>
              </TabsTrigger>
              <TabsTrigger value="debts" className="flex items-center gap-2 text-xs sm:text-sm">
                <CreditCard className="h-4 w-4 shrink-0" />
                Deudas
              </TabsTrigger>
              <TabsTrigger value="bills" className="flex items-center gap-2 text-xs sm:text-sm">
                <FileText className="h-4 w-4 shrink-0" />
                Recibos
              </TabsTrigger>
              <TabsTrigger value="cdts" className="flex items-center gap-2 text-xs sm:text-sm">
                <PiggyBank className="h-4 w-4 shrink-0" />
                CDTs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="movements" className="my-4 space-y-4">
              <Suspense fallback={
                <>
                  <StatsLoadingSkeleton />
                  <ReportsLoadingSkeleton />
                </>
              }>
                <MovementsContent />
              </Suspense>
            </TabsContent>
            <TabsContent value="debts" className="my-4">
              <Suspense fallback={<StatsLoadingSkeleton />}>
                <DebtsContent />
              </Suspense>
            </TabsContent>
            <TabsContent value="bills" className="my-4 space-y-4">
              <Suspense fallback={
                <>
                  <StatsLoadingSkeleton />
                  <ReportsLoadingSkeleton />
                </>
              }>
                <BillsContent />
              </Suspense>
            </TabsContent>
            <TabsContent value="cdts" className="my-4 space-y-4">
              <Suspense fallback={
                <>
                  <StatsLoadingSkeleton />
                  <ReportsLoadingSkeleton />
                </>
              }>
                <CdtsContent />
              </Suspense>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </DashboardLayout>
  );
}
  
