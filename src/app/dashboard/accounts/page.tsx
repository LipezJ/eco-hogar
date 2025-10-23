"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateAccountForm } from "./form"
import { Account } from "@/types/accounts"
import { AccountsStats } from "@/components/stats/accounts"

// Datos de ejemplo para la UI
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
  // const { data, refetch } = useQuery<Account[]>({
  //   queryKey: ['accounts'],
  //   queryFn: () => {
  //     return fetch('/api/accounts').then(res => res.json());
  //   },
  //   staleTime: 1000*60*60*24
  // })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title="Cuentas Bancarias" />
      <section className="container mx-auto pt-4 px-4 space-y-4">
        <AccountsStats accounts={mockAccounts} />

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
        <DataTable columns={columns} data={mockAccounts} />
      </section>
    </div>
  )
}
