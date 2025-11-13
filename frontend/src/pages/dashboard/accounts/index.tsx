import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateAccountForm } from "./form"
import { type Account } from "@web-project/types/accounts"
import { AccountsStats } from "@/components/stats/accounts"
import DashboardLayout from "@/layouts/dashboard"
import { useQueryFetch } from "@/hooks/user-query-fetch"
import { API_ENDPOINTS } from "@/lib/api-config"
import { transformAccounts } from "@/lib/api-transformers"

// Datos de ejemplo para la UI (fallback)
const mockAccounts: Account[] = [
  {
    id: "1",
    name: "Cuenta Principal",
    institution: "Banco Nación",
    accountType: "ahorro",
    accountNumber: "****1234",
    currency: "ARS",
    balance: 850000,
    isNational: true,
    owner: "Juan Pérez",
    status: "activa",
    description: "Cuenta de ahorro principal",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Caja de Ahorro Dólares",
    institution: "Banco Galicia",
    accountType: "ahorro",
    accountNumber: "****5678",
    currency: "USD",
    balance: 5000,
    isNational: true,
    owner: "Juan Pérez",
    status: "activa",
    description: "Ahorro en dólares",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Cuenta Corriente Empresa",
    institution: "BBVA",
    accountType: "corriente",
    accountNumber: "****9012",
    currency: "ARS",
    balance: 1250000,
    isNational: true,
    owner: "María García",
    status: "activa",
    description: "Cuenta corriente para gastos de empresa",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "PayPal",
    institution: "PayPal",
    accountType: "inversion",
    currency: "USD",
    balance: 1200,
    isNational: false,
    owner: "Juan Pérez",
    status: "activa",
    description: "Cuenta PayPal internacional",
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "Cuenta Nómina",
    institution: "Banco Santander",
    accountType: "nomina",
    accountNumber: "****3456",
    currency: "ARS",
    balance: 450000,
    isNational: true,
    owner: "María García",
    status: "activa",
    createdAt: new Date().toISOString()
  },
  {
    id: "6",
    name: "Euros en Banco Europa",
    institution: "Banco Santander España",
    accountType: "ahorro",
    accountNumber: "****7890",
    currency: "EUR",
    balance: 3500,
    isNational: false,
    owner: "Juan Pérez",
    status: "activa",
    description: "Cuenta en euros",
    createdAt: new Date().toISOString()
  },
  {
    id: "7",
    name: "Efectivo en Casa",
    institution: "Efectivo",
    accountType: "efectivo",
    currency: "ARS",
    balance: 120000,
    isNational: true,
    owner: "Familiar",
    status: "activa",
    description: "Dinero en efectivo guardado",
    createdAt: new Date().toISOString()
  }
]

export default function Accounts() {
  const { data, isLoading, error } = useQueryFetch<unknown[]>({
    url: API_ENDPOINTS.accounts,
    queryKey: ['accounts']
  })

  const accounts = data ? transformAccounts(data) : mockAccounts;

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Cuentas Bancarias" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
              Error al cargar las cuentas. Usando datos de ejemplo.
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando cuentas...</div>
            </div>
          ) : (
            <AccountsStats accounts={accounts} />
          )}

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
          {!isLoading && <DataTable columns={columns} data={accounts} />}
        </section>
      </div>
    </DashboardLayout>
  )
}
