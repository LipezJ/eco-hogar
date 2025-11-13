import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateCdtForm } from "./form"
import DashboardLayout from "@/layouts/dashboard"
import { useSuspenseQueryFetch } from "@/hooks/user-query-fetch"
import { API_ENDPOINTS } from "@/lib/api-config"
import { transformCdts } from "@/lib/api-transformers"
import { Suspense } from "react"
import { TableLoadingSkeleton } from "@/components/loading-skeleton"

function CdtsContent() {
  const { data, refetch } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.cdts,
    queryKey: ['cdts']
  })

  const cdts = transformCdts(data);

  return (
    <>
      <div className="flex justify-end">
        <FormDialog
          title="Nuevo CDT"
          description="Complete los datos del nuevo Certificado de Depósito a Término"
          form={<CreateCdtForm />}
          className="sm:max-w-[700px]"
        >
          <Button>
            <Plus />
            Nuevo CDT
          </Button>
        </FormDialog>
      </div>
      <DataTable columns={columns} data={cdts} refresh={refetch} />
    </>
  )
}

export default function Cdts() {
  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="CDTs - Certificados de Depósito a Término" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          <Suspense fallback={<TableLoadingSkeleton />}>
            <CdtsContent />
          </Suspense>
        </section>
      </div>
    </DashboardLayout>
  )
}
