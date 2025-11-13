import { SiteHeader } from "@/components/site-header";
import { MovementsStats } from "@/components/stats/movements";
import { MovementsReports } from "@/components/reports/movements-reports";
import { DebtsStats } from "@/components/stats/debts";
import { BillsStats } from "@/components/stats/bills";
import { BillsReports } from "@/components/reports/bills-reports";
import { CdtsStats } from "@/components/stats/cdts";
import { CdtsReports } from "@/components/reports/cdts-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Payment, generateAmortizationTable } from "@web-project/types/debts";
import { Wallet, CreditCard, FileText, PiggyBank } from "lucide-react";
import DashboardLayout from "@/layouts/dashboard";
import { useSuspenseQueryFetch } from "@/hooks/user-query-fetch";
import { API_ENDPOINTS } from "@/lib/api-config";
import { transformMovements, transformDebts, transformBills, transformCdts } from "@/lib/api-transformers";
import { Suspense } from "react";
import { StatsLoadingSkeleton, ReportsLoadingSkeleton } from "@/components/loading-skeleton";

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

  const debts = transformDebts(debtsData);
  const allPayments: Payment[] = debts.flatMap(debt => generateAmortizationTable(debt));

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

export default function Home() {

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Dashboard" />
        <section className="container mx-auto pt-4 px-4">
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
  
