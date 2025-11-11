"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateMovementForm } from "./form"
import { Movement } from "@/types/movements"

// Datos de ejemplo para la UI
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
  // const { data, refetch } = useQuery<Movement[]>({
  //   queryKey: ['movements'],
  //   queryFn: () => {
  //     return fetch('/api/movements').then(res => res.json());
  //   },
  //   staleTime: 1000*60*60*24
  // })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title="Movimientos" />
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
        <DataTable columns={columns} data={mockMovements} />
      </section>
    </div>
  )
}