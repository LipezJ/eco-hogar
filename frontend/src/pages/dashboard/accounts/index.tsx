import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateAccountForm } from "./form"
import { AccountsStats } from "@/components/stats/accounts"
import DashboardLayout from "@/layouts/dashboard"
import { useSuspenseQueryFetch } from "@/hooks/use-query-fetch"
import { API_ENDPOINTS } from "@/lib/api-config"
import { transformAccounts } from "@/lib/api-transformers"
import { Suspense } from "react"
import { PageLoadingSkeleton } from "@/components/loading-skeleton"

/** Contenido principal de cuentas (stats, formulario y tabla). */
function AccountsContent() {
  const { data, refetch } = useSuspenseQueryFetch<unknown[]>({
    url: API_ENDPOINTS.accounts,
    queryKey: ['accounts']
  })

  const accounts = transformAccounts(data);

  return (
    <>
      <AccountsStats accounts={accounts} />
      <div className="flex justify-end">
        <FormDialog
          title="Nueva cuenta"
          description="Complete los datos de la nueva cuenta bancaria"
          form={<CreateAccountForm />}
          className="sm:max-w-[700px]"
        >
          <Button>
            <Plus />
            Nueva cuenta
          </Button>
        </FormDialog>
      </div>
      <DataTable columns={columns} data={accounts} refresh={refetch} exportTo={true} />
    </>
  )
}

export default function Accounts() {
  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Cuentas Bancarias" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          <Suspense fallback={<PageLoadingSkeleton />}>
            <AccountsContent />
          </Suspense>
        </section>
      </div>
    </DashboardLayout>
  )
}
