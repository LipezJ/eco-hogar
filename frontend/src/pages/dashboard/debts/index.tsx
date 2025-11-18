import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { createColumns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog, FormDialogStandalone } from "@/components/form-dialog"
import { CreateDebtForm } from "./form"
import { type Debt } from "@web-project/types/debts"
import { useState, Suspense } from "react"
import { PaymentsView } from "./payments"
import DashboardLayout from "@/layouts/dashboard"
import { useSuspenseQueryFetch } from "@/hooks/use-query-fetch"
import { API_ENDPOINTS } from "@/lib/api-config"
import { transformDebts, transformPayments } from "@/lib/api-transformers"
import { TableLoadingSkeleton } from "@/components/loading-skeleton"

/** Contenido de deudas: formulario, tabla y vista de pagos. */
function DebtsContent({
  onViewPayments
}: {
  onViewPayments: (debt: Debt) => void
}) {
  const { data, refetch } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.debts,
    queryKey: ['debts']
  })

  const { data: paymentsData, refetch: refetchPayments } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.payments,
    queryKey: ['payments']
  })

  const debts = transformDebts(data);
  const payments = transformPayments(paymentsData);
  const columns = createColumns(onViewPayments, payments)
  const refreshAll = () => {
    void refetch()
    void refetchPayments()
  }

  return (
    <>
      <div className="flex justify-end">
        <FormDialog
          title="Nueva deuda/préstamo"
          description="Complete los datos de la nueva deuda o préstamo"
          form={<CreateDebtForm />}
          className="sm:max-w-[700px]"
        >
          <Button>
            <Plus />
            Nueva deuda/préstamo
          </Button>
        </FormDialog>
      </div>
      <DataTable columns={columns} data={debts} refresh={refreshAll} exportTo={true} />
    </>
  )
}

export default function Debts() {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [paymentsOpen, setPaymentsOpen] = useState(false)

  const handleViewPayments = (debt: Debt) => {
    setSelectedDebt(debt)
    setPaymentsOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Deudas y Préstamos" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          <Suspense fallback={<TableLoadingSkeleton />}>
            <DebtsContent onViewPayments={handleViewPayments} />
          </Suspense>
        </section>

        {/* Modal de Pagos */}
        <FormDialogStandalone
          open={paymentsOpen}
          setOpen={setPaymentsOpen}
          title={selectedDebt ? `Pagos - ${selectedDebt.origin}` : "Pagos"}
          description={selectedDebt ? `${selectedDebt.type === "deuda" ? "Deuda" : "Préstamo"} de $${selectedDebt.amount.toLocaleString('es-ES')}` : ""}
          className="sm:max-w-[900px]"
        >
          {selectedDebt && (
            <PaymentsView
              debt={selectedDebt}
              onClose={() => setPaymentsOpen(false)}
            />
          )}
        </FormDialogStandalone>
      </div>
    </DashboardLayout>
  )
}
