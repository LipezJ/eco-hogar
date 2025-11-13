import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateMovementForm } from "./form"
import DashboardLayout from "@/layouts/dashboard"
import { useSuspenseQueryFetch } from "@/hooks/user-query-fetch"
import { API_ENDPOINTS } from "@/lib/api-config"
import { transformMovements } from "@/lib/api-transformers"
import { Suspense } from "react"
import { TableLoadingSkeleton } from "@/components/loading-skeleton"

function MovementsContent() {
  const { data, refetch } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.movements,
    queryKey: ['movements']
  })

  const movements = transformMovements(data);

  return (
    <>
      <div className="flex justify-end">
        <FormDialog
          title="Nuevo movimiento"
          description="Complete los datos del nuevo movimiento que desea registrar"
          form={<CreateMovementForm />}
          className="sm:max-w-[700px]"
        >
          <Button>
            <Plus />
            Nuevo movimiento
          </Button>
        </FormDialog>
      </div>
      <DataTable columns={columns} data={movements} refresh={refetch} />
    </>
  )
}

export default function Movements() {
  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Movimientos" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          <Suspense fallback={<TableLoadingSkeleton />}>
            <MovementsContent />
          </Suspense>
        </section>
      </div>
    </DashboardLayout>
  )
}