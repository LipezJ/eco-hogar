import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateBillForm } from "./form"
import DashboardLayout from "@/layouts/dashboard"
import { useSuspenseQueryFetch } from "@/hooks/use-query-fetch"
import { API_ENDPOINTS } from "@/lib/api-config"
import { transformBills } from "@/lib/api-transformers"
import { Suspense } from "react"
import { TableLoadingSkeleton } from "@/components/loading-skeleton"

/** Contenido de recibos: formulario y tabla. */
function BillsContent() {
  const { data, refetch } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.bills,
    queryKey: ['bills']
  })

  const bills = transformBills(data);

  return (
    <>
      <div className="flex justify-end">
        <FormDialog
          title="Nuevo recibo"
          description="Complete los datos del nuevo recibo o servicio"
          form={<CreateBillForm />}
          className="sm:max-w-[700px]"
        >
          <Button>
            <Plus />
            Nuevo recibo
          </Button>
        </FormDialog>
      </div>
      <DataTable columns={columns} data={bills} refresh={refetch} exportTo={true} />
    </>
  )
}

export default function Bills() {
  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Recibos y Servicios" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          <Suspense fallback={<TableLoadingSkeleton />}>
            <BillsContent />
          </Suspense>
        </section>
      </div>
    </DashboardLayout>
  )
}
