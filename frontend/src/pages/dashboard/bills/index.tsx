"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateBillForm } from "./form"
import { type Bill } from "@web-project/types/bills"
import DashboardLayout from "@/layouts/dashboard"
import { useQueryFetch } from "@/hooks/user-query-fetch"
import { API_ENDPOINTS } from "@/lib/api-config"
import { transformBills } from "@/lib/api-transformers"

// Datos de ejemplo para la UI (fallback)
const mockBills: Bill[] = [
  {
    id: "1",
    provider: "Edenor",
    category: "electricidad",
    cycle: "bimestral",
    amount: 45000,
    dueDate: "2025-10-25",
    status: "pendiente",
    autoRenew: true,
    description: "Servicio eléctrico residencial",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    provider: "Aysa",
    category: "agua",
    cycle: "mensual",
    amount: 12000,
    dueDate: "2025-10-28",
    status: "pendiente",
    autoRenew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    provider: "Telecom",
    category: "internet",
    cycle: "mensual",
    amount: 25000,
    dueDate: "2025-10-15",
    status: "pagado",
    paymentDate: "2025-10-14",
    attachment: "https://example.com/comprobante-telecom.pdf",
    autoRenew: true,
    description: "Internet 300 Mbps",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    provider: "Netflix",
    category: "streaming",
    cycle: "mensual",
    amount: 8500,
    dueDate: "2025-10-20",
    status: "vencido",
    autoRenew: true,
    description: "Plan Premium",
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    provider: "Metrogas",
    category: "gas",
    cycle: "bimestral",
    amount: 35000,
    dueDate: "2025-11-05",
    status: "pendiente",
    autoRenew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "6",
    provider: "Seguros Rivadavia",
    category: "seguro",
    cycle: "mensual",
    amount: 18000,
    dueDate: "2025-10-30",
    status: "pendiente",
    autoRenew: true,
    description: "Seguro de hogar",
    createdAt: new Date().toISOString()
  }
]

export default function Bills() {
  const { data, isLoading, error } = useQueryFetch<unknown[]>({
    url: API_ENDPOINTS.bills,
    queryKey: ['bills']
  })

  const bills = data ? transformBills(data) : mockBills;

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Recibos y Servicios" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
              Error al cargar los recibos. Usando datos de ejemplo.
            </div>
          )}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando recibos...</div>
            </div>
          ) : (
            <DataTable columns={columns} data={bills} />
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
