"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateMovementForm } from "./form"
import { type Movement } from "@web-project/types/movements"
import DashboardLayout from "@/layouts/dashboard"
import { useQueryFetch } from "@/hooks/user-query-fetch"
import { API_ENDPOINTS } from "@/lib/api-config"
import { transformMovements } from "@/lib/api-transformers"

// Datos de ejemplo para la UI (fallback)
const mockMovements: Movement[] = [
  {
    id: "1",
    type: "egreso",
    category: "comida",
    amount: 45000,
    description: "Compra en supermercado",
    tags: ["supermercado", "mensual"],
    date: "2025-10-20",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    type: "ingreso",
    category: "otros",
    amount: 500000,
    description: "Salario mensual",
    tags: ["salario"],
    date: "2025-10-15",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    type: "egreso",
    category: "transporte",
    amount: 25000,
    description: "Recarga transporte público",
    tags: ["transporte"],
    date: "2025-10-18",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    type: "egreso",
    category: "servicios",
    amount: 80000,
    description: "Pago de internet",
    tags: ["servicios", "mensual"],
    date: "2025-10-10",
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    type: "egreso",
    category: "ocio",
    amount: 35000,
    description: "Cine con amigos",
    tags: ["entretenimiento"],
    attachment: "https://example.com/ticket.pdf",
    date: "2025-10-19",
    createdAt: new Date().toISOString()
  }
]

export default function Movements() {
  const { data, isLoading, error } = useQueryFetch<unknown[]>({
    url: API_ENDPOINTS.movements,
    queryKey: ['movements']
  })

  const movements = data ? transformMovements(data) : mockMovements;

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Movimientos" />
        {error && (
          <div className="container mx-auto px-4 pt-4">
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
              Error al cargar los movimientos. Usando datos de ejemplo.
            </div>
          </div>
        )}
        <section className="container mx-auto pt-4 px-4 space-y-4">
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando movimientos...</div>
            </div>
          ) : (
            <DataTable columns={columns} data={movements} />
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}